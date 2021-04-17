'use strict';
/* eslint-env mocha */
const Linter = require('eslint').Linter;
const RuleTester = require('eslint').RuleTester;
const typescriptEslintParser = require('@typescript-eslint/parser');
const jsort = require('../../../lib/jsort');

const Options = {
  default: {
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
      requireConfigFile: false,
    },
  },
};

const createFormatter = () => {
  const tester = new Linter();

  tester.defineParser('@typescript-eslint/parser', typescriptEslintParser);

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

