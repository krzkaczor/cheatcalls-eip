// @ts-check

const tseslint = require('typescript-eslint')

module.exports = tseslint.config(
  tseslint.configs.base,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            {
              from: 'package',
              name: ['it', 'describe'],
              package: 'node:test',
            },
          ],
        },
      ],
      'func-style': ['error', 'declaration'],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
    },
  },
  {
    files: ['**/*.tsx'],
    ignores: ['node_modules/**/*', '**/node_modules/**/*'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      'func-style': ['error', 'declaration'],
    },
  },
)
