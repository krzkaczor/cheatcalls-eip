export interface ForkOptions {
  originForkNetworkChainId: number
  forkChainId: number
  forkBlockNumber: bigint
}

export interface IForkNode {
  start(forkOptions: ForkOptions): Promise<void>
  stop(): Promise<void>
}
