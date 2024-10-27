import assert from 'node:assert'
import { Account } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { getEnv } from './getEnv'

export function loadHarnessConfig(): HarnessConfig {
  const env = getEnv()
  const nodeType = env.string('HARNESS_NODE')
  assert(nodeType === 'anvil' || nodeType === 'tenderly', 'HARNESS_NODE must be either anvil or tenderly')

  const node: HarnessNode =
    nodeType === 'anvil'
      ? {
          mode: 'anvil',
          alchemyApiKey: env.string('ALCHEMY_API_KEY'),
        }
      : {
          mode: 'tenderly',
          tenderlyApiKey: env.string('TENDERLY_API_KEY'),
          tenderlyAccount: env.string('TENDERLY_ACCOUNT'),
          tenderlyProject: env.string('TENDERLY_PROJECT'),
        }

  return {
    node,
    sender: privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'), // anvil default #1
  }
}

interface HarnessConfig {
  node: HarnessNode
  sender: Account
}

export type HarnessNode =
  | {
      mode: 'anvil'
      alchemyApiKey: string
    }
  | {
      mode: 'tenderly'
      tenderlyApiKey: string
      tenderlyAccount: string
      tenderlyProject: string
    }
