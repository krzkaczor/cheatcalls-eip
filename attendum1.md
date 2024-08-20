# Addendum 1 -- Current state of JSON RPC calls for development purposes.

@todo: merge this into 1 huge table.

Present snapshot of the RPCs

| API                       | Available in Hardhat                    | Available in Anvil                    | Purpose of the API                                           |
| ------------------------- | --------------------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| setBalance                | Yes (hardhat_setBalance)                | Yes (anvil_setBalance)                | To arbitrarily set a wallet address's native token balance   |
| setCode                   | Yes (hardhat_setCode)                   | Yes (anvil_setCode)                   | To set the bytecode at a specific address                    |
| setNonce                  | Yes (hardhat_setNonce)                  | Yes (anvil_setNonce)                  | To set the nonce of an account                               |
| setStorageAt              | Yes (hardhat_setStorageAt)              | Yes (anvil_setStorageAt)              | To directly modify the storage of a contract                 |
| setNextBlockBaseFeePerGas | Yes (hardhat_setNextBlockBaseFeePerGas) | Yes (anvil_setNextBlockBaseFeePerGas) | To set the base fee for the next block                       |
| setCoinbase               | Yes (hardhat_setCoinbase)               | Yes (anvil_setCoinbase)               | To set the coinbase address                                  |
| impersonateAccount        | Yes (hardhat_impersonateAccount)        | Yes (anvil_impersonateAccount)        | To send transactions from an account without its private key |
| stopImpersonatingAccount  | Yes (hardhat_stopImpersonatingAccount)  | Yes (anvil_stopImpersonatingAccount)  | To stop impersonating an account                             |
| mine                      | Yes (hardhat_mine)                      | Yes (anvil_mine)                      | To mine a specified number of blocks                         |
| dropTransaction           | Yes (hardhat_dropTransaction)           | Yes (anvil_dropTransaction)           | To remove a transaction from the mempool                     |
| reset                     | Yes (hardhat_reset)                     | Yes (anvil_reset)                     | To reset the network to its initial state                    |
| setLoggingEnabled         | Yes (hardhat_setLoggingEnabled)         | Yes (anvil_setLoggingEnabled)         | To enable or disable logging                                 |
| getAutomine               | Yes (hardhat_getAutomine)               | Yes (anvil_getAutomine)               | To check if auto-mining is enabled                           |
| setAutomine               | No                                      | Yes (anvil_setAutomine)               | To enable or disable auto-mining                             |
| mineUntilTimestamp        | No                                      | Yes (anvil_mineUntilTimestamp)        | To mine blocks until a specific timestamp is reached         |
| mineUntilBlockNumber      | No                                      | Yes (anvil_mineUntilBlockNumber)      | To mine blocks until a specific block number is reached      |
| setChainId                | No                                      | Yes (anvil_setChainId)                | To change the chain ID of the network                        |
| setBlockGasLimit          | No                                      | Yes (anvil_setBlockGasLimit)          | To set the block gas limit                                   |
| setMinGasPrice            | No                                      | Yes (anvil_setMinGasPrice)            | To set the minimum gas price for transactions                |
| setTime                   | No                                      | Yes (anvil_setTime)                   | To set the current block timestamp                           |
| increaseTime              | No                                      | Yes (anvil_increaseTime)              | To increase the current block timestamp                      |
| snapshot                  | No                                      | Yes (anvil_snapshot)                  | To create a snapshot of the current state                    |
| revert                    | No                                      | Yes (anvil_revert)                    | To revert to a previous snapshot                             |
| dumpState                 | No                                      | Yes (anvil_dumpState)                 | To dump the current state to a file                          |
| loadState                 | No                                      | Yes (anvil_loadState)                 | To load a previously dumped state                            |
| nodeInfo                  | No                                      | Yes (anvil_nodeInfo)                  | To get information about the node                            |
| customRequest             | No                                      | Yes (anvil_customRequest)             | To make a custom JSON-RPC request                            |
| addCompilationResult      | Yes (hardhat_addCompilationResult)      | No                                    | To add compilation results to the network                    |
| metadata                  | Yes (hardhat_metadata)                  | No                                    | To get metadata about the Hardhat Network                    |

As you can see from the above, 14 RPC methods are specific to Anvil and 2 are specific to Hardhat.

In addition to the above differences, both Tenderly and BuildBear have another set of different APIs, as per the table below:
