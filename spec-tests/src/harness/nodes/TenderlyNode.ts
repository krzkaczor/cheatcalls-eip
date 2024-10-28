import assert from 'node:assert'
import { Address, Chain, Hex, Transport, createClient } from 'viem'
import { z } from 'zod'
import { raise } from '../../utils/raise'
import { solidFetch } from './solidFetch'
import { CheatcallsClient, ForkOptions, IForkNode } from './types'

export class TenderlyNode implements IForkNode {
  private rpcUrl: string | undefined
  constructor(
    private readonly opts: {
      account: string
      project: string
      apiKey: string
    },
  ) {
    assert(this.opts.account, 'Missing Tenderly account')
  }

  async start(forkOptions: ForkOptions): Promise<void> {
    const { forkBlockNumber, originForkNetworkChainId, forkChainId } = forkOptions
    const uniqueId = new Date().getTime() + Math.floor(Math.random() * 100000)

    const response = await solidFetch(
      `https://api.tenderly.co/api/v1/account/${this.opts.account}/project/${this.opts.project}/vnets`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': this.opts.apiKey,
        },
        body: JSON.stringify({
          slug: `cheatcalls-eip-tests-${uniqueId}`,
          display_name: `cheatcalls-eip-tests-${uniqueId}`,
          fork_config: {
            network_id: originForkNetworkChainId,
            block_number: Number(forkBlockNumber),
          },
          virtual_network_config: {
            chain_config: {
              chain_id: forkChainId,
            },
          },
          sync_state_config: {
            enabled: false,
            commitment_level: 'latest',
          },
          explorer_page_config: {
            enabled: false,
            verification_visibility: 'bytecode',
          },
        }),
      },
    )

    const responseJson = await response.json()
    assert(response.ok, `Failed to create vnet: ${JSON.stringify(responseJson)}`)
    const data = createVnetSchema.parse(responseJson)

    const adminRpc = data.rpcs.find((rpc: any) => rpc.name === 'Admin RPC')
    const publicRpc = data.rpcs.find((rpc: any) => rpc.name === 'Public RPC')
    assert(adminRpc && publicRpc, 'Missing admin or public RPC')
    this.rpcUrl = adminRpc.url
  }

  async stop(): Promise<void> {}

  url(): string {
    if (!this.rpcUrl) {
      raise('Anvil node is not started')
    }
    return this.rpcUrl
  }

  getCheatcallsClient(chain: Chain, transport: Transport): CheatcallsClient {
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
          method: 'tenderly_setNextBlockTimestamp' as any,
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
          method: 'tenderly_setBalance' as any,
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
          method: 'evm_setNonce' as any,
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
          method: 'tenderly_setCode' as any,
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
          method: 'tenderly_setStorageAt' as any,
          params: [address, slot, value],
        })
      },
    }))
  }
}

const createVnetSchema = z.object({
  rpcs: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    }),
  ),
})
