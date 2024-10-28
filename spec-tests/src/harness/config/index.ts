import assert from 'node:assert'
import { TestContext } from 'node:test'
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
  }
}

interface HarnessConfig {
  node: HarnessNode
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
export type SupportedNodes = HarnessNode['mode']

