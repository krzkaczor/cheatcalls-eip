# Ethereum Development Interface (EDI)

This repository contains EIP and tests For Ethereum Development Interface (EDI). A minimal set of RPC methods that any developer friendly, Ethereum node should implement.

## Spec

Spec with any supporting docs are placed in `spec` dir.

## Tests

Tests are placed in `spec-tests`.

```
pnpm install
# you need an .env file in ./spec-tests/.env based on .env.example
pnpm test
```

### Development

```
pnpm run fix
```
