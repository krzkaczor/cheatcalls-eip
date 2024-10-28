# Spec tests

The idea behind this test suite is to test how compliant with the spec different nodes are.
To smooth out some rough edges like different method names etc., we use a custom viem client which deals with calling appropriate methods.

```
pnpm install
# you need an .env file in ./spec-tests/.env based on .env.example
pnpm test
```

### Development

```
pnpm run fix
```
