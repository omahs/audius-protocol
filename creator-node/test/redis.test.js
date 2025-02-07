const assert = require('assert')

const redis = require('../src/redis')
const { WalletWriteLock } = redis
const utils = require('../src/utils')

describe('test Redis client', function () {
  /** Reset redis state */
  beforeEach(async function () {
    await redis.flushall()
  })

  it('Confirms redis client connection, and tests GET & SET', async function () {
    assert.equal(await redis.ping(), 'PONG')

    assert.equal(await redis.get('key'), null)

    assert.equal(await redis.set('key', 'value'), 'OK')

    assert.equal(await redis.get('key'), 'value')
  })

  it('Confirms user write locking works', async function () {
    const wallet = 'wallet'
    const defaultExpirationSec =
      WalletWriteLock.WALLET_WRITE_LOCK_EXPIRATION_SEC
    const validAcquirers = WalletWriteLock.VALID_ACQUIRERS

    // Confirm expected initial state

    assert.equal(await WalletWriteLock.isHeld(wallet), false)

    assert.equal(await WalletWriteLock.getCurrentHolder(wallet), null)

    // Acquire lock + confirm expected state

    assert.doesNotReject(
      WalletWriteLock.acquire(wallet, validAcquirers.PrimarySyncFromSecondary)
    )

    assert.equal(await WalletWriteLock.ttl(wallet), defaultExpirationSec)

    assert.equal(await WalletWriteLock.isHeld(wallet), true)

    assert.equal(
      await WalletWriteLock.getCurrentHolder(wallet),
      validAcquirers.PrimarySyncFromSecondary
    )

    assert.equal(await WalletWriteLock.syncIsInProgress(wallet), true)

    // Confirm acquisition fails when already held

    assert.rejects(
      WalletWriteLock.acquire(wallet, validAcquirers.PrimarySyncFromSecondary),
      {
        name: 'Error',
        message: `[acquireWriteLockForWallet][Wallet: ${wallet}] Error: Failed to acquire lock - already held.`
      }
    )

    // Release lock + confirm expected state

    assert.doesNotReject(WalletWriteLock.release(wallet))

    assert.equal(await WalletWriteLock.isHeld(wallet), false)

    assert.equal(await WalletWriteLock.getCurrentHolder(wallet), null)

    assert.equal(await WalletWriteLock.syncIsInProgress(wallet), false)

    // Acquire lock with custom expiration + confirm expected state

    const expirationSec = 1

    assert.doesNotReject(
      WalletWriteLock.acquire(
        wallet,
        validAcquirers.SecondarySyncFromPrimary,
        expirationSec
      )
    )

    assert.equal(await WalletWriteLock.ttl(wallet), expirationSec)

    assert.equal(await WalletWriteLock.isHeld(wallet), true)

    assert.equal(
      await WalletWriteLock.getCurrentHolder(wallet),
      validAcquirers.SecondarySyncFromPrimary
    )

    assert.equal(await WalletWriteLock.syncIsInProgress(wallet), true)

    // Confirm lock auto-expired after expected expiration time (plus a small buffer)

    await utils.timeout(expirationSec * 1000 + 100)

    assert.equal(await WalletWriteLock.isHeld(wallet), false)
  })

  it('Clears write locks', async function () {
    const wallet1 = 'wallet1'
    const wallet2 = 'wallet2'
    const wallet3 = 'wallet3'
    const wallet4 = 'wallet4'

    await WalletWriteLock.acquire(
      wallet1,
      WalletWriteLock.VALID_ACQUIRERS.PrimarySyncFromSecondary
    )

    await WalletWriteLock.acquire(
      wallet2,
      WalletWriteLock.VALID_ACQUIRERS.SecondarySyncFromPrimary
    )

    await WalletWriteLock.acquire(
      wallet3,
      WalletWriteLock.VALID_ACQUIRERS.PrimarySyncFromSecondary
    )

    await WalletWriteLock.acquire(
      wallet4,
      WalletWriteLock.VALID_ACQUIRERS.SecondarySyncFromPrimary
    )

    // Check that all the wallets have a sync lock
    assert.deepEqual(await WalletWriteLock.syncIsInProgress(wallet1), true)
    assert.deepEqual(await WalletWriteLock.syncIsInProgress(wallet2), true)
    assert.deepEqual(await WalletWriteLock.syncIsInProgress(wallet3), true)
    assert.deepEqual(await WalletWriteLock.syncIsInProgress(wallet4), true)

    // Clear all the locks
    await WalletWriteLock.clearWriteLocks()
    assert.deepEqual(await WalletWriteLock.syncIsInProgress(wallet1), false)
    assert.deepEqual(await WalletWriteLock.syncIsInProgress(wallet2), false)
    assert.deepEqual(await WalletWriteLock.syncIsInProgress(wallet3), false)
    assert.deepEqual(await WalletWriteLock.syncIsInProgress(wallet4), false)
  })
})
