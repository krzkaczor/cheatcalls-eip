import {
  http,
  Account,
  Chain,
  PublicClient,
  Transport,
  WalletClient,
  createPublicClient,
  createWalletClient,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'
import { AnvilNode } from './nodes/AnvilNode'
import { CheatcallsClient, IForkNode } from './nodes/types'

interface SetupTestingEnvironmentArgs {
  originForkNetworkChainId: number
  forkChainId: number
  forkBlockNumber: bigint
}

interface TestHarness {
  testClient: CheatcallsClient
  publicClient: PublicClient
  walletClient: WalletClient<Transport, Chain, Account>
  sender: Account
  [Symbol.asyncDispose](): Promise<void>
}

export async function setupTestHarness(args: SetupTestingEnvironmentArgs): Promise<TestHarness> {
  const forkNode: IForkNode = new AnvilNode()
  await forkNode.start({
    originForkNetworkChainId: args.originForkNetworkChainId,
    forkChainId: args.forkChainId,
    forkBlockNumber: args.forkBlockNumber,
  })

  const chain = { ...foundry, id: args.forkChainId }
  const transport = http('http://localhost:8545') // @todo dynamic value

  const senderAccountPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' // anvil default #1
  const sender = privateKeyToAccount(senderAccountPrivateKey)

  const testClient = forkNode.getCheatcallsClient(chain, transport)
  const walletClient = createWalletClient({
    transport,
    chain,
    account: sender,
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
