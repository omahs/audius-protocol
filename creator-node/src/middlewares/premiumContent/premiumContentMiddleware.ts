import {
  sendResponse,
  errorResponseServerError,
  errorResponseForbidden,
  errorResponseBadRequest
} from '../../apiHelpers'
import { recoverWallet } from '../../apiSigning'
import { NextFunction, Request, Response } from 'express'
import { isPremiumContentMatch } from '../../premiumContent/helpers'
import { PremiumContentType } from '../../premiumContent/types'
import { getRegisteredDiscoveryNodes } from '../../utils/getRegisteredDiscoveryNodes'
import type Logger from 'bunyan'
import { Redis } from 'ioredis'

/**
 * Middleware to validate requests to get premium content.
 * For premium content, CN gets a request with 2 signatures:
 * - one generated by a DN with the premium track/playlist id and wallet from user who has access to it,
 * along with a timestamp,
 * - another from the client generated by the user who is requesting the premium track.
 * This middleware will recover the DN signature and verify that it is from a registered DN.
 * It will also recover the user signature. Then, it will verify that wallet from recovered signature
 * is the same as that of wallet in the DN-signed data, also verify that id and type (track/playlist)
 * of content requested are same as those in the DN-signed data, and also verify that DN-signed data
 * timestamp is relatively recent.
 * If all these verifications are successful, then this middleware will proceed with the request as normal.
 */
export const premiumContentMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      signedDataFromDiscoveryNode,
      signatureFromDiscoveryNode,
      signedDataFromUser,
      signatureFromUser
    } = req.headers

    if (
      !signedDataFromDiscoveryNode ||
      !signatureFromDiscoveryNode ||
      !signedDataFromUser ||
      !signatureFromUser
    ) {
      return sendResponse(
        req,
        res,
        errorResponseBadRequest('Missing request headers.')
      )
    }

    const logger = (req as any).logger as Logger

    const discoveryNodeWallet = recoverWallet(
      signedDataFromDiscoveryNode,
      signatureFromDiscoveryNode
    )
    const isRegisteredDN = await isRegisteredDiscoveryNode({
      wallet: discoveryNodeWallet,
      libs: req.app.get('audiusLibs'),
      logger,
      redis: req.app.get('redisClient')
    })
    if (!isRegisteredDN) {
      return sendResponse(
        req,
        res,
        errorResponseForbidden(
          'Failed discovery node signature validation for premium content.'
        )
      )
    }

    const { premiumContentId, premiumContentType } = req.params

    const userWallet = recoverWallet(signedDataFromUser, signatureFromUser)
    const signedDataFromDiscoveryNodeObj = JSON.parse(
      signedDataFromDiscoveryNode as string
    )
    const isMatch = isPremiumContentMatch({
      signedDataFromDiscoveryNode: signedDataFromDiscoveryNodeObj,
      userWallet,
      premiumContentId: parseInt(premiumContentId),
      premiumContentType: premiumContentType as PremiumContentType,
      logger
    })
    if (!isMatch) {
      return sendResponse(
        req,
        res,
        errorResponseForbidden('Failed match verification for premium content.')
      )
    }

    next()
  } catch (e) {
    const error = `Could not validate premium content access: ${
      (e as Error).message
    }`
    console.error(`${error}.\nError: ${JSON.stringify(e, null, 2)}`)
    return sendResponse(req, res, errorResponseServerError(error))
  }
}

async function isRegisteredDiscoveryNode({
  wallet,
  libs,
  logger,
  redis
}: {
  wallet: string
  libs: any
  logger: Logger
  redis: Redis
}) {
  const allRegisteredDiscoveryNodes = await getRegisteredDiscoveryNodes({
    libs,
    logger,
    redis
  })
  return allRegisteredDiscoveryNodes.some(
    (node) => node.delegateOwnerWallet === wallet
  )
}
