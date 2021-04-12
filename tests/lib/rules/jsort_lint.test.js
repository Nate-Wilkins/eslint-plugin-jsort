'use strict';
/* eslint-env mocha */
const jsort = require('../../../lib/jsort');
const RuleTester = require('eslint').RuleTester;

const parserOptions = {
  ecmaVersion: 2015,
  sourceType: 'module',
};

const createLinter = () => {
  const linter = new RuleTester({
    parserOptions,
  });

  return linter;
};

//describe('jsort lints syntax successfully', () => {
//  const linter = createLinter();
//  linter.run('sort-imports', jsort.rules['jsort-imports'], {
//    valid: [
//      {
//        code: `import { a, b, c } from './module';`,
//        options: [],
//      },
//    ],

//    invalid: [
//      {
//        code: `
//        //
//import { c } from './module';
//import { b, a } from './module';
//`,
//        errors: [{ message: 'Imports should be sorted.' }],
//      },
//    ],
//  });
//});

