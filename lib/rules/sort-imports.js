/**
 * @fileoverview Sort imports by various criteria.
 *
 * Requirements:
 *   - Should work with all import declaration sources (global/local)
 *   - Should work with all import declaration specifier types (multiple/default/types/etc)
 *   - Should sort all import declarations by their source
 *   - Should sort all import declaration specifiers
 *   - Should combine "multiple" specifiers
 *   - Should not combine "namespace" specifiers with any other specifier type
 *   - Should group specifiers by type
 *   - Should work with indent size when formatting
 *   - Should work with max line length when formatting
 *
 * Sorting rules:
 *   - Return a negative number when the first argument should sort before the second
 *   - Return a positive number when the first argument should sort after the second
 *   - Return zero when the two items have equivalent sort keys
 *
 * @author nate-wilkins <nwilkins2012@gmail.com> (https://github.com/nate-wilkins)
 * @license Apache-2.0 (c) 2021
 */
'use strict';

const DefaultConfig = {
  forceCombineSameSources: true,
  forceExplicitDefaultImports: false,
  forceExplicitTypeImports: true,
  forceSingleLineImports: false,
  ignoreCase: false,
  ignoreDeclarationSort: false,
  ignoreMemberSort: false,
  indent: '  ',
  maxLength: 120,
  memberSyntaxSortOrder: [
    'value-none',
    'value-all',
    'value-multiple',
    'value-default',
    // 'type-none' N/A
    'type-all',
    'type-multiple',
    'type-default',
  ],
  sortByLocalImportNames: false,
  sortFunctionOrder: [
    'sourceSortOrder',
    'memberSyntaxSortOrder',
    'sourceName',
    'specifierCount',
  ],
  sourceSortOrder: ['global', 'local'],
};

const RegexStartsWithWhitespace = /^\s+/;

/*
 * Gets the used import declaration type.
 * This can be misleading, see the `memberSyntaxSortOrder` configuration for more info.
 * @param {ASTNode} importDeclaration the ImportDeclaration node.
 * @returns {string} used import declaration type.
 */
function getDeclarationType(importDeclaration) {
  if (importDeclaration.importKind === 'type') {
    // type-none: N/A
    if (
      importDeclaration.specifiers.some(
        specifier => specifier.type === 'ImportNamespaceSpecifier',
      )
    ) {
      return 'type-all';
    }
    if (
      importDeclaration.specifiers.length === 1 &&
      importDeclaration.specifiers[0].type === 'ImportDefaultSpecifier'
    ) {
      return 'type-default';
    }
    return 'type-multiple';
  } else {
    if (importDeclaration.specifiers.length === 0) {
      return 'value-none';
    }
    if (
      importDeclaration.specifiers.some(
        specifier => specifier.type === 'ImportNamespaceSpecifier',
      )
    ) {
      return 'value-all';
    }
    if (
      importDeclaration.specifiers.length === 1 &&
      importDeclaration.specifiers[0].type === 'ImportDefaultSpecifier'
    ) {
      return 'value-default';
    }
    return 'value-multiple';
  }
}

/*
 * Gets the used import declaration source type.
 * @param {ASTNode} importDeclaration the ImportDeclaration node.
 * @returns {string} used import declaration source type.
 */
function getDeclarationSourceType(importDeclaration) {
  return importDeclaration.source.value.startsWith('.') ||
    importDeclaration.source.value.startsWith('/')
    ? 'local'
    : 'global';
}

