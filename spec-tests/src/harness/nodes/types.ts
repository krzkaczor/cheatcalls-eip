import { Address, Chain, Transport } from 'viem'

export interface ForkOptions {
  originForkNetworkChainId: number
  forkChainId: number
  forkBlockNumber: bigint
}

export interface IForkNode {
  start(forkOptions: ForkOptions): Promise<void>
  stop(): Promise<void>
  url(): string

  getCheatcallsClient(chain: Chain, transport: Transport): CheatcallsClient
}

export interface CheatcallsClient {
  setNextBlockTimestamp({ timestamp }: { timestamp: bigint }): Promise<void>
  setBalance({
    address,
    balance,
  }: {
    address: Address
    balance: bigint
  }): Promise<void>
  setNonce({
    address,
    nonce,
  }: {
    address: Address
    nonce: number
  }): Promise<void>
}
