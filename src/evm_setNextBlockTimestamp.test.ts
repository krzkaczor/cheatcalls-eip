import { strictEqual } from 'node:assert'
import { describe, it } from 'node:test'
import { setupTestingEnvironment } from './setup'

describe('evm_setNextBlockTimestamp', () => {
  it('should set the next block timestamp', async () => {
    using env = await setupTestingEnvironment()

    const bn = await env.publicClient.getBlockNumber()
    strictEqual(bn, 0n) // the first block is 1

    await env.testClient.setNextBlockTimestamp({ timestamp: 1000n })

    const hash = await env.walletClient.sendTransaction({
      to: env.sender.address,
      value: 1n,
    }) // send a little bit of ETH to yourself

    const { blockNumber } = await env.publicClient.waitForTransactionReceipt({
      hash,
    })
    const block = await env.publicClient.getBlock({ blockNumber })

    strictEqual(await block.timestamp, 1000n)
  })

  it('should set the next block timestamp even with delay')
  it('should not allowing setting up a timestamp from the past')
})
