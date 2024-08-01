import assert from 'node:assert'
import { Anvil, createAnvil } from '@viem/anvil'
import { mainnet } from 'viem/chains'
import { raise } from '../../utils/raise'
import { ForkOptions, IForkNode } from './types'

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
}

const originChainIdToRpcUrl: Record<number, string | undefined> = {
  [mainnet.id]: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY! ?? raise('ALCHEMY_API_KEY is required')}`,
}
