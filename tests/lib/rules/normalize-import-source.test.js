'use strict';
/* eslint-env mocha */
const expect = require('expect.js');
const { Options, createFormatter } = require('./util');

describe("'jsort/normalize-import-source' formats syntax successfully", () => {
  it(`${JSON.stringify({})} | uses defaults`, () => {
    const tester = createFormatter();
    expect(
      tester.verifyAndFix(
        `import { a } from './../a';
import { b } from './a';`,
        {
          ...Options.typescript,
          rules: {
            ['normalize-import-source']: ['error', {}],
          },
        },
      ),
    ).to.eql({
      fixed: true,
      messages: [],
      output: `import { a } from '../a';
import { b } from './a';`,
    });
  });

  it(`${JSON.stringify({})} | uses dynamic import`, () => {
    const tester = createFormatter();
    expect(
      tester.verifyAndFix(
        `import { a } from abc;
import { b } from './a';`,
        {
          ...Options.typescript,
          rules: {
            ['normalize-import-source']: 'error',
          },
        },
      ),
    ).to.eql({
      fixed: false,
      messages: [],
      output: `import { a } from abc;
import { b } from './a';`,
    });
  });

  it(`${JSON.stringify({
    sourceLocalImportType: 'include-cwd',
  })} | no change needed`, () => {
    const tester = createFormatter();
    expect(
      tester.verifyAndFix(
        `import { a } from './../a';
import { b } from './a';`,
        {
          ...Options.typescript,
          rules: {
            ['normalize-import-source']: [
              'error',
              {
                sourceLocalImportType: 'include-cwd',
              },
            ],
          },
        },
      ),
    ).to.eql({
      fixed: false,
      messages: [],
      output: `import { a } from './../a';
import { b } from './a';`,
    });
  });

  it(`${JSON.stringify({
    sourceLocalImportType: 'include-cwd',
  })} | change required`, () => {
    const tester = createFormatter();
    expect(
      tester.verifyAndFix(
        `import { a } from '../a';
import { b } from './a';`,
        {
          ...Options.typescript,
          rules: {
            ['normalize-import-source']: [
              'error',
              {
                sourceLocalImportType: 'include-cwd',
              },
            ],
          },
        },
      ),
    ).to.eql({
      fixed: true,
      messages: [],
      output: `import { a } from './../a';
import { b } from './a';`,
    });
  });

  it(`${JSON.stringify({
    sourceLocalImportType: 'exclude-cwd',
  })} | no change needed`, () => {
    const tester = createFormatter();
    expect(
      tester.verifyAndFix(
        `import { a } from '../a';
import { b } from './a';`,
        {
          ...Options.typescript,
          rules: {
            ['normalize-import-source']: [
              'error',
              {
                sourceLocalImportType: 'exclude-cwd',
              },
            ],
          },
        },
      ),
    ).to.eql({
      fixed: false,
      messages: [],
      output: `import { a } from '../a';
import { b } from './a';`,
    });
  });

  it(`${JSON.stringify({
    sourceLocalImportType: 'exclude-cwd',
  })} | change required`, () => {
    const tester = createFormatter();
    expect(
      tester.verifyAndFix(
        `import { a } from './../a';
import { b } from './a';`,
        {
          ...Options.typescript,
          rules: {
            ['normalize-import-source']: [
              'error',
              {
                sourceLocalImportType: 'exclude-cwd',
              },
            ],
          },
        },
      ),
    ).to.eql({
      fixed: true,
      messages: [],
      output: `import { a } from '../a';
import { b } from './a';`,
    });
  });

  it(`${JSON.stringify({
    sourceLocalImportType: 'invalid',
  })}`, () => {
    const tester = createFormatter();
    expect((text, options) => tester.verifyAndFix(text, options))
      .withArgs(
        `import { a } from './../a';
import { b } from './a';`,
        {
          ...Options.typescript,
          rules: {
            ['normalize-import-source']: [
              'error',
              {
                sourceLocalImportType: 'invalid',
              },
            ],
          },
        },
      )
      .to.throwException(
        /Unable to proceed. Configuration `sourceLocalImportType` must be 'exclude-cwd' or 'include-cwd'. Please use one of them./,
      );
  });
});

