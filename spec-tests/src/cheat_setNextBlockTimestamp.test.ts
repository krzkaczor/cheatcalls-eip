import { rejects, strictEqual } from 'node:assert'
import { describe, it } from 'node:test'
import { mainnet } from 'viem/chains'
import { skipNotSupported } from './harness'
import { multicall3Abi } from './harness/abis/multicall3'
import { setupTestHarness } from './harness/setupTestingEnvironment'
import { sleep } from './utils/sleep'

const blockInfo = {
  blockNumber: 20433802n,
  blockTimestamp: 1722516575n,
}

describe('cheat_setNextBlockTimestamp', () => {
  it('should set the next block timestamp', async (ctx) => {
    if (
      skipNotSupported(
        'tenderly',
        'Tenderly fork creation results in a extra block with *current* timestamp. This prevents from setting next block timestamp to a fixed interval because of "timestamp must be greater than the latest block timestamp"',
        ctx,
      )
    )
      return

    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const expectedTimestamp = blockInfo.blockTimestamp + 1_000n

    await harness.testClient.setNextBlockTimestamp({ timestamp: expectedTimestamp })

    // noop tx
    const hash = await harness.walletClient.sendTransaction({
      to: harness.sender.address,
      value: 0n,
    })

    const { blockNumber } = await harness.publicClient.waitForTransactionReceipt({
      hash,
    })
    const block = await harness.publicClient.getBlock({ blockNumber })

    strictEqual(block.number, blockInfo.blockNumber + 1n)
    strictEqual(block.timestamp, expectedTimestamp)
  })

  it('should provide the next timestamp during eth_call for pending blocks', async (ctx) => {
    if (
      skipNotSupported(
        'tenderly',
        'Tenderly fork creation results in a extra block with *current* timestamp. This prevents from setting next block timestamp to a fixed interval because of "timestamp must be greater than the latest block timestamp"',
        ctx,
      )
    )
      return

    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const expectedTimestamp = blockInfo.blockTimestamp + 1_000n

    await harness.testClient.setNextBlockTimestamp({ timestamp: expectedTimestamp })

    const actualTimestamp = await harness.publicClient.readContract({
      address: mainnet.contracts.multicall3.address,
      abi: multicall3Abi,
      functionName: 'getCurrentBlockTimestamp',
      blockTag: 'pending',
    })

    strictEqual(actualTimestamp, expectedTimestamp)
  })

  it('should not mine new block immediately', async (ctx) => {
    if (
      skipNotSupported(
        'tenderly',
        'Tenderly fork creation results in a extra block with *current* timestamp. This prevents from setting next block timestamp to a fixed interval because of "timestamp must be greater than the latest block timestamp"',
        ctx,
      )
    )
      return

    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const expectedTimestamp = blockInfo.blockTimestamp + 1_000n

    await harness.testClient.setNextBlockTimestamp({ timestamp: expectedTimestamp })

    const actualLatestBlock = await harness.publicClient.getBlock({ blockTag: 'latest' })

    strictEqual(actualLatestBlock.number, blockInfo.blockNumber)
    strictEqual(actualLatestBlock.timestamp, blockInfo.blockTimestamp)
  })

  it('should set the exact next block timestamp even after a delay', { timeout: 10_000 }, async (ctx) => {
    if (
      skipNotSupported(
        'tenderly',
        'Tenderly fork creation results in a extra block with *current* timestamp. This prevents from setting next block timestamp to a fixed interval because of "timestamp must be greater than the latest block timestamp"',
        ctx,
      )
    )
      return

    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const expectedTimestamp = blockInfo.blockTimestamp + 1_000n

    await harness.testClient.setNextBlockTimestamp({ timestamp: expectedTimestamp })

    await sleep(5_000)

    // noop tx
    const hash = await harness.walletClient.sendTransaction({
      to: harness.sender.address,
      value: 0n,
    })

    const { blockNumber } = await harness.publicClient.waitForTransactionReceipt({
      hash,
    })
    const block = await harness.publicClient.getBlock({ blockNumber })

    strictEqual(block.number, blockInfo.blockNumber + 1n)
    strictEqual(block.timestamp, expectedTimestamp)
  })

  it('should not allow setting up a timestamp from the past', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const expectedTimestamp = blockInfo.blockTimestamp - 1_000n

    await rejects(harness.testClient.setNextBlockTimestamp({ timestamp: expectedTimestamp }))
  })
})
