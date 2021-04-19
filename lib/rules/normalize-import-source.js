/**
 * @fileoverview Normalize import declaration source.
 *
 * Requirements:
 *   - Should normalize import declaration source to include or exclude the cwd './' marker.
 *   - Should work with `jsort-imports`
 *
 * @author nate-wilkins <nwilkins2012@gmail.com> (https://github.com/nate-wilkins)
 * @license Apache-2.0 (c) 2021
 */
'use strict';

const DefaultConfig = {
  sourceLocalImportType: 'exclude-cwd',
};

const RegexStartsWithCwdSyntax = /^\.\/\.\.\//; // (ie: `import { a } from './../some-module';` not `import { a } from './some-module';`)
const RegexStartsWithoutCwdSyntax = /^\.\.\//; // (ie: `import { a } from '../some-module';`)

module.exports = {
  meta: {
    type: 'suggestion',

    docs: {
      description: 'enforce import declarations to normalized source paths',
      category: 'ECMAScript 6',
      recommended: true,
      url:
        'https://github.com/Nate-Wilkins/eslint-plugin-jsort/blob/main/docs/rules/jsort_normalize_import_source.md',
    },

    schema: [
      {
        // Normalize source paths to a particular type.
        // - exclude-cwd: Will chop off extra './' parts
        //   (ie `import { a } from './../some-module';` -> `import { a } from '../some-module';`)
        // - include-cwd: Will include an extra './' part
        //   (ie `import { a } from '../some-module';` -> `import { a } from './../some-module';`)
        sourceLocalImportType: {
          enum: ['exclude-cwd', 'include-cwd'],
          default: DefaultConfig.sourceLocalImportType,
        },
      },
    ],

    fixable: 'code',

    messages: {
      // TODO@nw: Can we make this more explicit? (ie exclude vs include?)
      normalizeImportSource: 'Import declaration source should be normalized.',
    },
  },
  create: function(context) {
    // Load config.
    const contextConfig = context.options[0] || {};
    const config = {
      sourceLocalImportType:
        typeof contextConfig.sourceLocalImportType === 'undefined'
          ? DefaultConfig.sourceLocalImportType
          : contextConfig.sourceLocalImportType,
    };

    // Validate configuration.
    if (
      config.sourceLocalImportType !== 'exclude-cwd' &&
      config.sourceLocalImportType !== 'include-cwd'
    ) {
      throw new Error(
        "Unable to proceed. Configuration `sourceLocalImportType` must be 'exclude-cwd' or 'include-cwd'. Please use one of them.",
      );
    }

    return {
      ImportDeclaration: function(node) {
        if (node.source.type !== 'Literal') {
          return;
        }

        // Normalize source paths.
        if (config.sourceLocalImportType === 'exclude-cwd') {
          if (RegexStartsWithCwdSyntax.exec(node.source.value)) {
            // Fix.
            context.report({
              node,
              messageId: 'normalizeImportSource',
              data: {
                memberName: node.source.value,
              },
              fix(fixer) {
                return [
                  fixer.replaceTextRange(
                    [node.source.range[0] + 1, node.source.range[1] - 1],
                    node.source.value.substring(2),
                  ),
                ];
              },
            });
          }
        } else {
          if (RegexStartsWithoutCwdSyntax.exec(node.source.value)) {
            // Fix.
            context.report({
              node,
              messageId: 'normalizeImportSource',
              data: {
                memberName: node.source.value,
              },
              fix(fixer) {
                return [
                  fixer.replaceTextRange(
                    [node.source.range[0] + 1, node.source.range[1] - 1],
                    (node.source.value = './' + node.source.value),
                  ),
                ];
              },
            });
          }
        }
      },
    };
  },
};

