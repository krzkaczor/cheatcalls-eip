# Cheatcalls EIP

| eip | title          | description | author | type | category  | status | created    | discussions-to |
|-----|----------------|-------------|--------|------|-----------|--------|------------|----------------|
| eip-xxxx | Cheatcalls EIP | Standardization of Ethereum Development and Testing Methods | Kris Kaczor \<chris@kaczor.io\>, Emmanuel Antony \<emmanuelantony2000@gmail.com\> | Standards Track | Interface | Draft | 2024-11-12 | <To be submitted after> |

## Abstract

Currently, Ethereum development and testing tools offer a variety of methods for manipulating the blockchain state during testing. While some methods share the same name across different platforms (e.g., `evm_increaseTime`), their behavior can vary significantly, especially in edge cases. Additionally, many methods are unique to specific tools (e.g., `hardhat_setStorageAt`, `tenderly_setStorageAt`, `tenderly_setErc20Balance`, `buildbear_ERC20Faucet`). Finally, there are often times when some functionality is completely missing from a given node. These inconsistencies create unnecessary complexity for developers and result in vendor lock-in.

This EIP proposes a standardized set of methods to be implemented by all Ethereum development and testing environments. These methods cover common operations such as setting storage values, manipulating account balances, and interacting with ERC20 tokens. By adopting a consistent naming convention and behavior for these methods, we aim to simplify the development process, enhance code portability, and reduce the cognitive load on developers when working with different tools.