module.exports = {
  meta: {
    type: 'suggestion',

    docs: {
      description: 'enforce sorted import declarations within modules',
      category: 'ECMAScript 6',
      recommended: true,
      url: 'https://github.com/Nate-Wilkins/eslint-plugin-jsort/blob/main/docs/rules/jsort_imports.md',
    },

    schema: [
      {
        type: 'object',
        properties: {
          // Allow separate groups of imports.
          //   This is not included because I don't think it makes sense.
          //   If you want to stop import sorting you can drop a comment directly before/after imports.
          // allowSeparatedGroups

          // Whether or not to combine import declarations with the same source.
          // Make sure that `forceSingleLineImports` is disabled when this is enabled.
          // These options aren't combined to allow split group imports.
          forceCombineSameSources: {
            type: 'boolean',
            default: DefaultConfig.forceCombineSameSources,
          },

          // Force "*-default" specifiers to be inlined as "*-multiple".
          forceExplicitDefaultImports: {
            type: 'boolean',
            default: DefaultConfig.forceExplicitDefaultImports,
          },

          // Whether or not to have explicit type import declarations.
          // Will split mixed `value-multiple` and `type-multiple` import declarations into separate
          // import declarations.
          //
          // Example:
          //
          //   import { type TypeSpecifier, ValueSpecifier } from './util';
          //
          //   Formatted becomes:
          //
          //   import { ValueSpecifier } from './util';
          //   import type { TypeSpecifier } from './util';
          forceExplicitTypeImports: {
            type: 'boolean',
            default: DefaultConfig.forceExplicitTypeImports,
          },

          // TODO@nw: Fully import all exports from a namespace specifier.
          // forceMultilineForNamespaceImports: {}

          // Force single line imports for "value-multiple" and "type-multiple" import declaration types.
          // Make sure that `forceCombineSameSources` is disabled when this is enabled.
          // These options aren't combined to allow split group imports.
          forceSingleLineImports: {
            type: 'boolean',
            default: DefaultConfig.forceSingleLineImports,
          },

          // Whether or not to ignore casing when sorting.
          ignoreCase: {
            type: 'boolean',
            default: DefaultConfig.ignoreCase,
          },

          // Whether or not to ignore import declaration source sort.
          ignoreDeclarationSort: {
            type: 'boolean',
            default: DefaultConfig.ignoreDeclarationSort,
          },

          // Whether or not to ignore import specifier member sort.
          ignoreMemberSort: {
            type: 'boolean',
            default: DefaultConfig.ignoreMemberSort,
          },

          // TODO@nw: Should work with require statements
          // ignoreRequireStatements: {}

          // Indent type used when splitting import declarations on newlines.
          indent: { type: 'string', default: DefaultConfig.indent },

          // Max length of a "multiple" import declaration.
          maxLength: { type: 'number', default: DefaultConfig.maxLength },

          // Sort order of different types of import declarations.
          //
          // Available options:
          // - value-none
          // - value-all
          // - value-multiple
          // - value-default
          // - type-all
          // - type-multiple
          // - type-default
          //
          // It is important to note that this method assumes *two* main types of imports.
          // - "value"
          // - "type"
          //
          // This means that for libraries like `flow` and `eslint-plugin-flowtype` this plugin
          // will report a misleading `value-multiple` import declaration for inlined type imports.
          // (ie `import { type SomeTypeSpecifier, SomeValueSpecifier } from './lib';`)
          // However, there is an option called `forceExplicitTypeImports` which can split the import
          // declaration into their equivalent import type. See `forceExplicitTypeImports` for more
          // info.
          //
          // Examples:
          //
          // - Value
          //
          //   import './none';                               // value-none
          //   import * as namespace from './namespace';      // value-all
          //   import value from './default';                 // value-default
          //   import value, { multiple } from './multiple';  // value-multiple
          //   import { multiple } from './multiple';         // value-multiple
          //
          // - Type
          //
          //   import type * as S from './type.js';           // type-all
          //   import type A from './type.js';                // type-default
          //   import type { typeType } from './type.js'      // type-multiple
          //
          // - Other
          //
          //   import type './none';                          // N/A
          //   import type A as D from './type.js';           // N/A
          //   import single as d from './default.js';        // N/A
          //   import type from 'type.js';                    // value-default
          //
          // TODO@nw: Would be nice if there was a tool to convert flow type imports to explicit
          //          type imports.
          memberSyntaxSortOrder: {
            type: 'array',
            items: {
              enum: DefaultConfig.memberSyntaxSortOrder,
            },
            uniqueItems: true,
            minItems: 7,
            maxItems: 7,
          },

          // Whether or not to sort specifiers by their local defined name or imported name.
          // (ie `import { a as B } from './util';`)
          sortByLocalImportNames: {
            type: 'boolean',
            default: DefaultConfig.sortByLocalImportNames,
          },

          // What order to run sorting functions in.
          sortFunctionOrder: {
            type: 'array',
            items: {
              enum: DefaultConfig.sortFunctionOrder,
            },
            uniqueItems: true,
            minItems: 4,
            maxItems: 4,
          },

          // Group by import type.
          //
          // Examples:
          //
          // - Global
          //
          //   import { Grid } from '@material-ui/core';
          //   import React from 'react';
          //   import * as R from 'ramda';
          //   import type { Node } from 'react';
          //
          // - Local
          //
          //   import Application from './Application.js';
          //   import { handleError } from './util';
          //   import type { Control } from './util';
          //
          sourceSortOrder: {
            type: 'array',
            items: {
              enum: DefaultConfig.sourceSortOrder,
            },
            uniqueItems: true,
            minItems: 2,
            maxItems: 2,
          },
        },
        additionalProperties: false,
      },
    ],

    fixable: 'code',

    messages: {
      sortImports: 'Imports should be sorted.',
    },
  },

  create: function (context) {
    // Load config.
    const contextConfig = context.options[0] || {};
    const config = {
      forceCombineSameSources:
        typeof contextConfig.forceCombineSameSources === 'undefined'
          ? DefaultConfig.forceCombineSameSources
          : contextConfig.forceCombineSameSources,
      forceExplicitDefaultImports:
        typeof contextConfig.forceExplicitDefaultImports === 'undefined'
          ? DefaultConfig.forceExplicitDefaultImports
          : contextConfig.forceExplicitDefaultImports,
      forceExplicitTypeImports:
        typeof contextConfig.forceExplicitTypeImports === 'undefined'
          ? DefaultConfig.forceExplicitTypeImports
          : contextConfig.forceExplicitTypeImports,
      forceSingleLineImports:
        typeof contextConfig.forceSingleLineImports === 'undefined'
          ? DefaultConfig.forceSingleLineImports
          : contextConfig.forceSingleLineImports,
      ignoreCase:
        typeof contextConfig.ignoreCase === 'undefined'
          ? DefaultConfig.ignoreCase
          : contextConfig.ignoreCase,
      ignoreDeclarationSort:
        typeof contextConfig.ignoreDeclarationSort === 'undefined'
          ? DefaultConfig.ignoreDeclarationSort
          : contextConfig.ignoreDeclarationSort,
      ignoreMemberSort:
        typeof contextConfig.ignoreMemberSort === 'undefined'
          ? DefaultConfig.ignoreMemberSort
          : contextConfig.ignoreMemberSort,
      indent:
        typeof contextConfig.indent === 'undefined'
          ? DefaultConfig.indent
          : contextConfig.indent,
      maxLength:
        typeof contextConfig.maxLength === 'undefined'
          ? DefaultConfig.maxLength
          : contextConfig.maxLength,
      memberSyntaxSortOrder:
        typeof contextConfig.memberSyntaxSortOrder === 'undefined'
          ? DefaultConfig.memberSyntaxSortOrder
          : contextConfig.memberSyntaxSortOrder,
      sortByLocalImportNames:
        typeof contextConfig.sortByLocalImportNames === 'undefined'
          ? DefaultConfig.sortByLocalImportNames
          : contextConfig.sortByLocalImportNames,
      sortFunctionOrder:
        typeof contextConfig.sortFunctionOrder === 'undefined'
          ? DefaultConfig.sortFunctionOrder
          : contextConfig.sortFunctionOrder,
      sourceSortOrder:
        typeof contextConfig.sourceSortOrder === 'undefined'
          ? DefaultConfig.sourceSortOrder
          : contextConfig.sourceSortOrder,
    };

    // Validate configuration.
    if (config.forceCombineSameSources && config.forceSingleLineImports) {
      throw new Error(
        'Unable to proceed. Configuration `forceCombineSameSources` and `forceSingleLineImports` cannot both be enabled. Please disable one of them.',
      );
    }
    if (
      !(config.sortFunctionOrder instanceof Array) ||
      config.sortFunctionOrder.length !== 4
    ) {
      throw new Error(
        `Unable to proceed. Configuration \`sortFunctionOrder\` must be an Array of ${JSON.stringify(
          DefaultConfig.sortFunctionOrder,
        )} with length 4.`,
      );
    }
    for (const sortFunctionName of config.sortFunctionOrder) {
      if (!DefaultConfig.sortFunctionOrder.includes(sortFunctionName)) {
        throw new Error(
          `Unable to proceed. Configuration \`sortFunctionOrder\` must be an Array of ${JSON.stringify(
            DefaultConfig.sortFunctionOrder,
          )} with length 4. Received '${sortFunctionName}'.`,
        );
      }
    }

    /*
     * Creates the corresponding source for the provided import declaration node.
     * @param {ASTNode & { declarationType: string }} importDeclaration the ImportDeclaration node.
     * @returns {string} equivalent import declaration source code
     */
    function createImportDeclarationSource(importDeclaration) {
      // TODO@nw: What does prettier do when these lines go over the max length?
      switch (importDeclaration.declarationType) {
        case 'value-none':
          return `import ${importDeclaration.node.source.raw};`;

        case 'value-all': {
          // Default specifiers.
          const defaultSpecifiersSource = importDeclaration.node.specifiers
            .filter(specifier => specifier.type === 'ImportDefaultSpecifier')
            .map(specifier => {
              return specifier.local.name;
            })
            // Should never happen zero | one expected.
            .join(', ');

          // Namespace specifier.
          const namespaceSpecifiersSource = importDeclaration.node.specifiers
            .filter(specifier => specifier.type === 'ImportNamespaceSpecifier')
            .map(specifier => {
              return specifier.local.name;
            })
            // Should never happen one expected.
            .join(', ');

          return `import ${
            defaultSpecifiersSource ? `${defaultSpecifiersSource}, ` : ''
          }* as ${namespaceSpecifiersSource} from ${
            importDeclaration.node.source.raw
          };`;
        }

        case 'value-multiple': {
          // Multiple specifiers.
          const multipleSpecifiersSourceUsed = [];
          const multipleSpecifiersSource = importDeclaration.node.specifiers
            .filter(specifier => specifier.type === 'ImportSpecifier')
            // Track specifiers with same names.
            // Applies to parsers that don't error out on specifiers with the same name.
            .filter(specifier => {
              const found =
                multipleSpecifiersSourceUsed.indexOf(
                  `${specifier.imported.name}:${specifier.local.name}`,
                ) === -1;

              multipleSpecifiersSourceUsed.push(
                `${specifier.imported.name}:${specifier.local.name}`,
              );

              return found;
            })
            .map(specifier => {
              const specifierLocalName =
                specifier.imported.name === specifier.local.name
                  ? ''
                  : ` as ${specifier.local.name}`;
              // NOTE: FlowJS allows specifiers to have an import kind.
              //       See `forceExplicitTypeImports` for more info.
              return `${specifier.importKind === 'type' ? 'type ' : ''}${
                specifier.imported.name
              }${specifierLocalName}`;
            });

          // Default specifiers.
          const defaultSpecifiersSource = importDeclaration.node.specifiers
            .filter(specifier => specifier.type === 'ImportDefaultSpecifier')
            .map(specifier => {
              return specifier.local.name;
            })
            // Should never happen zero | one expected.
            .join(', ');

          // Try a single line import.
          const singlLineSource = multipleSpecifiersSource.join(', ');
          const singleLine = `import ${
            defaultSpecifiersSource ? `${defaultSpecifiersSource}, ` : ''
          }{ ${singlLineSource} } from ${importDeclaration.node.source.raw};`;
          if (singleLine.length <= config.maxLength) {
            return singleLine;
          }

          // Try multi line imports.
          const importMultipleSourceCodeMultiLine =
            multipleSpecifiersSource.join(`,\n${config.indent}`);

          return `import ${
            defaultSpecifiersSource ? `${defaultSpecifiersSource}, ` : ''
          }{\n${config.indent}${importMultipleSourceCodeMultiLine}\n} from ${
            importDeclaration.node.source.raw
          };`;
        }

        case 'value-default':
          return `import ${importDeclaration.node.specifiers[0].local.name} from ${importDeclaration.node.source.raw};`;

        case 'type-all': {
          // Default specifiers.
          const defaultSpecifiersSource = importDeclaration.node.specifiers
            .filter(specifier => specifier.type === 'ImportDefaultSpecifier')
            .map(specifier => {
              return specifier.local.name;
            })
            // Should never happen zero | one expected.
            .join(', ');

          // Namespace specifier.
          const namespaceSpecifiersSource = importDeclaration.node.specifiers
            .filter(specifier => specifier.type === 'ImportNamespaceSpecifier')
            .map(specifier => {
              return specifier.local.name;
            })
            // Should never happen one expected.
            .join(', ');

          return `import type ${
            defaultSpecifiersSource ? `${defaultSpecifiersSource}, ` : ''
          }* as ${namespaceSpecifiersSource} from ${
            importDeclaration.node.source.raw
          };`;
        }

        case 'type-multiple': {
          // Multiple specifiers.
          // NOTE: This will always be 1 or more import specifier.
          const multipleSpecifiersSource = importDeclaration.node.specifiers
            .filter(specifier => specifier.type === 'ImportSpecifier')
            .map(specifier => {
              const specifierLocalName =
                specifier.imported.name === specifier.local.name
                  ? ''
                  : ` as ${specifier.local.name}`;
              return `${specifier.imported.name}${specifierLocalName}`;
            });

          // Try a single line import.
          const singlLineSource = multipleSpecifiersSource.join(', ');
          const singleLine = `import type { ${singlLineSource} } from ${importDeclaration.node.source.raw};`;
          if (singleLine.length <= config.maxLength) {
            return singleLine;
          }

          // Try multi line imports.
          const importMultipleSourceCodeMultiLine =
            multipleSpecifiersSource.join(`,\n${config.indent}`);
          return `import type {\n${config.indent}${importMultipleSourceCodeMultiLine}\n} from ${importDeclaration.node.source.raw};`;
        }

        case 'type-default':
          return `import type ${importDeclaration.node.specifiers[0].local.name} from ${importDeclaration.node.source.raw};`;
      }
    }

    /*
     * Gets the corresponding group index with the provided config.
     * @param {string} declarationType the ImportDeclaration node declaration type.
     * @returns {number} the group index by member syntax sort order.
     */
    function getDeclarationTypeGroupIndex(declarationType) {
      return config.memberSyntaxSortOrder.indexOf(declarationType);
    }

    /*
     * Gets the corresponding group index with the provided config.
     * @param {string} declarationSourceType the ImportDeclaration node source type.
     * @param {number} the group index by source sort order.
     */
    function getDeclarationSourceTypeGroupIndex(declarationSourceType) {
      return config.sourceSortOrder.indexOf(declarationSourceType);
    }

    /*
     * Sort by declaration type.
     * @param {ASTNode} a the ImportDeclaration node.
     * @param {ASTNode} b the ImportDeclaration node to compare against.
     * @returns {number} sort comparison
     */
    function sortByDeclarationTypeGroupIndex(a, b) {
      const aTypeGroupIndex = getDeclarationTypeGroupIndex(a.declarationType);
      const bTypeGroupIndex = getDeclarationTypeGroupIndex(b.declarationType);
      if (aTypeGroupIndex < bTypeGroupIndex) {
        return -1;
      } else if (aTypeGroupIndex > bTypeGroupIndex) {
        return 1;
      } else {
        return 0;
      }
    }

    /*
     * Sort by declaration source type.
     * @param {ASTNode} a the ImportDeclaration node.
     * @param {ASTNode} b the ImportDeclaration node to compare against.
     * @returns {number} sort comparison
     */
    function sortByDeclarationSourceTypeGroupIndex(a, b) {
      const aSourceSortGroupIndex = getDeclarationSourceTypeGroupIndex(
        a.declarationSourceType,
      );
      const bSourceSortGroupIndex = getDeclarationSourceTypeGroupIndex(
        b.declarationSourceType,
      );
      if (aSourceSortGroupIndex < bSourceSortGroupIndex) {
        return -1;
      } else if (aSourceSortGroupIndex > bSourceSortGroupIndex) {
        return 1;
      } else {
        return 0;
      }
    }

    /*
     * Sort by source name.
     * @param {ASTNode} a the ImportSpecifier node.
     * @param {ASTNode} b the ImportSpecifier node to compare against.
     * @returns {number} sort comparison
     */
    function sortBySourceName(a, b) {
      // Are we ignoring case?
      if (config.ignoreCase) {
        return a.node.source.value
          .toLowerCase()
          .localeCompare(b.node.source.value.toLowerCase());
      } else {
        return a.node.source.value.localeCompare(b.node.source.value);
      }
    }

    /*
     * Sort by specifier count.
     * @param {ASTNode} a the ImportSpecifier node.
     * @param {ASTNode} b the ImportSpecifier node to compare against.
     * @returns {number} sort comparison
     */
    function sortBySpecifierCount(a, b) {
      // Ignore sorting deletes.
      if (a.deleted || b.deleted) {
        return 0;
      }

      if (a.node.specifiers.length < b.node.specifiers.length) {
        return -1;
      } else if (a.node.specifiers.length > b.node.specifiers.length) {
        return 1;
      } else {
        return 0;
      }
    }

    /*
     * Sort by specifier default type first.
     * @param {ASTNode} a the ImportSpecifier node.
     * @param {ASTNode} b the ImportSpecifier node to compare against.
     * @returns {number} sort comparison
     */
    function sortBySpecifierDefault(a, b) {
      if (
        a.type !== 'ImportDefaultSpecifier' &&
        b.type === 'ImportDefaultSpecifier'
      ) {
        return 1;
      } else {
        // ImportDefaultSpecifier exists only once.
        return 0;
      }
    }

    /*
     * Sort by specifier name.
     * @param {ASTNode} a the ImportSpecifier node.
     * @param {ASTNode} b the ImportSpecifier node to compare against.
     * @returns {number} sort comparison
     */
    function sortBySpecifierName(a, b) {
      // Use local vs imported name?
      const aName = !config.sortByLocalImportNames
        ? a.imported.name
        : a.local.name;
      const bName = !config.sortByLocalImportNames
        ? b.imported.name
        : b.local.name;

      // Are we ignoring case?
      if (config.ignoreCase) {
        return aName.toLowerCase().localeCompare(bName.toLowerCase());
      } else {
        return aName.localeCompare(bName);
      }
    }

    /*
     * Gets the combined source format used to store and retrieve combined import declarations.
     * @param {ASTNode} node the ImportDeclaration node.
     * @returns {string} combined source format. (ie 'type:./util.js' or 'value:./util.js')
     */
    function getCombinedSourceFormat(node) {
      return `${node.importKind === 'type' ? 'type' : 'value'}:${
        node.source.value
      }`;
    }

    /*
     * Gets the import kind from the provided combined source format.
     * @param {string} format
     * @return {string} import kind
     */
    function getImportKindFromCombinedSourceFormat(format) {
      return format.split(':')[0];
    }

    /*
     * Gets a sorting function by configuration name.
     * @param {string} name sort function name
     * @returns {Function} sort function
     */
    function getSortFunctionFromName(name) {
      return {
        memberSyntaxSortOrder: sortByDeclarationTypeGroupIndex,
        sourceName: sortBySourceName,
        sourceSortOrder: sortByDeclarationSourceTypeGroupIndex,
        specifierCount: sortBySpecifierCount,
      }[name];
    }

    const sourceCode = context.getSourceCode();

    let programNode = null;
    let importDeclarations = [];
    let isUsingDynamicImports = false;
    let importDeclarationSortByFunctions = config.sortFunctionOrder.map(
      getSortFunctionFromName,
    );

    return {
      Program: function (node) {
        programNode = node;
      },
      ImportDeclaration: function (node) {
        if (node.source.type !== 'Literal') {
          isUsingDynamicImports = true;
          return;
        }

        // Collect import declarations.
        importDeclarations.push({
          node,
          hasCommentsAttached: !!(
            sourceCode.getCommentsBefore(node).length ||
            sourceCode.getCommentsAfter(node).length
          ),
          declarationType: getDeclarationType(node),
          declarationSourceType: getDeclarationSourceType(node),
          // Can be marked as created to skip from code removal.
          created: false,
          // Can be marked as deleted to skip from code generation.
          deleted: false,
        });
      },
      onCodePathEnd: function () {
        // If there are dynamic imports, don't sort.
        if (isUsingDynamicImports) {
          return null;
        }

        // Is there whitespace before the first declaration and we have import declarations to sort?
        const firstNodeAfterProgramWhitespace =
          importDeclarations.length > 0 &&
          RegexStartsWithWhitespace.exec(sourceCode.text) &&
          programNode.body[0];

        // Force explicit type imports.
        let firstUnsplitTypeImportDeclaration = null;
        if (config.forceExplicitTypeImports) {
          importDeclarations = importDeclarations.reduce(
            (aggregate, importDeclaration) => {
              // Are there type import specifiers?
              // TODO@nw: Probably could be speed up a bit.
              //          Maybe also combine with split import declaration logic.
              if (
                importDeclaration.node.specifiers.some(
                  specifier => specifier.importKind === 'type',
                )
              ) {
                // Determines if split occurred, if so track first split import declaration.
                if (firstUnsplitTypeImportDeclaration === null) {
                  firstUnsplitTypeImportDeclaration = importDeclaration.node;
                }

                // Remove original import declaration.
                importDeclaration.deleted = true;
                aggregate.push(importDeclaration);

                // Group specifiers by import kind.
                const { specifiersType, specifiersValue } =
                  importDeclaration.node.specifiers.reduce(
                    (aggregateSpecifiers, specifier) => {
                      if (specifier.importKind === 'type') {
                        aggregateSpecifiers.specifiersType.push(specifier);
                      } else {
                        aggregateSpecifiers.specifiersValue.push(specifier);
                      }

                      // Remove specifier import kind.
                      specifier.importKind = null;

                      return aggregateSpecifiers;
                    },
                    { specifiersType: [], specifiersValue: [] },
                  );

                // Create split type import declaration.
                const splitTypeImportDeclarationNode = {
                  ...importDeclaration.node,
                  source: {
                    ...importDeclaration.node.source,
                    range: [...importDeclaration.node.source.range],
                  },
                  loc: {
                    ...importDeclaration.node.loc,
                  },
                  specifiers: specifiersType,
                  importKind: 'type',
                };
                const splitTypeImportDeclaration = {
                  // Clone original import declaration.
                  ...importDeclaration,
                  created: true,
                  deleted: false,
                  node: splitTypeImportDeclarationNode,
                  // Recalculate declaration type, since it might have changed.
                  declarationType: getDeclarationType(
                    splitTypeImportDeclarationNode,
                  ),
                };
                aggregate.push(splitTypeImportDeclaration);

                // Create split value import declaration.
                if (specifiersValue.length > 0) {
                  const splitValueImportDeclarationNode = {
                    ...importDeclaration.node,
                    source: {
                      ...importDeclaration.node.source,
                      range: [...importDeclaration.node.source.range],
                    },
                    loc: {
                      ...importDeclaration.node.loc,
                    },
                    specifiers: specifiersValue,
                    importKind: 'value',
                  };
                  const splitValueImportDeclaration = {
                    // Clone original import declaration.
                    ...importDeclaration,
                    created: true,
                    deleted: false,
                    node: splitValueImportDeclarationNode,
                    // Recalculate declaration type, since it might have changed.
                    declarationType: getDeclarationType(
                      splitValueImportDeclarationNode,
                    ),
                  };
                  aggregate.push(splitValueImportDeclaration);
                }

                importDeclaration.asdfoinasodfina = true;
              } else {
                aggregate.push(importDeclaration);
              }

              return aggregate;
            },
            [],
          );
        }

        // Force default imports inline.
        let firstUnsplitDefaultImportDeclaration = null;
        if (config.forceExplicitDefaultImports) {
          importDeclarations = importDeclarations.reduce(
            (aggregate, importDeclaration) => {
              // Skip if we've already deleted it.
              if (importDeclaration.deleted) {
                aggregate.push(importDeclaration);
                return aggregate;
              }

              // Split import declarations that have multiple specifiers.
              if (
                importDeclaration.node.specifiers.length >= 1 &&
                importDeclaration.node.specifiers[0].type ===
                  'ImportDefaultSpecifier'
              ) {
                const defaultSpecifier = importDeclaration.node.specifiers[0];

                // Determine if split occurred, if so track first split import declaration.
                if (firstUnsplitDefaultImportDeclaration === null) {
                  firstUnsplitDefaultImportDeclaration = importDeclaration.node;
                }

                // Remove original import declaration.
                importDeclaration.deleted = true;
                aggregate.push(importDeclaration);

                // Set default specifier inline.
                defaultSpecifier.type = 'ImportSpecifier';
                defaultSpecifier.imported = {
                  type: 'Identifier',
                  name: 'default',
                };

                // Create split import declarations.
                const splitImportDeclarationNode = {
                  ...importDeclaration.node,
                  source: {
                    ...importDeclaration.node.source,
                    range: [...importDeclaration.node.source.range],
                  },
                  loc: {
                    ...importDeclaration.node.loc,
                  },
                  // Only keep split specifier.
                  specifiers: importDeclaration.node.specifiers,
                };
                const splitImportDeclaration = {
                  // Clone original import declaration.
                  ...importDeclaration,
                  created: true,
                  deleted: false,
                  node: splitImportDeclarationNode,
                  // Recalculate declaration type, since it might have changed.
                  declarationType: getDeclarationType(
                    splitImportDeclarationNode,
                  ),
                };

                aggregate.push(splitImportDeclaration);
              } else {
                aggregate.push(importDeclaration);
              }

              return aggregate;
            },
            [],
          );
        }

        // Force single line imports.
        let firstUnsplitImportDeclaration = null;
        if (config.forceSingleLineImports) {
          importDeclarations = importDeclarations.reduce(
            (aggregate, importDeclaration) => {
              // Skip if we've already deleted it.
              if (importDeclaration.deleted) {
                aggregate.push(importDeclaration);
                return aggregate;
              }

              // Split import declarations that have multiple specifiers.
              if (
                importDeclaration.node.specifiers.length > 1 &&
                (importDeclaration.declarationType === 'value-multiple' ||
                  importDeclaration.declarationType === 'type-multiple')
              ) {
                // Determines if split occurred, if so track first split import declaration.
                if (firstUnsplitImportDeclaration === null) {
                  firstUnsplitImportDeclaration = importDeclaration.node;
                }

                // Remove original import declaration.
                importDeclaration.deleted = true;
                aggregate.push(importDeclaration);

                // Create split import declarations.
                aggregate = aggregate.concat(
                  importDeclaration.node.specifiers.map(specifier => {
                    // What is this import declaration import kind?
                    const importKind =
                      specifier.importKind === 'type'
                        ? 'type' // Specifier type import kind takes priority.
                        : importDeclaration.node.importKind;
                    // Remove specifier import kind.
                    specifier.importKind = null;

                    const splitImportDeclarationNode = {
                      ...importDeclaration.node,
                      source: {
                        ...importDeclaration.node.source,
                        range: [...importDeclaration.node.source.range],
                      },
                      loc: {
                        ...importDeclaration.node.loc,
                      },
                      // Only keep split specifier.
                      specifiers: [specifier],
                      importKind,
                    };
                    const splitImportDeclaration = {
                      // Clone original import declaration.
                      ...importDeclaration,
                      created: true,
                      deleted: false,
                      node: splitImportDeclarationNode,
                      // Recalculate declaration type, since it might have changed.
                      declarationType: getDeclarationType(
                        splitImportDeclarationNode,
                      ),
                    };

                    return splitImportDeclaration;
                  }),
                );
              } else {
                aggregate.push(importDeclaration);
              }

              return aggregate;
            },
            [],
          );
        }

        // Force combine same source imports.
        let firstCombinedImportDeclaration = null;
        if (config.forceCombineSameSources) {
          // Collect import declarations that have multiple specifiers of the same source.
          const commonSourceImportDeclarations = importDeclarations.reduce(
            (aggregate, importDeclaration) => {
              // Skip if we've already deleted it.
              if (importDeclaration.deleted) {
                return aggregate;
              }

              if (
                importDeclaration.node.specifiers.length >= 1 &&
                (importDeclaration.declarationType === 'value-multiple' ||
                  importDeclaration.declarationType === 'type-multiple')
              ) {
                if (
                  !aggregate[getCombinedSourceFormat(importDeclaration.node)]
                ) {
                  // Track first combined import declaration.
                  aggregate[getCombinedSourceFormat(importDeclaration.node)] = [
                    importDeclaration,
                  ];
                } else {
                  // Track additional import declaration.
                  aggregate[
                    getCombinedSourceFormat(importDeclaration.node)
                  ].push(importDeclaration);
                }
              }

              return aggregate;
            },
            {},
          );

          // Iterate through common source import declarations to see if any can be combined.
          // These rules apply to type imports the same way.
          //
          // Case One
          //   A:
          //   - "*-default"
          //   - "*-multiple"
          //   B:
          //   - "*-default"
          //   - "*-multiple"
          //
          //   Examples:
          //
          //   - (✗) Not Combined
          //
          //         `import A, { X, Y } from './foo';`      // Has default specifier with multiple specifiers.
          //         `import B, { Z } from './foo';`         // Has default specifier with multiple specifiers.
          //
          //   - (✓) Already Combined
          //
          //         `import A, { X, Y, Z } from './foo';`   // Has default specifier with multiple specifiers.
          //         `import B              from './foo';`   // Has default specifier without multiple specifiers.
          //
          //   TODO@nw: Report on these duplicated default import specifiers.  Maybe as a separate rule?
          //
          // Case Two
          //   A:
          //   - "*-default"
          //   - "*-multiple"
          //   B:
          //   - ! "*-default"
          //   - "*-multiple"
          //
          //   Examples:
          //
          //   - (✗) Not Combined
          //
          //         `import A, { X, Y } from './foo';`      // Has default specifier with multiple specifiers.
          //         `import    { Z } from './foo';`         // Has multiple specifiers.
          //
          //   - (✓) Already Combined
          //
          //         `import A, { X, Y, Z } from './foo';`   // Has default specifier with multiple specifiers.
          //
          // Case Three
          //   A:
          //   - ! "*-default"
          //   - "*-multiple"
          //   B:
          //   - ! "*-default"
          //   - "*-multiple"
          //
          //   Examples:
          //
          //   - (✗) Not Combined
          //
          //         `import    { X, Y } from './foo';`      // Has default specifier with multiple specifiers.
          //         `import    { Z } from './foo';`         // Has multiple specifiers.
          //
          //   - (✓) Already Combined
          //
          //         `import A, { X, Y, Z } from './foo';`   // Has default specifier with multiple specifiers.
          //
          // Case Three
          //   A:
          //   - "*-default"
          //   - "*-all"
          //   B:
          //   - *
          //
          //   Examples:
          //
          //   - (✓) Already Combined
          //
          //         `import A, * as NamespaceA from './foo';`   // Has default specifier with namespace specifier.
          //
          //   TODO@nw: However, if there was a way to determine what was exported we could replace the namespace
          //            specifier with multiple specifiers.
          //
          // Case Four
          //   A:
          //   - "*-none"
          //   B:
          //   - *
          //
          //   Examples:
          //
          //   - (✗) Not Combined
          //
          //         `import './foo';`                    // Has none specifier.
          //         `import { Z } from './foo';`         // Has multiple specifiers.
          //
          //
          //   - (✗) Not Combined
          //
          //         `import './foo';`                    // Has none specifier.
          //         `import './foo';`                    // Has none specifier.
          //
          //   - (✓) Already Combined
          //
          //         `import { Z } from './foo';`         // Has multiple specifiers.
          //
          //   TODO@nw: Currently this isn't the case and side effect imports aren't merged.
          //
          // Case Five
          //   A:
          //   - "type-multiple"
          //   - "value-multiple"
          //
          //   Examples:
          //
          //   - (✓) Already Combined
          //
          //         `import type { X, Y } from './foo';`      // Has type multiple specifiers.
          //         `import { Z } from './foo';`              // Has multiple specifiers.
          //
          for (const [key, combinedImportDeclarations] of Object.entries(
            commonSourceImportDeclarations,
          )) {
            // Determines if combination occurred, if so track first combined import declaration.
            if (
              !(
                combinedImportDeclarations.filter(importDeclaration =>
                  importDeclaration.node.specifiers.some(
                    specifier => specifier.type === 'ImportSpecifier',
                  ),
                ).length > 1
              )
            ) {
              continue;
            }
            if (firstCombinedImportDeclaration == null) {
              firstCombinedImportDeclaration =
                combinedImportDeclarations[0].node;
            }

            // Pull out import kind.
            // Specifier parents might be pointing to a removed/invalid import declaration.
            const importKind = getImportKindFromCombinedSourceFormat(key);

            // Collect specifiers by default or multiple.
            let defaultImportSpecifiers = [];
            let multipeImportSpecifiers = [];
            for (const originalImportDeclaration of combinedImportDeclarations) {
              // Remove original import declaration.
              originalImportDeclaration.deleted = true;

              // Group and collect specifiers.
              const { defaultSpecifiers, multipleSpecifiers } =
                originalImportDeclaration.node.specifiers.reduce(
                  (aggregate, specifier) => {
                    if (specifier.type === 'ImportDefaultSpecifier') {
                      aggregate.defaultSpecifiers.push(specifier);
                    } else {
                      aggregate.multipleSpecifiers.push(specifier);
                    }
                    return aggregate;
                  },
                  {
                    defaultSpecifiers: [],
                    multipleSpecifiers: [],
                  },
                );
              defaultImportSpecifiers =
                defaultImportSpecifiers.concat(defaultSpecifiers);
              multipeImportSpecifiers =
                multipeImportSpecifiers.concat(multipleSpecifiers);
            }

            // Create combined import declarations.
            // Remember overlapping default import specifiers need their own statement so things don't break.
            if (defaultImportSpecifiers.length >= 1) {
              let hasAssignedMultipleImportSpecifiers = false;
              for (const defaultImportSpecifier of defaultImportSpecifiers) {
                const originalImportDeclaration = defaultImportSpecifier.parent;

                // Clone original import declaration.
                const createdImportDeclarationNode = {
                  ...originalImportDeclaration,
                  source: {
                    ...originalImportDeclaration.source,
                    range: [...originalImportDeclaration.source.range],
                  },
                  loc: {
                    ...originalImportDeclaration.loc,
                  },
                  // Use combined specifiers.
                  specifiers: [
                    defaultImportSpecifier,
                    ...(!hasAssignedMultipleImportSpecifiers
                      ? multipeImportSpecifiers
                      : []),
                  ],
                  importKind,
                };

                importDeclarations.push({
                  created: true,
                  deleted: false,
                  hasCommentsAttached: false,
                  // Recalculate declaration type and declaration source type.
                  // Declaration type might have changed from '*-multiple' to '*-default'.
                  declarationType: getDeclarationType(
                    createdImportDeclarationNode,
                  ),
                  node: createdImportDeclarationNode,
                });

                // Any other default import declarations are '*-default'.
                hasAssignedMultipleImportSpecifiers = true;
              }
            } else {
              const originalImportDeclaration =
                multipeImportSpecifiers[0].parent;

              // Clone original import declaration.
              const createdImportDeclarationNode = {
                ...originalImportDeclaration,
                source: {
                  ...originalImportDeclaration.source,
                  range: [...originalImportDeclaration.source.range],
                },
                loc: {
                  ...originalImportDeclaration.loc,
                },
                // Use combined specifiers.
                specifiers: [...multipeImportSpecifiers],
                importKind,
              };

              importDeclarations.push({
                created: true,
                deleted: false,
                // Recalculate declaration type and declaration source type.
                // Declaration type might have changed from '*-multiple' to '*-default'.
                declarationType: getDeclarationType(
                  createdImportDeclarationNode,
                ),
                declarationSourceType: getDeclarationSourceType(
                  createdImportDeclarationNode,
                ),
                node: createdImportDeclarationNode,
              });
            }
          }
        }

        // Sort import declarations.
        let firstUnsortedImportDeclaration = null;
        if (!config.ignoreDeclarationSort) {
          importDeclarations = importDeclarations.sort((a, b) => {
            let s = 0;

            for (const sort of importDeclarationSortByFunctions) {
              s = sort(a, b);
              if (s !== 0) break;
            }

            // Determines if sort occurred, if so track first unsorted import declaration.
            if (s < 0 && firstUnsortedImportDeclaration === null) {
              firstUnsortedImportDeclaration = a.node;
            }
            return s;
          });
        } else {
          // Completely ignore import declaration sorting.
        }

        // Sort import specifiers.
        let firstUnsortedSpecifier = null;
        if (!config.ignoreMemberSort) {
          importDeclarations = importDeclarations.map(importDeclaration => {
            return {
              ...importDeclaration,
              node: {
                ...importDeclaration.node,
                specifiers: importDeclaration.node.specifiers.sort((a, b) => {
                  let s = 0;

                  for (const sort of [
                    sortBySpecifierDefault,
                    sortBySpecifierName,
                  ]) {
                    s = sort(a, b);
                    if (s !== 0) break;
                  }

                  // Determines if sort occurred, if so track first unsorted specifier.
                  if (s < 0 && firstUnsortedSpecifier === null) {
                    firstUnsortedSpecifier = a;
                  }
                  return s;
                }),
              },
            };
          });
        } else {
          // Completely ignore import specifier member sorting.
        }

        // Did a sort occur?
        const unsortedNode =
          firstUnsplitDefaultImportDeclaration ||
          firstNodeAfterProgramWhitespace ||
          firstUnsortedImportDeclaration ||
          firstUnsortedSpecifier ||
          firstUnsplitTypeImportDeclaration ||
          firstUnsplitImportDeclaration ||
          firstCombinedImportDeclaration;

        // Debug.
        // console.log({
        //   sourceCode,
        //   firstUnsplitDefaultImportDeclaration,
        //   firstNodeAfterProgramWhitespace,
        //   firstUnsortedImportDeclaration,
        //   firstUnsortedSpecifier,
        //   firstUnsplitTypeImportDeclaration,
        //   firstUnsplitImportDeclaration,
        //   firstCombinedImportDeclaration,
        // });

        if (unsortedNode) {
          context.report({
            node: unsortedNode,
            messageId: 'sortImports',
            data: {
              memberName: firstUnsplitDefaultImportDeclaration
                ? firstUnsplitDefaultImportDeclaration.source.value
                : firstNodeAfterProgramWhitespace
                ? firstNodeAfterProgramWhitespace
                : firstUnsortedImportDeclaration
                ? firstUnsortedImportDeclaration.source.value
                : firstUnsortedSpecifier
                ? firstUnsortedSpecifier.local.name
                : firstUnsplitTypeImportDeclaration
                ? firstUnsplitTypeImportDeclaration.source.value
                : firstUnsplitImportDeclaration
                ? firstUnsplitImportDeclaration.source.value
                : firstCombinedImportDeclaration.source.value,
            },
            fix(fixer) {
              // If there are comments between import declarations, don't sort.
              if (
                importDeclarations.some(
                  importDeclaration => importDeclaration.hasCommentsAttached,
                )
              ) {
                return null;
              }

              const { fixes, lines } = importDeclarations.reduce(
                (aggregate, importDeclaration) => {
                  // Exclude import declarations that were manually created from code removal.

                  if (!importDeclaration.created) {
                    // Remove source code.
                    const fix = fixer.removeRange([
                      importDeclaration.node.range[0],
                      importDeclaration.node.range[1] + 1,
                    ]);
                    aggregate.fixes.push(fix);
                  }

                  // Exclude import declarations that were manually deleted from code generation.
                  if (!importDeclaration.deleted) {
                    // Create source code.
                    const importDeclarationSource =
                      createImportDeclarationSource(importDeclaration);
                    aggregate.lines.push(importDeclarationSource);
                  }

                  return aggregate;
                },
                {
                  fixes: [],
                  lines: [],
                },
              );

              return [
                ...fixes,
                fixer.replaceTextRange(
                  [0, programNode.range[0]],
                  lines.join('\n') + '\n',
                ),
              ];
            },
          });
        }
      },
    };
  },
};
