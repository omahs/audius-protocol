const BullQueue = require('bull')
const _ = require('lodash')

const config = require('../../../config')
const {
  QUEUE_HISTORY,
  STATE_MONITORING_QUEUE_NAME,
  STATE_MONITORING_QUEUE_MAX_JOB_RUNTIME_MS,
  STATE_MONITORING_QUEUE_INIT_DELAY_MS
} = require('../stateMachineConstants')
const { logger } = require('../../../logging')
const { getLatestUserIdFromDiscovery } = require('./stateMonitoringUtils')
const processStateMonitoringJob = require('./processStateMonitoringJob')

/**
 * Handles setup and lifecycle management (adding and processing jobs)
 * of the queue that calculates required syncs and replica set updates (handles user slicing, clocks,
 * gathering sync metrics, and computing healthy/unhealthy peers).
 */
class StateMonitoringQueue {
  async init(audiusLibs) {
    this.queue = this.makeQueue(
      config.get('redisHost'),
      config.get('redisPort')
    )
    this.registerQueueEventHandlers({
      queue: this.queue,
      jobSuccessCallback: this.enqueueJobAfterSuccess,
      jobFailureCallback: this.enqueueJobAfterFailure
    })
    this.registerQueueJobProcessor(this.queue)

    await this.startQueue(
      this.queue,
      audiusLibs.discoveryProvider.discoveryProviderEndpoint,
      config.get('snapbackModuloBase')
    )
  }

  logDebug(msg) {
    logger.debug(`StateMonitoringQueue DEBUG: ${msg}`)
  }

  log(msg) {
    logger.info(`StateMonitoringQueue: ${msg}`)
  }

  logWarn(msg) {
    logger.warn(`StateMonitoringQueue WARNING: ${msg}`)
  }

  logError(msg) {
    logger.error(`StateMonitoringQueue ERROR: ${msg}`)
  }

  makeQueue(redisHost, redisPort) {
    // Settings config from https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#advanced-settings
    return new BullQueue(STATE_MONITORING_QUEUE_NAME, {
      redis: {
        host: redisHost,
        port: redisPort
      },
      defaultJobOptions: {
        removeOnComplete: QUEUE_HISTORY,
        removeOnFail: QUEUE_HISTORY
      },
      settings: {
        // Should be sufficiently larger than expected job runtime
        lockDuration: STATE_MONITORING_QUEUE_MAX_JOB_RUNTIME_MS,
        // We never want to re-process stalled jobs
        maxStalledCount: 0
      },
      limiter: {
        // Bull doesn't allow either of these to be set to 0
        max: config.get('stateMonitoringQueueRateLimitJobsPerInterval') || 1,
        duration: config.get('stateMonitoringQueueRateLimitInterval') || 1
      }
    })
  }

  /**
   * Registers event handlers for logging and job success/failure.
   * @param {Object} params.queue the queue to register events for
   * @param {Function<queue, successfulJob, jobResult>} params.jobSuccessCallback the function to call when a job succeeds
   * @param {Function<queue, failedJob>} params.jobFailureCallback the function to call when a job fails
   */
  registerQueueEventHandlers({
    queue,
    jobSuccessCallback,
    jobFailureCallback
  }) {
    // Add handlers for logging
    queue.on('global:waiting', (jobId) => {
      this.log(`Queue Job Waiting - ID ${jobId}`)
    })
    queue.on('global:active', (jobId, jobPromise) => {
      this.log(`Queue Job Active - ID ${jobId}`)
    })
    queue.on('global:lock-extension-failed', (jobId, err) => {
      this.logError(
        `Queue Job Lock Extension Failed - ID ${jobId} - Error ${err}`
      )
    })
    queue.on('global:stalled', (jobId) => {
      this.logError(`stateMachineQueue Job Stalled - ID ${jobId}`)
    })
    queue.on('global:error', (error) => {
      this.logError(`Queue Job Error - ${error}. Queuing another job...`)
    })

    // Add handlers for when a job fails to complete (or completes with an error) or successfully completes
    queue.on('completed', (job, result) => {
      this.log(
        `Queue Job Completed - ID ${job?.id} - Result ${JSON.stringify(
          result
        )}. Queuing another job...`
      )
      if (result?.jobFailed) {
        jobFailureCallback(queue, job)
      } else {
        jobSuccessCallback(queue, job, result)
      }
    })
    queue.on('failed', (job, err) => {
      this.logError(
        `Queue Job Failed - ID ${job?.id} - Error ${err}. Queuing another job...`
      )
      jobFailureCallback(queue, job)
    })
  }

