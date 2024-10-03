import { rejects, strictEqual } from 'node:assert'
import { describe, it } from 'node:test'
import { setupTestHarness } from './harness/setupTestingEnvironment'

const blockInfo = {
  blockNumber: 20433802n,
  blockTimestamp: 1722516575n,
}

const uniswapV2Address = '0x1F98431c8aD98523631AE4a59f267346ea31F984'

describe('cheat_setCode', () => {
  it('should be able to set a valid code', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const newCode = '0x00'

    await harness.testClient.setCode({
      address: uniswapV2Address,
      code: newCode,
    })

    const fetchedCode = await harness.publicClient.getCode({
      address: uniswapV2Address,
    })

    strictEqual(fetchedCode, newCode)
  })

  it('should be able to set a valid code to an eoa address', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const newCode = '0x00'

    await harness.testClient.setCode({
      address: harness.sender.address,
      code: newCode,
    })

    const fetchedCode = await harness.publicClient.getCode({
      address: harness.sender.address,
    })

    strictEqual(fetchedCode, newCode)
  })

  it('should reject setting an invalid code', async () => {
    await using harness = await setupTestHarness({
      originForkNetworkChainId: 1,
      forkChainId: 1337,
      forkBlockNumber: blockInfo.blockNumber,
    })
    const newCode = '0x00c'

    await rejects(
      harness.testClient.setCode({
        address: uniswapV2Address,
        code: newCode,
      }),
    )
  })
})