The proposed standard includes methods such as `cheat_setStorage`, `cheat_setBalance`, and `cheat_setERC20Balance`, which will replace their tool-specific counterparts. These new methods are similar to [cheatcodes](https://book.getfoundry.sh/forge/cheatcodes) available in Foundry or Hardhat tests but for JSON RPC calls, hence a name Cheatcalls.

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

| Method name                        | Signature                                                                      | Comment                                                                                                                                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cheat_info                         | <pre>(): NodeInfo </pre>                                                       | Returns semver version of the cheatcalls spec that the node supports. Example "1.0.0".                                                                                                                                                     |
| cheat_setBalance                   | <pre>(addr: Address, balanceInWei: Quantity): void</pre>                       |                                                                                                                                                                                                                                            |
| cheat_setErc20Balance              | <pre>(token: Address, addr: Address, balanceInBaseUnit: Quantity): void </pre> | Balance is in base unit ie. 10^18                                                                                                                                                                                                          |
| cheat_setCode                      | <pre>(addr: Address, code: Data): void </pre>                                  |                                                                                                                                                                                                                                            |
| cheat_setNonce                     | <pre>(addr: Address, nonce: Quantity): void </pre>                             |                                                                                                                                                                                                                                            |
| cheat_setStorageAt                 | <pre>(addr: Address, key: Data, value: Quantity): void </pre>                  | Throws if addr is not a contract                                                                                                                                                                                                           |
| cheat_setCoinbase                  | <pre>(addr: Address): void </pre>                                              |                                                                                                                                                                                                                                            |
| cheat_setMinGasPrice               | <pre>(priceInWei: Quantity \| null): void </pre>                               | To unset, call with null.                                                                                                                                                                                                                  |
| cheat_setNextBlockBaseFeePerGas    | <pre>(priceInWei: Quantity \| null): void </pre>                               | To unset, call with null.                                                                                                                                                                                                                  |
| cheat_setBlockGasLimit             | <pre>(gas: Quantity \| null): void </pre>                                      | `null` means no limit                                                                                                                                                                                                                      |
| cheat_impersonateAllAccounts       | <pre>(): void </pre>                                                           |                                                                                                                                                                                                                                            |
| cheat_stopImpersonatingAllAccounts | <pre>(): void </pre>                                                           |                                                                                                                                                                                                                                            |
| cheat_mine                         | <pre>(blocks: Quantity = 1, gapInSec: Quantity = 1): void </pre>               |                                                                                                                                                                                                                                            |
| cheat_mining_mode                  | <pre>(mode: InputMiningMode): void </pre>                                      | Sets a mining mode. Explanation follows.                                                                                                                                                                                                   |
| cheat_dropTransaction              | <pre>(hash: Data): void </pre>                                                 | Drops a tx from a mempool.                                                                                                                                                                                                                 |
| cheat_increaseTime                 | <pre>(deltaInSec: Quantity): void </pre>                                       | Mines a new block with a timestamp of `lastTimestamp + deltaInSeconds`                                                                                                                                                                     |
| cheat_setNextBlockTimestamp        | <pre>(nextTimestamp: Quantity \| null): void </pre>                            | Does not mine a new block, but once new block is mined, it will have timestamp of exactly `nextTimestamp`. Any methods reading state such as `eth_call` respects new timestamp when queried for 'pending' block. To unset, call with null. |
| cheat_snapshot                     | <pre>(): Quantity </pre>                                                       | Snapshots current state of the blockchain, including Cheatcall related state like `nextBlockTimestamp`. Returned id has to be sequential.                                                                                                  |
| cheat_revert_snapshot              | <pre>(id: Quantity): void </pre>                                               | Replaces `evm_revert`                                                                                                                                                                                                                      |
| cheat_reset                        | <pre>(mode: InputRunMode): void </pre>                                         | Resets the whole node including snapshots, mempool and any Cheatcalls related state. Can be used to start forking a new network or change chain id.                                                                                        |

```typescript
// using conventions established in https://ethereum.org/en/developers/docs/apis/json-rpc/#conventions
type Data = string; // Unformatted data ex. 0x004200
type Address = string; // subset of Data, representing addresses ex. 0x6b175474e89094c44da98b954eedeac495271d0f
type Quantity = string; // hex numbers ex. 0x400

interface NodeInfo {
  cheatcallsSpecVersion: string;
  bytecodeVerification: BytecodeVerification;
  runMode: RunMode;
  miningMode: MiningMode;
  impersonateAllStatus: boolean;
  nextBlockTimestamp: number;
  minGasPrice: Quantity;
  gasLimit: Quantity;
  nextBlockBaseFeePerGas: Quantity;
}

type RunMode =
  | { type: "new"; chainId: number }
  | {
      type: "fork";
      originRpc: url;
      blockNumber: number;
      forkChainId: number;
    };

type InputRunMode =
  | { type: "new"; chainId: number }
  | {
      type: "fork";
      originRpc: url;
      blockNumber?: number; // defaults to latest
      forkChainId?: number; // defaults to origin chain id
    };

type MiningMode =
  | { type: "auto" }
  | { type: "manual"; ordering: MiningOrdering }
  | { type: "interval"; intervalInSec: Quantity; ordering: MiningOrdering };

type InputMiningMode =
  | { type: "auto" }
  | { type: "manual"; ordering?: MiningOrdering }
  | { type: "interval"; intervalInSec: Quantity; ordering?: MiningOrdering };

type MiningOrdering =
  | "fees" // default
  | "fifo";

type BytecodeVerification =
  | {
      type: "not-supported";
    }
  | {
      type: "etherscan-like";
      url: string;
    };
```

### Mining modes

- `auto` (default) - mine txs as soon as they come
- `manual` - mine by manually calling `cheat_mine`
- `interval` - mine new blocks at constant intervals

`manual` and `interval` modes have mempools. Transactions can be dropped from a mempool with `cheat_dropTransaction(hash)`.

### Other

Exact behavior of each method, including edge cases is described in the [test suite](https://github.com/krzkaczor/edi-tests) (todo).

## Rationale

We decided to use new, unique prefix `cheat_` to avoid any naming collisions with currently implemented methods. This allows introducing this EIP without breaking backwards compatibility.

We dropped support for impersonating particular accounts in favour of impersonating all accounts with `cheat_impersonateAllAccounts`. We believe it's more convenient to do it like this.

<!--
  The rationale fleshes out the specification by describing what motivated the design and why particular design decisions were made. It should describe alternate designs that were considered and related work, e.g. how the feature is supported in other languages.

  The current placeholder is acceptable for a draft.

  TODO: Remove this comment before submitting
-->

## Backwards Compatibility

This EIP doesn't break any existing functionality in existing production grade nodes, eg: Geth, Reth, Nethermind, etc. This EIP however will affect to an extent, and deprecate certain RPCs in test nodes, eg: Hardhat, Anvil, Phoenix (BuildBear), etc. The RPCs that are being deprecated will be replaced by standardized RPCs that have been listed above in the proposal. User scripts, and other dependent tools/plugins might require minor changes, to be compatible.

## Test Cases

[edi-tests](https://github.com/krzkaczor/edi-tests) - Repository testing adherence to the spec.

## Implementation

@todo. Tips on how to implement `cheat_setErc20Balance` trace a balance call to find exact storage location to modify.

## Security Considerations

Todo: explain that cheatcalls should be only available in admin RPCs.

## Copyright Waiver

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
