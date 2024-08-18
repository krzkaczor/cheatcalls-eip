# Cheatcalls EIP

Title: Standardization of Ethereum Development and Testing Methods
Author: Kris Kaczor
Discussions-to: \<Link to discussion forum (e.g., Ethereum Magicians, Ethresearch)>
Status: Draft
Type: \<Standards Track | Informational | Meta>
Created: 2014-07-15

Summary of the EIP's purpose and key points.

## Simple Summary

This EIP proposes a standardization of JSON RPC methods used across various Ethereum development and testing environments such as Hardhat, Foundry, Tenderly, and BuildBear Sandbox. The goal is to create a consistent set of APIs that smart contract developers can use regardless of their chosen development tool, thereby improving interoperability and reducing the learning curve when switching between different environments.

These new methods are similar to [cheatcodes](https://book.getfoundry.sh/forge/cheatcodes) available in foundry or hardhat tests but for JSON RPC calls, hence a name Cheatcalls.

## Abstract

Currently, Ethereum development and testing tools offer a variety of methods for manipulating the blockchain state during testing. While some methods share the same name across different platforms (e.g., `evm_increaseTime`), their behavior can vary significantly, especially in edge cases. Additionally, many methods are unique to specific tools (e.g., `hardhat_setStorageAt`, `tenderly_setStorageAt`, `tenderly_setErc20Balance`, `buildbear_ERC20Faucet`). This inconsistency creates unnecessary complexity for developers who work across multiple environments or transition between tools.

This EIP proposes a standardized set of methods to be implemented by all Ethereum development and testing environments. These methods will cover common operations such as setting storage values, manipulating account balances, and interacting with ERC20 tokens. By adopting a consistent naming convention and behavior for these methods, we aim to simplify the development process, enhance code portability, and reduce the cognitive load on developers when working with different tools.

The proposed standard includes methods such as `dev_setStorage`, `dev_setBalance`, and `dev_setERC20Balance`, which will replace their tool-specific counterparts. This standardization will allow developers to write more portable test suites and development scripts, facilitating easier migration between tools and promoting best practices across the Ethereum development ecosystem.

## Motivation

The Ethereum development ecosystem is rich with tools and environments that enable developers to build, test, and deploy smart contracts efficiently. However, the current landscape suffers from a lack of standardization in how these tools manipulate blockchain state during testing and development. This inconsistency creates several challenges:

1. **Reduced Developer Productivity**: Developers working across multiple environments or transitioning between tools must learn and remember different method names and behaviors for essentially the same operations. This cognitive overhead slows down development and increases the likelihood of errors.

2. **Limited Code Portability**: Test suites and development scripts written for one tool often require significant modifications to work with another. This lack of portability hampers collaboration and makes it difficult for projects to leverage the strengths of different tools.

3. **Increased Learning Curve**: Newcomers to Ethereum development face an additional barrier as they must learn tool-specific methods rather than focusing on core concepts and best practices.

4. **Fragmentation of Best Practices**: The divergence in method names and behaviors across tools can lead to the development of tool-specific best practices, rather than ecosystem-wide standards.

5. **Maintenance Burden**: Tool maintainers must implement and document their own versions of common operations, leading to duplication of effort across the ecosystem.

By standardizing these methods, we aim to:

- Simplify the development process by providing a consistent interface across all Ethereum development and testing environments.
- Enhance code portability, allowing developers to easily switch between tools or use multiple tools in the same project.
- Reduce the learning curve for new developers by establishing a common vocabulary for blockchain state manipulation.
- Promote the development of ecosystem-wide best practices.
- Ease the maintenance burden on tool developers by establishing a clear specification for these common operations.

The comparison table in the specification section highlights the current inconsistencies, with 14 methods specific to Anvil and 2 specific to Hardhat. This proposal seeks to bridge these gaps and create a unified set of methods that can be implemented across all Ethereum development tools, fostering a more cohesive and efficient development ecosystem.

## Specification

## Proposed standardized methods

All the developer related methods should be present in the dev namespace.

| API                              | Value                                                                                                      | Purpose                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| dev_support                      | boolean                                                                                                    | If the node supports dev APIs eg: Geth - No, Hardhat - Yes                       |
| dev_version                      | string                                                                                                     | The version of the dev APIs the node supports. The current version would be `v1` |
| dev_setBalance                   | account (b160), value (u256), blockId (optional blockId; default "latest")                                 | To arbitrarily set a wallet address's native token balance                       |
| dev_setCode                      | account (b160), code (hex), blockId (optional blockId; default "latest")                                   | To set the bytecode at a specific address                                        |
| dev_setNonce                     | account (b160), nonce (u256), blockId (optional blockId; default "latest")                                 | To set the nonce of an account                                                   |
| dev_setStorageAt                 | account (b160), key (h256), value (u256), blockId (optional blockId; default "latest")                     | To directly modify the storage of a contract                                     |
| dev_setNextBlockBaseFeePerGas    |                                                                                                            | To set the base fee for the next block                                           |
| dev_setCoinbase                  | account (b160)                                                                                             | To set the coinbase address                                                      |
| dev_impersonateAccount           | account (b160)                                                                                             | To send transactions from an account without its private key                     |
| dev_stopImpersonatingAccount     | account (b160)                                                                                             | To stop impersonating an account                                                 |
| dev_impersonateAllAccounts       |                                                                                                            | To impersonate all accounts                                                      |
| dev_stopImpersonatingAllAccounts |                                                                                                            | To stop impersonating all accounts                                               |
| dev_mine                         | noOfBlocks (optional uint256; ; default 1), blockInterval (optional uint256; defaultNodeMineInterval or 1) | To mine a specified number of blocks                                             |

## Rationale

There are multiple test nodes available, eg: Hardhat, Anvil, Phoenix (BuildBear), Tenderly, etc. The benefit of using a test node is that we can play around with the blockchain, such as minting user balances, mining 100s of blocks, and other scenarios on the fly that help with testing a DApp. Now each test node has its own set of RPCs, so t

## Backwards Compatibility

This EIP doesn't break any existing functionality in existing production grade nodes, eg: Geth, Reth, Nethermind, etc. This EIP however will affect to an extent, and deprecate certain RPCs in test nodes, eg: Hardhat, Anvil, Phoenix (BuildBear), etc. The RPCs that are being deprecated will be replaced by standardized RPCs that have been listed above in the proposal. User scripts, and other dependent tools/plugins might require minor changes, to be compatible.

See [Attendum #1](./attendum1.md) for a comparison table of current implementations.

## Test Cases

[edi-tests](https://github.com/krzkaczor/edi-tests) - Repository testing adherence to the spec.

## Implementation

Ongoing...

## Security Considerations

Todo: explain that cheatcalls should be only avaiable in admin RPCs.

## Copyright Waiver

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
