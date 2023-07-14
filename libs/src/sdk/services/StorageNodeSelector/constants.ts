import { productionConfig } from '../../config'
import { Auth } from '../Auth/Auth'
import { DiscoveryNodeSelector } from '../DiscoveryNodeSelector'
import type { StorageNodeSelectorConfig } from './types'

export const defaultStorageNodeSelectorConfig: StorageNodeSelectorConfig = {
  bootstrapNodes: productionConfig.storageNodes,
  auth: new Auth(),
  discoveryNodeSelector: new DiscoveryNodeSelector()
}
