import { AudiusClient } from './AudiusClient'
import audius, { Utils } from '@audius/libs'

declare global {
  interface Window {
    AudiusClient: any
    Audius: any
    Utils: any
    Web3: any
    audiusLibs: any
    web3: any
    ethereum: any
    dataWeb3: any
    configuredMetamaskWeb3: any
    isAccountMisconfigured: boolean
  }
}

const Web3 = window.Web3
window.Utils = Utils

const ethRegistryAddress = process.env.REACT_APP_ETH_REGISTRY_ADDRESS
const ethTokenAddress = process.env.REACT_APP_ETH_TOKEN_ADDRESS

const ethProviderUrl =
  process.env.REACT_APP_ETH_PROVIDER_URL || 'ws://localhost:8546'

const ethOwnerWallet = process.env.REACT_APP_ETH_OWNER_WALLET
const ethNetworkId = process.env.REACT_APP_ETH_NETWORK_ID

export async function setup(this: AudiusClient): Promise<void> {
  if (!window.web3 || !window.ethereum) {
    // Metamask is not installed
    this.isViewOnly = true
    this.libs = await configureReadOnlyLibs()
  } else {
    // Metamask is installed
    window.web3 = new Web3(window.ethereum)
    try {
      if (window.ethereum) {
        // Reload anytime the accounts change
        window.ethereum.on('accountsChanged', () => {
          window.location.reload()
        })
        // Reload anytime the network changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload()
        })
      }

      let metamaskWeb3Network = window.ethereum.networkVersion
      if (metamaskWeb3Network !== ethNetworkId) {
        this.isMisconfigured = true
        this.libs = await configureReadOnlyLibs()
      } else {
        this.libs = await configureLibsWithAccount()
        this.hasValidAccount = true

        // Failed to pull necessary info from metamask, configure read only
        if (!this.libs) {
          this.libs = await configureReadOnlyLibs()
          this.isAccountMisconfigured = true
        }
      }
    } catch (err) {
      console.error(err)
      this.libs = await configureReadOnlyLibs()
      this.isMisconfigured = true
    }
  }

  window.audiusLibs = this.libs
  this.isSetup = true
}

const configureReadOnlyLibs = async () => {
  const ethWeb3Config = audius.configEthWeb3(
    ethTokenAddress,
    ethRegistryAddress,
    ethProviderUrl,
    ethOwnerWallet
  )

  let audiusLibsConfig = {
    ethWeb3Config,
    isServer: false
  }
  const libs = new audius(audiusLibsConfig)
  await libs.init()
  return libs
}

const configureLibsWithAccount = async () => {
  let configuredMetamaskWeb3 = await Utils.configureWeb3(
    window.web3.currentProvider,
    ethNetworkId,
    false
  )

  let metamaskAccounts: any = await new Promise(resolve => {
    configuredMetamaskWeb3.eth.getAccounts((...args: any) => {
      resolve(args[1])
    })
  })
  let metamaskAccount = metamaskAccounts[0]

  // Not connected or no accounts, return
  if (!metamaskAccount) {
    return null
  }
  let audiusLibsConfig = {
    ethWeb3Config: audius.configEthWeb3(
      ethTokenAddress,
      ethRegistryAddress,
      configuredMetamaskWeb3,
      metamaskAccount
    ),
    isServer: false
  }
  const libs = new audius(audiusLibsConfig)
  await libs.init()
  return libs
}
