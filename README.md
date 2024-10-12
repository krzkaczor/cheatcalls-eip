# Cheatcalls EIP

| eip | title          | description | author | type | category  | status | created    | discussions-to |
|-----|----------------|-------------|--------|------|-----------|--------|------------|----------------|
| eip-xxxx | Cheatcalls EIP | Standardization of Ethereum Development Methods | Kris Kaczor \<chris@kaczor.io\>, Emmanuel Antony \<emmanuelantony2000@gmail.com\> | Standards Track | Interface | Draft | 2024-11-12 | <To be submitted after> |

## Abstract

Proposes a standardized set of JSON RPC methods to be implemented by all Ethereum development and testing environments. These methods cover common operations such as setting storage values, manipulating account balances, and interacting with ERC20 tokens. By adopting a consistent naming convention and behavior for these methods, we aim to simplify the development process, enhance code portability, and reduce the cognitive load on developers when working with different tools.
These new methods are similar to [cheatcodes](https://book.getfoundry.sh/forge/cheatcodes) available in Foundry or Hardhat tests but for JSON RPC calls, hence a name Cheatcalls.

## Motivation

Currently, Ethereum development and testing tools offer a variety of methods for manipulating the blockchain state during testing. While some methods share the same name across different platforms (e.g., `evm_increaseTime`), their behavior can vary significantly, especially in edge cases. Additionally, many methods are unique to specific tools (e.g., `hardhat_setStorageAt`, `tenderly_setStorageAt`, `tenderly_setErc20Balance`, `buildbear_ERC20Faucet`). Finally, there are often times when some functionality is completely missing from a given node. These inconsistencies create unnecessary complexity for developers and result in vendor lock-in.

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

@todo: describe reset rationale
@todo: describe setErc20Balance rationale

## Backwards Compatibility

Since we use a new prefix, it's fully backwards compatible.

## Test Cases

An ongoing effort to create a test suite to ensure adherence to the spec is being tracked in [cheatcalls-eip](https://github.com/krzkaczor/cheatcalls-eip). The test suite is designed in a way that it can also test behaviour compatibility of already existing, legacy methods.

## Implementation

@todo. Tips on how to implement `cheat_setErc20Balance` trace a balance call to find exact storage location to modify.

## Security Considerations

Since using Cheatcalls can be used to make the underlying network unusable, it's recommended to not expose them publicly. For local development nodes such as Hardhat and Anvil this shouldn't be a problem. However, nodes that expose public RPC endpoints such as Tenderly or BuildBear should consider splitting the RPC endpoint into two: public (with standard JSON-RPC methods) and admin (with Cheatcalls).

## Copyright Waiver

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
