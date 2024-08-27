import { http, createPublicClient, createTestClient, createWalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'
import { AnvilNode } from './nodes/AnvilNode'
import { IForkNode } from './nodes/types'

interface SetupTestingEnvironmentArgs {
  originForkNetworkChainId: number
  forkChainId: number
  forkBlockNumber: bigint
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function setupTestingHarness(args: SetupTestingEnvironmentArgs) {
  const forkNode: IForkNode = new AnvilNode()
  await forkNode.start({
    originForkNetworkChainId: args.originForkNetworkChainId,
    forkChainId: args.forkChainId,
    forkBlockNumber: args.forkBlockNumber,
  })

  const chain = { ...foundry, id: args.forkChainId }
  const transport = http('http://localhost:8545')
  const senderAccountPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' // anvil default #1
  const sender = privateKeyToAccount(senderAccountPrivateKey)

  const walletClient = createWalletClient({
    transport,
    chain,
    account: sender,
  })

  const testClient = createTestClient({
    chain,
    transport,
    mode: 'anvil',
  })
  const publicClient = createPublicClient({
    chain,
    transport,
  })

  return {
    testClient,
    publicClient,
    walletClient,
    sender,
    async [Symbol.asyncDispose]() {
      await forkNode.stop()
    },
  }
}
