import { Chain, Transport } from 'viem'

export interface ForkOptions {
  originForkNetworkChainId: number
  forkChainId: number
  forkBlockNumber: bigint
}

export interface IForkNode {
  start(forkOptions: ForkOptions): Promise<void>
  stop(): Promise<void>

  getCheatcallsClient(chain: Chain, transport: Transport): CheatcallsClient
}

export interface CheatcallsClient {
  setNextBlockTimestamp({ timestamp }: { timestamp: bigint }): Promise<void>
}