  /**
   * Enqueues a job that processes the next slice of users after the slice
   * that the previous job sucessfully processed.
   * @param queue the StateMonitoringQueue to enqueue a job
   * @param successfulJob the jobData of the previous job that succeeded
   * @param successfulJobResult the result of the previous job that succeeded
   */
  enqueueJobAfterSuccess(queue, successfulJob, successfulJobResult) {
    const {
      data: { discoveryNodeEndpoint, moduloBase, currentModuloSlice }
    } = successfulJob
    const { lastProcessedUserId } = successfulJobResult

    queue.add({
      lastProcessedUserId,
      discoveryNodeEndpoint,
      moduloBase,
      currentModuloSlice: (currentModuloSlice + 1) % moduloBase
    })
  }

  /**
   * Enqueues a job that picks up where the previous failed job left off.
   * @param queue the StateMonitoringQueue to enqueue a job
   * @param failedJob the jobData for the previous job that failed
   */
  enqueueJobAfterFailure(queue, failedJob) {
    const {
      data: {
        lastProcessedUserId,
        discoveryNodeEndpoint,
        moduloBase,
        currentModuloSlice
      }
    } = failedJob

    queue.add({
      lastProcessedUserId,
      discoveryNodeEndpoint,
      moduloBase,
      currentModuloSlice: (currentModuloSlice + 1) % moduloBase
    })
  }

  /**
   * Registers the logic that gets executed to process each new job from the queue.
   * @param {Object} queue the StateMonitoringQueue to consume jobs from
   */
  registerQueueJobProcessor(queue) {
    // Initialize queue job processor (aka consumer)
    queue.process(1 /** concurrency */, async (job) => {
      const {
        id: jobId,
        data: {
          lastProcessedUserId,
          discoveryNodeEndpoint,
          moduloBase,
          currentModuloSlice
        }
      } = job

      try {
        this.log(`New job details: jobId=${jobId}, job=${JSON.stringify(job)}`)
      } catch (e) {
        this.logError(`Failed to log details for jobId=${jobId}: ${e}`)
      }

      // Default results of this job will be passed to the next job, so default to failure
      let result = {
        lastProcessedUserId,
        jobFailed: true,
        moduloBase,
        currentModuloSlice
      }
      try {
        // TODO: Wire up metrics
        // await redis.set('stateMachineQueueLatestJobStart', Date.now())
        result = await processStateMonitoringJob(
          jobId,
          lastProcessedUserId,
          discoveryNodeEndpoint,
          moduloBase,
          currentModuloSlice
        )
        // TODO: Wire up metrics
        // await redis.set('stateMachineQueueLatestJobSuccess', Date.now())
      } catch (e) {
        this.logError(`Error processing jobId ${jobId}: ${e}`)
        console.log(e.stack)
      }

      return result
    })
  }

  /**
   * Clears the queue and adds a job that will start processing users
   * starting from a random userId. Future jobs are added to the queue as a
   * result of this initial job succeeding or failing to complete.
   * @param {Object} queue the StateMonitoringQueue to consume jobs from
   * @param {string} discoveryNodeEndpoint the IP address or URL of a Discovery Node
   * @param {number} moduloBase (DEPRECATED)
   */
  async startQueue(queue, discoveryNodeEndpoint, moduloBase) {
    // Clear any old state if redis was running but the rest of the server restarted
    await queue.obliterate({ force: true })

    // Since we can't pass 0 to Bull's limiter.max, enforce a rate limit of 0 by
    // pausing the queue and not enqueuing the first job
    if (config.get('stateMonitoringQueueRateLimitJobsPerInterval') === 0) {
      await queue.pause()
      return
    }

    // Start at a random userId to avoid biased processing of early users
    const latestUserId = await getLatestUserIdFromDiscovery(
      discoveryNodeEndpoint
    )
    const lastProcessedUserId = _.random(0, latestUserId)
    const currentModuloSlice = this.randomStartingSlice(moduloBase)

    // Enqueue first job after a delay. This job requeues itself upon completion or failure
    await queue.add(
      /** data */
      {
        lastProcessedUserId,
        discoveryNodeEndpoint,
        prevJobFailed: false,
        moduloBase,
        currentModuloSlice
      },
      /** opts */ { delay: STATE_MONITORING_QUEUE_INIT_DELAY_MS }
    )
  }

  // TODO: Remove. https://linear.app/audius/issue/CON-146/clean-up-modulo-slicing-after-all-dns-update-to-support-pagination
  // Randomly select an initial slice
  randomStartingSlice(moduloBase) {
    const slice = Math.floor(Math.random() * Math.floor(moduloBase))
    this.log(`Starting at data slice ${slice}/${moduloBase}`)
    return slice
  }
}

module.exports = StateMonitoringQueue
