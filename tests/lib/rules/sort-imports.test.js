'use strict';
/* eslint-env mocha */
const expect = require('expect.js');
const { Options, createFormatter } = require('./util');

//describe("'jsort/sort-imports' lints syntax successfully", () => {
//  const linter = createLinter();
//  linter.run('sort-imports', jsort.rules['sort-imports'], {
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

describe("'jsort/sort-imports' formats syntax successfully", () => {
  describe('all', () => {
    it(`${JSON.stringify({ ignoreCase: false })} | source sorting`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import a from 'Foo.js';
import b from 'foo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { ignoreCase: false }],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import b from 'foo.js';
import a from 'Foo.js';
`,
      });
    });

    it(`${JSON.stringify({ ignoreCase: true })} | source sorting`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import a from 'Foo.js';
import b from 'foo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { ignoreCase: true }],
            },
          },
        ),
      ).to.eql({
        fixed: false,
        messages: [],
        output: `import a from 'Foo.js';
import b from 'foo.js';`,
      });
    });

    it(`${JSON.stringify({
      ignoreCase: false,
    })} | format without whitespace`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `
import b from 'foo.js';
import a from 'Foo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { ignoreCase: false }],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import b from 'foo.js';
import a from 'Foo.js';
`,
      });
    });

    it(`${JSON.stringify({
      ignoreCase: false,
    })} | no format with only whitespace`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `

`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { ignoreCase: false }],
            },
          },
        ),
      ).to.eql({
        fixed: false,
        messages: [],
        output: `

`,
      });
    });

    it(`${JSON.stringify({
      ignoreCase: false,
    })} | no format with whitespace and no import declarations`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `

const x = 4;`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { ignoreCase: false }],
            },
          },
        ),
      ).to.eql({
        fixed: false,
        messages: [],
        output: `

const x = 4;`,
      });
    });

    it(`${JSON.stringify({
      ignoreCase: false,
    })} | format with whitespace and embeded import declarations`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `

const x = 4;
import a from './a';
import b from './b';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { ignoreCase: false }],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import a from './a';
import b from './b';
const x = 4;
`,
      });
    });

    it(`${JSON.stringify({
      ignoreCase: false,
    })} | no format with comments before declarations with whitespace`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `
// No touch.
import a from './a';
import b from './b';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { ignoreCase: false }],
            },
          },
        ),
      ).to.eql({
        fixed: false,
        messages: [
          {
            ruleId: 'sort-imports',
            severity: 2,
            message: 'Imports should be sorted.',
            line: 3,
            column: 1,
            nodeType: 'ImportDeclaration',
            messageId: 'sortImports',
            endLine: 3,
            endColumn: 21,
          },
        ],
        output: `
// No touch.
import a from './a';
import b from './b';`,
      });
    });

    it(`${JSON.stringify({
      ignoreCase: false,
    })} | no format with comments before declarations without whitespace`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `// No touch.
import a from './a';
import b from './b';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { ignoreCase: false }],
            },
          },
        ),
      ).to.eql({
        fixed: false,
        messages: [],
        output: `// No touch.
import a from './a';
import b from './b';`,
      });
    });

    it(`${JSON.stringify({ ignoreCase: false })} | specifier sorting`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { A, a } from 'foo.js';
import { B, b } from 'zoo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { ignoreCase: false }],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { a, A } from 'foo.js';
import { b, B } from 'zoo.js';
`,
      });
    });

    it(`${JSON.stringify({ ignoreCase: true })} | specifier sorting`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { A, a } from 'foo.js';
import { B, b } from 'zoo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { ignoreCase: true }],
            },
          },
        ),
      ).to.eql({
        fixed: false,
        messages: [],
        output: `import { A, a } from 'foo.js';
import { B, b } from 'zoo.js';`,
      });
    });

    it(`${JSON.stringify({
      maxLength: 30,
    })} | multiple imports within limits`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { b, B } from 'zoo.js';
import { a, A } from 'foo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { maxLength: 30 }],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { a, A } from 'foo.js';
import { b, B } from 'zoo.js';
`,
      });
    });

    it(`${JSON.stringify({
      maxLength: 30,
    })} | multiple imports outside limits`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { b, B } from 'zoo.js';
import { a, A, K, J } from 'foo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { maxLength: 30 }],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import {
  a,
  A,
  J,
  K
} from 'foo.js';
import { b, B } from 'zoo.js';
`,
      });
    });

    it(`${JSON.stringify({
      maxLength: 30,
      indent: '\t',
    })} | multiple imports outside limits`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { b, B } from 'zoo.js';
import { a, A, K, J } from 'foo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: ['error', { maxLength: 30, indent: '\t' }],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import {
\ta,
\tA,
\tJ,
\tK
} from 'foo.js';
import { b, B } from 'zoo.js';
`,
      });
    });

    it(`${JSON.stringify({
      ignoreDeclarationSort: false,
      ignoreMemberSort: false,
    })} | multiple imports varying specifiers`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { b, B } from 'zoo.js';
import { c, a } from 'foo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: [
                'error',
                { ignoreDeclarationSort: false, ignoreMemberSort: false },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { a, c } from 'foo.js';
import { b, B } from 'zoo.js';
`,
      });
    });

    it(`${JSON.stringify({
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
    })} | multiple imports varying specifiers`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { b, B } from 'zoo.js';
import { c, a } from 'foo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: [
                'error',
                { ignoreDeclarationSort: true, ignoreMemberSort: false },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { b, B } from 'zoo.js';
import { a, c } from 'foo.js';
`,
      });
    });

    it(`${JSON.stringify({
      ignoreDeclarationSort: false,
      ignoreMemberSort: true,
    })} | multiple imports varying specifiers`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { b, B } from 'zoo.js';
import { c, a } from 'foo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: [
                'error',
                { ignoreDeclarationSort: false, ignoreMemberSort: true },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { c, a } from 'foo.js';
import { b, B } from 'zoo.js';
`,
      });
    });

    it(`${JSON.stringify({
      ignoreDeclarationSort: true,
      ignoreMemberSort: true,
    })} | multiple imports varying specifiers`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { b, B } from 'zoo.js';
import { c, a } from 'foo.js';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: [
                'error',
                { ignoreDeclarationSort: true, ignoreMemberSort: true },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: false,
        messages: [],
        output: `import { b, B } from 'zoo.js';
import { c, a } from 'foo.js';`,
      });
    });

    it(`${JSON.stringify({
      memberSyntaxSortOrder: [
        'value-none',
        'value-all',
        'value-multiple',
        'value-default',
        'type-all',
        'type-multiple',
        'type-default',
      ],
    })} | sorts side effects`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import './c';
import './b';
import './a';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: [
                'error',
                {
                  memberSyntaxSortOrder: [
                    'value-none',
                    'value-all',
                    'value-multiple',
                    'value-default',
                    'type-all',
                    'type-multiple',
                    'type-default',
                  ],
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import './a';
import './b';
import './c';
`,
      });
    });

    it(`${JSON.stringify({
      forceCombineSameSources: false,
      forceSingleLineImports: true,
      forceExplicitTypeImports: true,
    })} | with import type specifiers`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { type multiple1, type multiple2, multiple3 } from './multiple_type.js';
import singleType from './single_type.js';
import type { multipleType1, multipleType2 } from './type_type.js';`,
          {
            ...Options.babel,
            rules: {
              ['sort-imports']: [
                'error',
                {
                  forceCombineSameSources: false,
                  forceSingleLineImports: true,
                  forceExplicitTypeImports: true,
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { multiple3 } from './multiple_type.js';
import singleType from './single_type.js';
import type { multiple1 } from './multiple_type.js';
import type { multiple2 } from './multiple_type.js';
import type { multipleType1 } from './type_type.js';
import type { multipleType2 } from './type_type.js';
`,
      });
    });

    it(`${JSON.stringify({
      forceCombineSameSources: true,
      forceSingleLineImports: false,
    })} | only multiple import specifiers`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { a as Z } from './util';
import { b as Y } from './util';
import { c as X } from './util';
import { d as W } from './../rules/util';`,
          {
            ...Options.default,
            rules: {
              ['sort-imports']: [
                'error',
                {
                  forceCombineSameSources: true,
                  forceSingleLineImports: false,
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { d as W } from './../rules/util';
import { a as Z, b as Y, c as X } from './util';
`,
      });
    });

    it(`${JSON.stringify({
      forceCombineSameSources: true,
      forceSingleLineImports: false,
      forceExplicitTypeImports: true,
    })} | mixed multiple and default import specifiers`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import G, { a as Z } from './util';
import H, { b as Y } from './util';
import { c as X } from './util';
import { d as W } from './../rules/util';`,
          {
            ...Options.typescript,
            rules: {
              ['sort-imports']: [
                'error',
                {
                  forceCombineSameSources: true,
                  forceSingleLineImports: false,
                  forceExplicitTypeImports: true,
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { d as W } from './../rules/util';
import G, { a as Z, b as Y, c as X } from './util';
import H from './util';
`,
      });
    });

    it(`${JSON.stringify({ sortByLocalImportNames: false })}`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { a as Z, b as Y, c as X } from './util-a';`,
          {
            ...Options.typescript,
            rules: {
              ['no-extra-semi']: ['error'],
              ['sort-imports']: [
                'error',
                {
                  sortByLocalImportNames: false,
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: false,
        messages: [],
        output: `import { a as Z, b as Y, c as X } from './util-a';`,
      });
    });

    it(`${JSON.stringify({ sortByLocalImportNames: true })}`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { a as Z, b as Y, c as X } from './util-a';`,
          {
            ...Options.typescript,
            rules: {
              ['no-extra-semi']: ['error'],
              ['sort-imports']: [
                'error',
                {
                  sortByLocalImportNames: true,
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { c as X, b as Y, a as Z } from './util-a';
`,
      });
    });
  });

  describe(`${JSON.stringify([
    '@typescript-eslint/parser',
    '@babel/eslint-parser',
  ])} | parsers supporting type import declarations`, () => {
    [Options.typescript, Options.babel].forEach(options => {
      it(`'${options.parser}' - ${JSON.stringify({
        memberSyntaxSortOrder: [
          'value-none',
          'value-all',
          'value-multiple',
          'value-default',
          'type-all',
          'type-multiple',
          'type-default',
        ],
      })}`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import 'none_type.js';
import * as allType from 'all_type.js';
import D, * as DAllType from 'all_type.js';
import { multipleType1, multipleType2 } from 'multiple_type.js';
import singleType from './single_type.js';
import type { typeType } from './type_type.js';`,
            {
              ...options,
              rules: {
                ['sort-imports']: [
                  'error',
                  {
                    memberSyntaxSortOrder: [
                      'value-none',
                      'value-all',
                      'value-multiple',
                      'value-default',
                      'type-all',
                      'type-multiple',
                      'type-default',
                    ],
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: false,
          messages: [],
          output: `import 'none_type.js';
import * as allType from 'all_type.js';
import D, * as DAllType from 'all_type.js';
import { multipleType1, multipleType2 } from 'multiple_type.js';
import singleType from './single_type.js';
import type { typeType } from './type_type.js';`,
        });
      });

      it(`'${options.parser}' - ${JSON.stringify({
        memberSyntaxSortOrder: [
          'value-all',
          'type-all',
          'type-multiple',
          'type-default',
          'value-default',
          'value-multiple',
          'value-none',
        ],
      })}`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import './none_type.js';
import * as allType from './all_type.js';
import { multipleType1, multipleType2 } from './multiple_type.js';
import singleType from './single_type.js';
import type { typeType } from './type_type.js';`,
            {
              ...options,
              rules: {
                ['sort-imports']: [
                  'error',
                  {
                    memberSyntaxSortOrder: [
                      'value-all',
                      'type-all',
                      'type-multiple',
                      'type-default',
                      'value-default',
                      'value-multiple',
                      'value-none',
                    ],
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: true,
          messages: [],
          output: `import * as allType from './all_type.js';
import type { typeType } from './type_type.js';
import singleType from './single_type.js';
import { multipleType1, multipleType2 } from './multiple_type.js';
import './none_type.js';
`,
        });
      });

      it(`'${options.parser}' - ${JSON.stringify({
        memberSyntaxSortOrder: [
          'value-none',
          'value-all',
          'value-multiple',
          'value-default',
          'type-all',
          'type-multiple',
          'type-default',
        ],
      })} | 'value-all' with default specifier`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import 'none_type.js';
import D, * as DAllType from 'all_type.js';
import * as allType from 'all_type.js';
import { multipleType1, multipleType2 } from 'multiple_type.js';
import singleType from './single_type.js';
import type { typeType } from './type_type.js';`,
            {
              ...options,
              rules: {
                ['sort-imports']: [
                  'error',
                  {
                    memberSyntaxSortOrder: [
                      'value-none',
                      'value-all',
                      'value-multiple',
                      'value-default',
                      'type-all',
                      'type-multiple',
                      'type-default',
                    ],
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: true,
          messages: [],
          output: `import 'none_type.js';
import * as allType from 'all_type.js';
import D, * as DAllType from 'all_type.js';
import { multipleType1, multipleType2 } from 'multiple_type.js';
import singleType from './single_type.js';
import type { typeType } from './type_type.js';
`,
        });
      });

      it(`'${options.parser}' - ${JSON.stringify({
        forceCombineSameSources: false,
        forceSingleLineImports: false,
      })}`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import { multiple1, multiple2 } from './multiple_type.js';
import singleType from './single_type.js';
import type { multipleType1, multipleType2 } from './type_type.js';`,
            {
              ...options,
              rules: {
                ['sort-imports']: [
                  'error',
                  {
                    forceCombineSameSources: false,
                    forceSingleLineImports: false,
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: false,
          messages: [],
          output: `import { multiple1, multiple2 } from './multiple_type.js';
import singleType from './single_type.js';
import type { multipleType1, multipleType2 } from './type_type.js';`,
        });
      });

      it(`'${options.parser}' - ${JSON.stringify({
        forceCombineSameSources: false,
        forceSingleLineImports: true,
      })}`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import { multiple1, multiple2 } from './multiple_type.js';
import singleType from './single_type.js';
import type { multipleType1, multipleType2 } from './type_type.js';`,
            {
              ...options,
              rules: {
                ['sort-imports']: [
                  'error',
                  {
                    forceCombineSameSources: false,
                    forceSingleLineImports: true,
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: true,
          messages: [],
          output: `import { multiple1 } from './multiple_type.js';
import { multiple2 } from './multiple_type.js';
import singleType from './single_type.js';
import type { multipleType1 } from './type_type.js';
import type { multipleType2 } from './type_type.js';
`,
        });
      });

      it(`'${options.parser}' - ${JSON.stringify({
        forceCombineSameSources: false,
        forceSingleLineImports: true,
      })} | works with additional rules`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import { multiple1, multiple2 } from '../multiple_type.js';;;
import singleType from './single_type.js';
import type { multipleType1, multipleType2 } from './type_type.js';`,
            {
              ...options,
              rules: {
                ['no-extra-semi']: ['error'],
                ['normalize-import-source']: [
                  'error',
                  {
                    sourceLocalImportType: 'include-cwd',
                  },
                ],
                ['sort-imports']: [
                  'error',
                  {
                    forceCombineSameSources: false,
                    forceSingleLineImports: true,
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: true,
          messages: [],
          output: `import { multiple1 } from './../multiple_type.js';
import { multiple2 } from './../multiple_type.js';
import singleType from './single_type.js';
import type { multipleType1 } from './type_type.js';
import type { multipleType2 } from './type_type.js';

`,
        });
      });

      it(`'${options.parser}' - ${JSON.stringify({
        forceCombineSameSources: true,
        forceSingleLineImports: true,
      })}`, () => {
        const tester = createFormatter();
        expect((text, options) => tester.verifyAndFix(text, options))
          .withArgs(
            `import { multiple1, multiple2 } from './multiple_type.js';
import singleType from './single_type.js';
import type { multipleType1, multipleType2 } from './type_type.js';`,
            {
              ...options,
              rules: {
                ['sort-imports']: [
                  'error',
                  {
                    forceCombineSameSources: true,
                    forceSingleLineImports: true,
                  },
                ],
              },
            },
          )
          .to.throwException(
            /Unable to proceed. Configuration `forceCombineSameSources` and `forceSingleLineImports` cannot both be enabled. Please disable one of them./,
          );
      });

      it(`'${options.parser}' - ${JSON.stringify({
        forceCombineSameSources: true,
        forceSingleLineImports: false,
        forceExplicitTypeImports: true,
      })} | type and value multiple import specifiers`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import { a as Z } from './util';
import { b as Y } from './util';
import type { c as X } from './util';
import { d as W } from './../rules/util';`,
            {
              ...options,
              rules: {
                ['sort-imports']: [
                  'error',
                  {
                    forceCombineSameSources: true,
                    forceSingleLineImports: false,
                    forceExplicitTypeImports: true,
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: true,
          messages: [],
          output: `import { d as W } from './../rules/util';
import { a as Z, b as Y } from './util';
import type { c as X } from './util';
`,
        });
      });

      it(`'${options.parser}' - ${JSON.stringify({
        forceCombineSameSources: true,
        forceSingleLineImports: false,
        forceExplicitTypeImports: true,
      })} | type and value mixed multiple and default import specifiers`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import G, { a as Z } from './util';
import H, { b as Y } from './util';
import { c as X } from './util';
import { d as W } from './../rules/util';
import type { e as O } from './util';
import type { f as N } from './util';
import type K from './util';`,
            {
              ...options,
              rules: {
                ['sort-imports']: [
                  'error',
                  {
                    forceCombineSameSources: true,
                    forceSingleLineImports: false,
                    forceExplicitTypeImports: true,
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: true,
          messages: [],
          output: `import { d as W } from './../rules/util';
import G, { a as Z, b as Y, c as X } from './util';
import H from './util';
import type { e as O, f as N } from './util';
import type K from './util';
`,
        });
      });

      it(`'${options.parser}' - ${JSON.stringify({
        forceCombineSameSources: true,
        forceSingleLineImports: false,
        forceExplicitTypeImports: true,
      })} | type and value mixed multiple and default and namespace import specifiers`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import G, { a as Z } from './util';
import H, { b as Y } from './util';
import { c as X } from './util';
import { d as W } from './../rules/util';
import type { e as O } from './util';
import type { f as N } from './util';
import type K from './util';
import type U, * as Q from './util';`,
            {
              ...options,
              rules: {
                ['sort-imports']: [
                  'error',
                  {
                    forceCombineSameSources: true,
                    forceSingleLineImports: false,
                    forceExplicitTypeImports: true,
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: true,
          messages: [],
          output: `import { d as W } from './../rules/util';
import G, { a as Z, b as Y, c as X } from './util';
import H from './util';
import type U, * as Q from './util';
import type { e as O, f as N } from './util';
import type K from './util';
`,
        });
      });

      it(`'${options.parser}' - ${JSON.stringify({
        sourceSortOrder: ['global', 'local'],
      })}`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import { Grid } from '@material-ui/core';
import Application from './Application.js';
import React from 'react';
import * as R from 'ramda';
import type { Node } from 'react';
import type { Control } from './util';
import { handleError } from './util';`,
            {
              ...options,
              rules: {
                ['no-extra-semi']: ['error'],
                ['sort-imports']: [
                  'error',
                  {
                    sourceSortOrder: ['global', 'local'],
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: true,
          messages: [],
          output: `import * as R from 'ramda';
import { Grid } from '@material-ui/core';
import React from 'react';
import type { Node } from 'react';
import { handleError } from './util';
import Application from './Application.js';
import type { Control } from './util';
`,
        });
      });

      it(`'${options.parser}' - ${JSON.stringify({
        sourceSortOrder: ['local', 'global'],
      })}`, () => {
        const tester = createFormatter();
        expect(
          tester.verifyAndFix(
            `import { Grid } from '@material-ui/core';
import Application from './Application.js';
import React from 'react';
import * as R from 'ramda';
import type { Node } from 'react';
import type { Control } from './util';
import { handleError } from './util';`,
            {
              ...options,
              rules: {
                ['no-extra-semi']: ['error'],
                ['sort-imports']: [
                  'error',
                  {
                    sourceSortOrder: ['local', 'global'],
                  },
                ],
              },
            },
          ),
        ).to.eql({
          fixed: true,
          messages: [],
          output: `import { handleError } from './util';
import Application from './Application.js';
import type { Control } from './util';
import * as R from 'ramda';
import { Grid } from '@material-ui/core';
import React from 'react';
import type { Node } from 'react';
`,
        });
      });
    });
  });

  describe("'@typescript-eslint/parser' | specific", () => {
    it(`'@typescript-eslint/parser' - ${JSON.stringify({
      memberSyntaxSortOrder: [
        'type-all',
        'value-all',
        'type-multiple',
        'value-default',
        'value-multiple',
        'type-default',
        'value-none',
      ],
    })} | includes 'type-all' imports`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import './none_type.js';
import type DefaultType from './default_type';
import * as allType from './all_type.js';
import { multipleType1, multipleType2 } from './multiple_type.js';
import singleType from './single_type.js';
import type { typeType } from './type_type.js';
import type * as NamespaceType from './namespace_type.js';`,
          {
            ...Options.typescript,
            rules: {
              ['sort-imports']: [
                'error',
                {
                  memberSyntaxSortOrder: [
                    'type-all',
                    'value-all',
                    'type-multiple',
                    'value-default',
                    'value-multiple',
                    'type-default',
                    'value-none',
                  ],
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import type * as NamespaceType from './namespace_type.js';
import * as allType from './all_type.js';
import type { typeType } from './type_type.js';
import singleType from './single_type.js';
import { multipleType1, multipleType2 } from './multiple_type.js';
import type DefaultType from './default_type';
import './none_type.js';
`,
      });
    });

    it(`'@typescript-eslint/parser' - ${JSON.stringify({
      sourceSortOrder: ['local', 'global'],
      memberSyntaxSortOrder: [
        'type-all',
        'value-all',
        'type-multiple',
        'value-default',
        'value-multiple',
        'type-default',
        'value-none',
      ],
    })} | includes 'type-all' imports`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { Grid } from '@material-ui/core';
import Application from './Application.js';
import React from 'react';
import * as R from 'ramda';
import type { Node } from 'react';
import type { Control } from './util';
import { handleError } from './util';
import type * as EverythingType from './everything.js';
import * as Everything from './everything.js';`,
          {
            ...Options.typescript,
            rules: {
              ['no-extra-semi']: ['error'],
              ['sort-imports']: [
                'error',
                {
                  sourceSortOrder: ['local', 'global'],
                  memberSyntaxSortOrder: [
                    'type-all',
                    'value-all',
                    'type-multiple',
                    'value-default',
                    'value-multiple',
                    'type-default',
                    'value-none',
                  ],
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import type * as EverythingType from './everything.js';
import * as Everything from './everything.js';
import type { Control } from './util';
import Application from './Application.js';
import { handleError } from './util';
import * as R from 'ramda';
import type { Node } from 'react';
import React from 'react';
import { Grid } from '@material-ui/core';
`,
      });
    });
  });

  describe("'@babel/eslint-parser' | specific", () => {
    it(`'@babel/eslint-parser' - ${JSON.stringify({
      forceCombineSameSources: true,
      forceSingleLineImports: false,
      forceExplicitTypeImports: false,
    })} | with import type specifiers`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { type a } from './util';
import { b } from './util';
import { c } from './util';
import { d } from './../rules/util';`,
          {
            ...Options.babel,
            rules: {
              ['sort-imports']: [
                'error',
                {
                  forceCombineSameSources: true,
                  forceSingleLineImports: false,
                  forceExplicitTypeImports: false,
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { d } from './../rules/util';
import { type a, b, c } from './util';
`,
      });
    });

    it(`'@babel/eslint-parser' - ${JSON.stringify({
      forceCombineSameSources: true,
      forceSingleLineImports: false,
      forceExplicitTypeImports: true,
    })} | with mixed value default specifier and type specifiers`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import A, { type a, b } from './util-a';
import { type c } from './util-a';
import { d } from './util-a';
`,
          {
            ...Options.babel,
            rules: {
              ['sort-imports']: [
                'error',
                {
                  forceCombineSameSources: true,
                  forceSingleLineImports: false,
                  forceExplicitTypeImports: true,
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import A, { b, d } from './util-a';
import type { a, c } from './util-a';
`,
      });
    });

    it(`'@babel/eslint-parser' - ${JSON.stringify({
      forceExplicitTypeImports: false,
    })}`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(`import { type a as Z } from './util-a';`, {
          ...Options.babel,
          rules: {
            ['sort-imports']: [
              'error',
              {
                forceExplicitTypeImports: false,
              },
            ],
          },
        }),
      ).to.eql({
        fixed: false,
        messages: [],
        output: `import { type a as Z } from './util-a';`,
      });
    });

    it(`'@babel/eslint-parser' - ${JSON.stringify({
      forceExplicitTypeImports: true,
    })}`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(`import { type a as Z } from './util-a';`, {
          ...Options.babel,
          rules: {
            ['sort-imports']: [
              'error',
              {
                forceExplicitTypeImports: true,
              },
            ],
          },
        }),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import type { a as Z } from './util-a';
`,
      });
    });

    it(`'@babel/eslint-parser' - ${JSON.stringify({
      forceCombineSameSources: true,
      forceSingleLineImports: false,
      forceExplicitTypeImports: true,
    })}`, () => {
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { type a, type b } from './util-a';
import { type c } from './util-a';
import type { d } from './util-a';`,
          {
            ...Options.babel,
            rules: {
              ['sort-imports']: [
                'error',
                {
                  forceCombineSameSources: true,
                  forceSingleLineImports: false,
                  forceExplicitTypeImports: true,
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import type { a, b, c, d } from './util-a';
`,
      });
    });

    it(`'@babel/eslint-parser' - ${JSON.stringify({
      forceCombineSameSources: true,
      forceExplicitTypeImports: false,
      forceSingleLineImports: false,
    })}`, () => {
      // NOTE: This is expected behavior, if you want types to be combined use `forceExplicitTypeImports`.
      //       We could technically support this by something like a `forceInlineTypeImports`...
      //       Definitely not a priority unless parsers start supporting this.
      const tester = createFormatter();
      expect(
        tester.verifyAndFix(
          `import { type a, type b } from './util-a';
import { type c } from './util-a';
import type { d } from './util-a';
import { e } from './util-a';`,
          {
            ...Options.babel,
            rules: {
              ['no-extra-semi']: ['error'],
              ['sort-imports']: [
                'error',
                {
                  forceCombineSameSources: true,
                  forceExplicitTypeImports: false,
                  forceSingleLineImports: false,
                },
              ],
            },
          },
        ),
      ).to.eql({
        fixed: true,
        messages: [],
        output: `import { type a, type b, type c, e } from './util-a';
import type { d } from './util-a';
`,
      });
    });
  });
});

