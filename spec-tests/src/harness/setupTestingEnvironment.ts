import {
  http,
  Account,
  Chain,
  PublicClient,
  Transport,
  WalletClient,
  createPublicClient,
  createWalletClient,
  parseEther,
} from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'
import { loadHarnessConfig } from './config'
import { AnvilNode } from './nodes/AnvilNode'
import { TenderlyNode } from './nodes/TenderlyNode'
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
  const harnessConfig = loadHarnessConfig()

  const forkNode: IForkNode =
    harnessConfig.node.mode === 'anvil'
      ? new AnvilNode({ alchemyApiKey: harnessConfig.node.alchemyApiKey })
      : new TenderlyNode({
          account: harnessConfig.node.tenderlyAccount,
          project: harnessConfig.node.tenderlyProject,
          apiKey: harnessConfig.node.tenderlyApiKey,
        })
  await forkNode.start({
    originForkNetworkChainId: args.originForkNetworkChainId,
    forkChainId: args.forkChainId,
    forkBlockNumber: args.forkBlockNumber,
  })
  const sender = privateKeyToAccount(generatePrivateKey())

  const chain = { ...foundry, id: args.forkChainId }
  const transport = http(forkNode.url())

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

  await testClient.setBalance({
    address: sender.address,
    balance: parseEther('100'),
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
