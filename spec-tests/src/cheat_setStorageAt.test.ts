import { rejects, strictEqual } from 'node:assert'
import { describe, it } from 'node:test'
import { numberToHex } from 'viem'
import { skipNotSupported } from './harness'
import { setupTestHarness } from './harness/setupTestingEnvironment'

const blockInfo = {
  blockNumber: 20433802n,
  blockTimestamp: 1722516575n,
}

const uniswapV2Address = '0x1F98431c8aD98523631AE4a59f267346ea31F984'

describe('cheat_setStorageAt', () => {
  it('should be able to set a valid storage value at a slot', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const slotValue = 90n
    const value = 345n
    const slot = numberToHex(slotValue, { size: 32 })
    const newStorageValue = numberToHex(value, { size: 32 })

    await harness.testClient.setStorageAt({
      address: uniswapV2Address,
      slot,
      value: newStorageValue,
    })

    const fetchedValue = await harness.publicClient.getStorageAt({
      address: uniswapV2Address,
      slot,
    })

    strictEqual(fetchedValue, newStorageValue)
  })

  it('should be able to set value 0 at a slot', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const slotValue = 90n
    const value = 0n
    const slot = numberToHex(slotValue, { size: 32 })
    const newStorageValue = numberToHex(value, { size: 32 })

    await harness.testClient.setStorageAt({
      address: uniswapV2Address,
      slot,
      value: newStorageValue,
    })

    const fetchedValue = await harness.publicClient.getStorageAt({
      address: uniswapV2Address,
      slot,
    })

    strictEqual(fetchedValue, newStorageValue)
  })

  it('should be able to set value U256::MAX (2**256 - 1) at a slot', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const slotValue = 90n
    const value = 2n ** 256n - 1n
    const slot = numberToHex(slotValue, { size: 32 })
    const newStorageValue = numberToHex(value, { size: 32 })

    await harness.testClient.setStorageAt({
      address: uniswapV2Address,
      slot,
      value: newStorageValue,
    })

    const fetchedValue = await harness.publicClient.getStorageAt({
      address: uniswapV2Address,
      slot,
    })

    strictEqual(fetchedValue, newStorageValue)
  })

  it('should fail for values greater than U256::MAX at a slot', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const slotValue = 90n
    const value = 2n ** 256n
    const slot = numberToHex(slotValue, { size: 32 })
    const newStorageValue = numberToHex(value)

    await rejects(
      harness.testClient.setStorageAt({
        address: uniswapV2Address,
        slot,
        value: newStorageValue,
      }),
    )
  })

  it('should be able to set a valid storage value at slot 0', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const slotValue = 0n
    const value = 345n
    const slot = numberToHex(slotValue, { size: 32 })
    const newStorageValue = numberToHex(value, { size: 32 })

    await harness.testClient.setStorageAt({
      address: uniswapV2Address,
      slot,
      value: newStorageValue,
    })

    const fetchedValue = await harness.publicClient.getStorageAt({
      address: uniswapV2Address,
      slot,
    })

    strictEqual(fetchedValue, newStorageValue)
  })

  it('should be able to set a valid storage value at slot U256::MAX (2**256 - 1)', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const slotValue = 2n ** 256n - 1n
    const value = 345n
    const slot = numberToHex(slotValue, { size: 32 })
    const newStorageValue = numberToHex(value, { size: 32 })

    await harness.testClient.setStorageAt({
      address: uniswapV2Address,
      slot,
      value: newStorageValue,
    })

    const fetchedValue = await harness.publicClient.getStorageAt({
      address: uniswapV2Address,
      slot,
    })

    strictEqual(fetchedValue, newStorageValue)
  })

  it('should fail to set a valid storage value at a slot greater than U256::MAX', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const slotValue = 2n ** 256n
    const value = 345n
    const slot = numberToHex(slotValue)
    const newStorageValue = numberToHex(value, { size: 32 })

    await rejects(
      harness.testClient.setStorageAt({
        address: uniswapV2Address,
        slot,
        value: newStorageValue,
      }),
    )
  })

  it('should fail to set a valid storage value at a slot for an EOA', async (ctx) => {
    if (skipNotSupported('anvil', 'Allows setting storage values of EOAs', ctx)) return
    if (skipNotSupported('tenderly', 'Allows setting storage values of EOAs', ctx)) return

    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const slotValue = 90
    const value = 345n
    const slot = numberToHex(slotValue, { size: 32 })
    const newStorageValue = numberToHex(value, { size: 32 })

    await rejects(
      harness.testClient.setStorageAt({
        address: harness.sender.address,
        slot,
        value: newStorageValue,
      }),
    )
  })
})
