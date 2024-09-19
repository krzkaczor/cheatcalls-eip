import { rejects, strictEqual } from 'node:assert'
import { describe, it } from 'node:test'
import { setupTestHarness } from './harness/setupTestingEnvironment'

const blockInfo = {
  blockNumber: 20433802n,
  blockTimestamp: 1722516575n,
}

describe('cheat_setBalance', () => {
  it('should be able to increase the balance', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const oldBalance = await harness.publicClient.getBalance({
      address: harness.sender.address,
    })
    const newBalance = oldBalance + 1_000_000n

    await harness.testClient.setBalance({
      address: harness.sender.address,
      balance: newBalance,
    })

    const fetchedBalance = await harness.publicClient.getBalance({
      address: harness.sender.address,
    })

    strictEqual(fetchedBalance, newBalance)
  })

  it('should be able to set the balance to 0', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const newBalance = 0n

    await harness.testClient.setBalance({
      address: harness.sender.address,
      balance: newBalance,
    })

    const fetchedBalance = await harness.publicClient.getBalance({
      address: harness.sender.address,
    })

    strictEqual(fetchedBalance, newBalance)
  })

  it('should be able to set the balance to U256::MAX (2**256 - 1)', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const newBalance = 2n ** 256n - 1n

    await harness.testClient.setBalance({
      address: harness.sender.address,
      balance: newBalance,
    })

    const fetchedBalance = await harness.publicClient.getBalance({
      address: harness.sender.address,
    })

    strictEqual(fetchedBalance, newBalance)
  })

  it('should fail for balances greater than U256::MAX', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const newBalance = 2n ** 256n

    await rejects(
      harness.testClient.setBalance({
        address: harness.sender.address,
        balance: newBalance,
      }),
    )
  })
})
