import assert from 'node:assert'
import { Anvil, createAnvil } from '@viem/anvil'
import { Chain, Transport, createClient } from 'viem'
import { mainnet } from 'viem/chains'
import { raise } from '../../utils/raise'
import { CheatcallsClient, ForkOptions, IForkNode } from './types'

export class AnvilNode implements IForkNode {
  private anvil: Anvil | undefined
  async start(forkOptions: ForkOptions): Promise<void> {
    const forkUrl = originChainIdToRpcUrl[forkOptions.originForkNetworkChainId]
    assert(forkUrl, `No RPC URL found for chain ID ${forkOptions.originForkNetworkChainId}`)

    this.anvil = createAnvil({
      forkUrl,
      forkBlockNumber: forkOptions.forkBlockNumber,
      forkChainId: forkOptions.forkChainId,
    })

    await this.anvil.start()
  }

  async stop(): Promise<void> {
    await this.anvil?.stop()
  }

  getCheatcallsClient(chain: Chain, transport: Transport): CheatcallsClient {
    // backward compatible client using already implemented methods in anvil
    return createClient({
      chain,
      transport,
    }).extend((client) => ({
      async setNextBlockTimestamp({ timestamp }: { timestamp: bigint }): Promise<void> {
        await client.request({
          method: 'evm_setNextBlockTimestamp' as any,
          params: [`0x${timestamp.toString(16)}`],
        })
      },
    }))
  }
}

const originChainIdToRpcUrl: Record<number, string | undefined> = {
  [mainnet.id]: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY! ?? raise('ALCHEMY_API_KEY is required')}`,
}
