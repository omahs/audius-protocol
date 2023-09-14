import { createContext } from 'react'

import type { AudiusSdk } from '@audius/sdk'
import type { Dispatch } from 'redux'

import type { AudiusAPIClient } from 'services/audius-api-client'
import { AudiusBackend } from 'services/index'

import { ReportToSentryArgs } from '../models'

export type AudiusQueryContextType = {
  apiClient: AudiusAPIClient
  audiusSdk: () => Promise<AudiusSdk>
  audiusBackend: AudiusBackend
  dispatch: Dispatch
  reportToSentry: (args: ReportToSentryArgs) => void
}

export const AudiusQueryContext = createContext<AudiusQueryContextType | null>(
  null
)
