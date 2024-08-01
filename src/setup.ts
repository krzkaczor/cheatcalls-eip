import { createAnvil } from '@viem/anvil'
import { http, createPublicClient, createTestClient, createWalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'

export async function setupTestingEnvironment() {
  const anvil = createAnvil({ timestamp: 100 })

  await anvil.start()

  const chain = foundry
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
      await anvil.stop()
    },
  }
}
