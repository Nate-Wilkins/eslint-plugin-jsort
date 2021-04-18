# [eslint](https://github.com/eslint/eslint)-plugin-jsort

[![npm](http://img.shields.io/npm/v/eslint-plugin-jsort.svg?style=flat-square)](https://www.npmjs.com/package/eslint-plugin-jsort)
[![license](https://img.shields.io/npm/l/eslint-plugin-jsort?style=flat-square)](https://github.com/Nate-Wilkins/eslint-plugin-jsort/blob/main/LICENSE)
[![status](https://img.shields.io/travis/com/nate-wilkins/eslint-plugin-jsort?style=flat-square)](https://travis-ci.com/Nate-Wilkins/eslint-plugin-jsort)
[![dependencies](https://david-dm.org/nate-wilkins/eslint-plugin-jsort.svg?style=flat-square)](https://david-dm.org/nate-wilkins/eslint-plugin-jsort)

> ESLint plugin with rules to sort imports effortlessly.

```bash
$ npm install eslint-plugin-jsort
```

This rule sorts & formats import declaration with a lot of flexibility using `eslint --fix`.

JavaScript imports are frustrating and this tries to make them a bit easier to work with.
Feel free to post any issues/suggestions you might have with the plugin on the [issue
tracker](https://github.com/Nate-Wilkins/eslint-plugin-jsort/issues).

## Capabilities

- [Sort import declarations into distinct groups by type](./docs/rules/sort-imports.md#sorting-by-type)
- [Sort import declarations by "global" packages vs "local" packages](./docs/rules/sort-imports.md#sorting-by-type)
- [Sort import declarations by source](./docs/rules/sort-imports.md#sorting-by-source)
- [Sort imported modules (aka specifiers)](./docs/rules/sort-imports.md#sorting-by-specifier)
- [Combine import declarations that can be combined](./docs/rules/sort-imports.md#force-combine-same-source-imports)

## Installation

1. Install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

2. Install the plugin `eslint-plugin-jsort`:

```
$ npm install eslint-plugin-jsort --save-dev
```

## Usage

1. Add `jsort` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["jsort"]
}
```

2. Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "jsort/sort-imports": [
      "error",
      {
        /* `sort-imports` Additional Configuration */
      }
    ],
    "jsort/normalize-import-source": [
      "error",
      {
        /* `normalize-import-source` Additional Configuration */
      }
    ]
  }
}
```

3. For "`sort-imports` Additional Configuration" see [`jsort/sort-imports` docs](./docs/rules/sort-imports.md).
4. For "`normalize-import-source` Additional Configuration" see [`jsort/normalize-import-source` docs](./docs/rules/normalize-import-source.md)

## Available Rules

- [`jsort/sort-imports`](./docs/rules/sort-imports.md)
- [`jsort/normalize-import-source`](./docs/rules/normalize-import-source.md)

## Other Alternatives

- [ESLint Builtin `sort-imports` Rule](https://eslint.org/docs/rules/sort-imports)
- [eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort)
- [eslint-plugin-sort-imports-es6-autofix](https://github.com/marudor/eslint-plugin-sort-imports-es6-autofix)
- [prettier-plugin-sort-imports](https://github.com/trivago/prettier-plugin-sort-imports)

## Other Resources

- [AST Explorer](https://astexplorer.net/)

