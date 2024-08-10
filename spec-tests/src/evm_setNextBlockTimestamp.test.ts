import { strictEqual } from 'node:assert'
import { describe, it } from 'node:test'
import { setupTestingEnvironment } from './harness/setupTestingEnvironment'

const blockInfo = {
  blockNumber: 20433802n,
  blockTimestamp: 1722516575n,
}

describe('evm_setNextBlockTimestamp', () => {
  it('should set the next block timestamp', async () => {
    await using env = await setupTestingEnvironment({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const expectedTimestamp = blockInfo.blockTimestamp + 1_000n

    await env.testClient.setNextBlockTimestamp({ timestamp: expectedTimestamp })

    // noop tx
    const hash = await env.walletClient.sendTransaction({
      to: env.sender.address,
      value: 0n,
    })

    const { blockNumber } = await env.publicClient.waitForTransactionReceipt({
      hash,
    })
    const block = await env.publicClient.getBlock({ blockNumber })

    strictEqual(block.number, blockInfo.blockNumber + 1n)
    strictEqual(block.timestamp, expectedTimestamp)
  })

  it('should provide the next timestamp in CALLs')
  it('should set the next block timestamp even with delay')
  it('should not allowing setting up a timestamp from the past')

  it('should maintain timestamp gap after tx was mined')
})
