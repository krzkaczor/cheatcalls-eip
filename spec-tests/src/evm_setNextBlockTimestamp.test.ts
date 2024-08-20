import { strictEqual } from 'node:assert'
import { describe, it } from 'node:test'
import { mainnet } from 'viem/chains'
import { multicall3Abi } from './harness/abis/multicall3'
import { setupTestingEnvironment } from './harness/setupTestingEnvironment'
import { sleep } from './utils/sleep'

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

  it('should provide the next timestamp during eth_call', async () => {
    await using env = await setupTestingEnvironment({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const expectedTimestamp = blockInfo.blockTimestamp + 1_000n

    await env.testClient.setNextBlockTimestamp({ timestamp: expectedTimestamp })

    const actualTimestamp = await env.publicClient.readContract({
      address: mainnet.contracts.multicall3.address,
      abi: multicall3Abi,
      functionName: 'getCurrentBlockTimestamp',
    })

    strictEqual(actualTimestamp, expectedTimestamp)
  })

  it('should not mine new block immediately', async () => {
    await using env = await setupTestingEnvironment({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const expectedTimestamp = blockInfo.blockTimestamp + 1_000n

    await env.testClient.setNextBlockTimestamp({ timestamp: expectedTimestamp })

    const actualLatestBlock = await env.publicClient.getBlock({ blockTag: 'latest' })

    strictEqual(actualLatestBlock.number, blockInfo.blockNumber)
    strictEqual(actualLatestBlock.timestamp, blockInfo.blockTimestamp)
  })

  it('should set the exact next block timestamp even after a delay', { timeout: 10_000 }, async () => {
    await using env = await setupTestingEnvironment({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const expectedTimestamp = blockInfo.blockTimestamp + 1_000n

    await env.testClient.setNextBlockTimestamp({ timestamp: expectedTimestamp })

    await sleep(5_000)

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
  it('should not allowing setting up a timestamp from the past')
  it('should maintain timestamp gap after tx was mined')
})
