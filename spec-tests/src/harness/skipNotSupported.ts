import assert from 'node:assert'
import { TestContext } from 'node:test'
import { SupportedNodes } from './config'
import { getEnv } from './config/getEnv'

export function skipNotSupported(node: SupportedNodes, reason: string, ctx: TestContext): boolean {
  const env = getEnv()
  const nodeType = env.string('HARNESS_NODE')
  assert(nodeType === 'anvil' || nodeType === 'tenderly', 'HARNESS_NODE must be either anvil or tenderly')

  if (nodeType === node) {
    ctx.skip(reason)
    return true
  }
  return false
}
