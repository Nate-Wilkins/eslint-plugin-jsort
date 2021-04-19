'use strict';
/* eslint-env mocha */
const Linter = require('eslint').Linter;
const RuleTester = require('eslint').RuleTester;
const eslintParserBabel = require('@babel/eslint-parser');
const eslintParserTypescript = require('@typescript-eslint/parser');
const jsort = require('../../../lib/jsort');

const Options = {
  default: {
    parser: 'espree',
    parserOptions: {
      ecmaVersion: 2015,
      sourceType: 'module',
    },
  },
  typescript: {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2015,
      sourceType: 'module',
    },
  },
  babel: {
    parser: '@babel/eslint-parser',
    parserOptions: {
      ecmaVersion: 2015,
      sourceType: 'module',
      requireConfigFile: false,
      babelOptions: {
        presets: ['@babel/preset-flow'],
        plugins: [],
      },
    },
  },
};

const createFormatter = () => {
  const tester = new Linter();

  tester.defineParser('@babel/eslint-parser', eslintParserBabel);
  tester.defineParser('@typescript-eslint/parser', eslintParserTypescript);

  tester.defineRules({
    'sort-imports': jsort.rules['sort-imports'],
    'normalize-import-source': jsort.rules['normalize-import-source'],
  });

  return tester;
};

const createLinter = parserOptions => {
  const linter = new RuleTester({
    parserOptions,
  });

  return linter;
};

module.exports = {
  Options,
  createFormatter,
  createLinter,
};

