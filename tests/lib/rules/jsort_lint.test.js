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

describe('jsort lints syntax successfully', () => {
  // Given a linter
  const linter = createLinter();

  // When running the linter against valid and invalid syntax
  // Then the correct error messages are shown to the user
  linter.run('sort-imports', jsort.rules['sort-imports'], {
    valid: [
      {
        code: `import { a, b, c } from './module';`,
        options: [],
      },
    ],

    invalid: [
      {
        code: `

import { c } from './module';
import { b, a } from './module';
`,
        errors: [{ message: 'Unexpected invalid variable.' }],
      },
    ],
  });
});

