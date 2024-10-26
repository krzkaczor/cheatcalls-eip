import assert from 'node:assert'
import net, { AddressInfo } from 'node:net'
import { Anvil, createAnvil } from '@viem/anvil'
import { Address, Chain, Hex, Transport, createClient } from 'viem'
import { mainnet } from 'viem/chains'
import { raise } from '../../utils/raise'
import { CheatcallsClient, ForkOptions, IForkNode } from './types'

export class AnvilNode implements IForkNode {
  private anvil: Anvil | undefined

  constructor(private readonly opts: {alchemyApiKey: string}) {
  }


  async start(forkOptions: ForkOptions): Promise<void> {
    const forkUrl = originChainIdToRpcUrl(this.opts.alchemyApiKey)[forkOptions.originForkNetworkChainId]
    assert(forkUrl, `No RPC URL found for chain ID ${forkOptions.originForkNetworkChainId}`)

    this.anvil = createAnvil({
      forkUrl,
      forkBlockNumber: forkOptions.forkBlockNumber,
      forkChainId: forkOptions.forkChainId,
      port: await this.getRandomPort(),
    })

    await this.anvil.start()
  }

  async stop(): Promise<void> {
    await this.anvil?.stop()
  }

  url(): string {
    if (!this.anvil) {
      raise('Anvil node is not started')
    }
    return `http://localhost:${this.anvil.port}`
  }

  private async getRandomPort(): Promise<number> {
    const server = net.createServer().listen(0)
    await new Promise((resolve) => server.on('listening', resolve))
    const port = (server.address() as AddressInfo).port
    await new Promise((resolve) => server.close(resolve))
    return port
  }

  getCheatcallsClient(chain: Chain, transport: Transport): CheatcallsClient {
    // backward compatible client using already implemented methods in anvil
    return createClient({
      chain,
      transport,
    }).extend((client) => ({
      async setNextBlockTimestamp({
        timestamp,
      }: {
        timestamp: bigint
      }): Promise<void> {
        await client.request({
          method: 'evm_setNextBlockTimestamp' as any,
          params: [`0x${timestamp.toString(16)}`],
        })
      },
      async setBalance({
        address,
        balance,
      }: {
        address: Address
        balance: bigint
      }): Promise<void> {
        await client.request({
          method: 'anvil_setBalance' as any,
          params: [address, `0x${balance.toString(16)}`],
        })
      },
      async setNonce({
        address,
        nonce,
      }: {
        address: Address
        nonce: number
      }): Promise<void> {
        await client.request({
          method: 'anvil_setNonce' as any,
          params: [address, `0x${nonce.toString(16)}`],
        })
      },
      async setCode({
        address,
        code,
      }: {
        address: Address
        code: Hex
      }): Promise<void> {
        await client.request({
          method: 'anvil_setCode' as any,
          params: [address, code],
        })
      },
      async setStorageAt({
        address,
        slot,
        value,
      }: {
        address: Address
        slot: Hex
        value: Hex
      }): Promise<void> {
        await client.request({
          method: 'anvil_setStorageAt' as any,
          params: [address, slot, value],
        })
      },
    }))
  }
}

const originChainIdToRpcUrl = (alchemyApiKey: string): Record<number, string | undefined> => ({
  [mainnet.id]: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`
})
