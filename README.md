# Cheatcalls EIP

| eip | title          | description | author                                                                                        | type | category  | status    | created    | discussions-to |
|-----|----------------|-------------|-----------------------------------------------------------------------------------------------|------|-----------|-----------|------------|----------------|
| eip-xxxx | Cheatcalls EIP | Standardization of Ethereum Development Methods | Kris Kaczor \<chris@kaczor.io\>, Piotr Szlachciak, Emmanuel Antony \<emmanuelantony2000@gmail.com\> | Standards Track | Interface | Pre-Draft | 2024-11-07 | <To be submitted after> |

## Abstract

Proposes a standardized set of JSON RPC methods to be implemented by all Ethereum development and testing environments. These methods cover common operations such as setting storage values, manipulating account balances, and interacting with ERC20 tokens. By adopting a consistent naming convention and behavior for these methods, we aim to simplify the development process, enhance code portability, and reduce the cognitive load on developers when working with different tools.
These new methods are similar to [cheatcodes](https://book.getfoundry.sh/forge/cheatcodes) available in Foundry or Hardhat tests but for JSON RPC calls, hence the name Cheatcalls.

## Motivation

Currently, Ethereum development and testing tools offer a variety of methods for manipulating the blockchain state during testing. While some methods share the same name across different platforms (e.g., `evm_increaseTime`), their behavior can vary significantly, especially in edge cases. Additionally, many methods are unique to specific tools (e.g., `hardhat_setStorageAt`, `tenderly_setStorageAt`, `tenderly_setErc20Balance`, `buildbear_ERC20Faucet`). Finally, often some functionality is completely missing from a given node. These inconsistencies create unnecessary complexity for developers and result in vendor lock-in.

## Specification

For a lack of better language, specification is described using TypeScript like type system. Arguments of the function should be passed as `params` in JSON RPC request. Example:

```sh
curl -X POST --data '{"jsonrpc":"2.0","method":"cheat_setBalance","params":["0x407d73d8a49eeb85d32cf465507dd71d507100c1", "0xDE0B6B3A7640000"],"id":1}'
```


### Type definitions

```typescript
// using conventions established in https://ethereum.org/en/developers/docs/apis/json-rpc/#conventions
type Data = "..."; // Unformatted data ex. 0x004200
type Address = "..."; // subset of Data, representing addresses ex. 0x6b175474e89094c44da98b954eedeac495271d0f
type Quantity = "..."; // hex numbers ex. 0x400

interface CheatcallsInfo {
  cheatcallsSpecVersion: string;
  runMode: RunMode;
  miningMode: MiningMode;
  impersonateAllEnabled: boolean;
  nextBlockTimestamp: Quantity;
  minGasPrice: Quantity;
  gasLimit: Quantity;
  nextBlockBaseFeePerGas: Quantity;
}

type RunMode =
  | { type: "genesis"; chainId: Quantity }
  | {
      type: "fork";
      originRpc: url;
      blockNumber: Quantity;
      forkChainId: Quantity;
    };

type InputRunMode =
  | { type: "new"; chainId: Quantity }
  | {
      type: "fork";
      originRpc: url;
      blockNumber?: Quantity | "latest"; // defaults to latest
      forkChainId?: Quantity | "origin"; // defaults to origin chain id
    };

type MiningMode =
  | { type: "auto" }
  | { type: "manual"; ordering: MiningOrdering }
  | { type: "interval"; intervalSeconds: Quantity; ordering: MiningOrdering };

type InputMiningMode =
  | { type: "auto" }
  | { type: "manual"; ordering?: MiningOrdering }
  | { type: "interval"; intervalSeconds: Quantity; ordering?: MiningOrdering };

type MiningOrdering =
  | "highest-fee-first" // default
  | "oldest-first"
  | "random";
```

### JSON RPC Methods

* `cheat_info(): CheatcallsInfo`
  * Returns information about the node and the state of different Cheatcalls.
  * `cheatcallsSpecVersion` should return `1.0.0` when node fully implements this EIP.
* `cheat_setBalance(account: Address, balance: Quantity): void`
* `cheat_setErc20Balance(token: Address, account: Address, balanceInBaseUnit: Quantity): void`
  * Balance is in base unit, i.e., 10^18 means 1 DAI (18 decimals)
  * This is a "best effort implementation". See `Implementation` section for further description.
* `cheat_setCode(account: Address, code: Data): void`
* `cheat_setNonce(account: Address, nonce: Quantity): void`
* `cheat_setStorageAt(account: Address, slot: Quantity, value: Quantity): void`
  * Throws if account is not a contract
* `cheat_setCoinbase(account: Address): void`
* `cheat_setMinGasPrice(priceInWei: Quantity | 'default'): void`
  * To unset, call with `default`.
* `cheat_setNextBlockBaseFeePerGas(priceInWei: Quantity | 'default'): void): void`
  * To unset, call with `default`.
* `cheat_setBlockGasLimit(gas: Quantity | 'default'): void`
  * `0` means no limit
* `cheat_impersonateAllAccounts(): void`
* `cheat_stopImpersonatingAllAccounts(): void`
* `cheat_mine(count: Quantity = 1, gapSeconds: Quantity = 1): void`
* `cheat_setMiningMode(mode: InputMiningMode): void`
  * Sets a mining mode. One of:
    * `auto` (default) - mine txs as soon as they come
    * `manual` - mine by manually calling `cheat_mine`
    * `interval` - mine new blocks at constant intervals
  * `manual` and `interval` modes have mempool. Transactions can be dropped from a mempool with `cheat_dropTransaction(hash)`.
* `cheat_dropTransaction(hash: Data): void`
  * Drops a tx from a mempool.
* `cheat_increaseTime(deltaSeconds: Quantity): void`
  * Mines a new block with a timestamp of `lastTimestamp + deltaSeconds`
* `cheat_setNextBlockTimestamp(nextTimestamp: Quantity | 'default'): void`
  * Does not mine a new block, but once new block is mined, it will have timestamp of exactly `nextTimestamp`. Any methods reading state such as `eth_call` respects new timestamp when queried for 'pending' block.
  * To unset, call with `default`.
* `cheat_snapshot(): Data`
  * Snapshots current state of the blockchain, including Cheatcalls related state like `nextBlockTimestamp`. Returned value can be any hex string (number? id?) but has to be unique.
* `cheat_revertSnapshot(id: Data)`
  * Replaces `evm_revert`. Throws if snapshot id was not found. Revert multiple times to the same snapshot MUST be supported.

Exact behavior of each method, including edge cases is described in the [test suite](https://github.com/krzkaczor/cheatcalls-eip/tree/main/spec-tests) (WIP).

## Rationale

We decided to use new, unique prefix `cheat_` to avoid any naming collisions with currently implemented methods.

To simplify overall interface we decided to drop possibility to impersonate a concrete account (`cheat_impersonateAccount`) amd instead use `cheat_impersonateAllAccounts` to impersonate all accounts.

`cheat_info` might be a good place to return instructions for automated contract code verification but at the moment we decided to remove it to keep this EIP simple.

### Alternative, client side approach

We realise that creating an industry wide standard is not easy. We are also researching alternative approach of providing a viem cheatcalls client that would
be a best effort implementation of the EIP and would smooth out some of the incompatibilities between nodes.

## Backwards Compatibility

Since we use a new prefix, it's fully backwards compatible.

Further extensions and iterations on this spec should follow semantic versioning. `CheatcallsInfo.cheatcallsSpecVersion` should be changed appropriately.

## Test Cases

An ongoing effort to create a test suite to ensure adherence to the specification is being tracked in [cheatcalls-eip](https://github.com/krzkaczor/cheatcalls-eip). The test suite is designed in a way that it can also test behaviour compatibility of already existing, legacy methods.

## Implementation

Since Cheatcalls implementation is tight to the underlying node, we don't present any reference implementation. However, here is some advice to implementors:
* `cheat_setErc20Balance` -- storage location of a balance for a given account can be discovered by tracing storage slots read during a balance call and then finding the exact slot by checking them one by one. Such approach was used to implement `deal` in forge-std ([#1](https://github.com/foundry-rs/forge-std/blob/ee000c6c27859065d7b3da6047345607c1d94a0d/src/StdCheats.sol#L734), [#2](https://github.com/foundry-rs/forge-std/blob/master/src/StdStorage.sol))

## Security Considerations

Careless usage of Cheatcalls can make the network unusable e.g. by changing storage slots of the smart contracts or moving funds out of accounts. Furthermore, it's possible to leak private information such as API keys in `CheatcallsInfo.runMode.originRpc`. This is why we recommend, not exposing Cheatcalls rpc endpoint publicly.

For local development nodes such as Hardhat and Anvil this is not a problem. However, nodes that expose public RPC endpoints such as Tenderly or BuildBear should consider splitting the RPC endpoint into two: public (with standard JSON-RPC methods) and admin (with Cheatcalls).

## Copyright Waiver

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
