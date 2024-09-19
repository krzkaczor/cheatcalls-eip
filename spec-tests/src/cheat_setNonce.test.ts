import { strictEqual } from 'node:assert'
import { describe, it } from 'node:test'
import { setupTestHarness } from './harness/setupTestingEnvironment'

const blockInfo = {
  blockNumber: 20433802n,
  blockTimestamp: 1722516575n,
}

describe('cheat_setNonce', () => {
  it('should be able to increase the nonce', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const oldNonce = await harness.publicClient.getTransactionCount({
      address: harness.sender.address,
    })
    const newNonce = oldNonce + 5

    await harness.testClient.setNonce({
      address: harness.sender.address,
      nonce: newNonce,
    })

    const fetchedNonce = await harness.publicClient.getTransactionCount({
      address: harness.sender.address,
    })

    strictEqual(fetchedNonce, newNonce)
  })
})
