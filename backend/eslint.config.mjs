import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        node: true,
        es2021: true,
        jest: true,
        console: true,
        process: true,
        module: true,
        require: true,
        __dirname: true,
        __filename: true,
        global: true,
        Buffer: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['src/controllers/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../services/**', '../models/**', '../utils/**', '../middlewares/**', '../validators/**', '../constants/**', '../config/**'],
              message: 'Controllers should only import from services, middlewares, validators, and utils',
            },
            {
              group: ['../../**'],
              message: 'Controllers should not use relative imports going up more than one level',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/services/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../controllers/**', '../routes/**', '../middlewares/**', '../validators/**'],
              message: 'Services should not import from controllers, routes, middlewares, or validators',
            },
            {
              group: ['../../**'],
              message: 'Services should not use relative imports going up more than one level',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/database/models/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../controllers/**', '../services/**', '../routes/**', '../middlewares/**', '../validators/**', '../utils/**', '../config/**'],
              message: 'Models should not import from other backend layers',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/utils/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../controllers/**', '../services/**', '../models/**', '../routes/**', '../middlewares/**', '../validators/**'],
              message: 'Utils should not import from business logic layers',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/', 'coverage/', '.git/'],
  },
];