# [eslint](https://github.com/eslint/eslint)-plugin-jsort

[![npm](http://img.shields.io/npm/v/eslint-plugin-jsort.svg?style=flat-square)](https://www.npmjs.com/package/eslint-plugin-jsort)
[![license](https://img.shields.io/npm/l/eslint-plugin-jsort?style=flat-square)](https://github.com/Nate-Wilkins/eslint-plugin-jsort/blob/main/LICENSE)
[![status](https://app.travis-ci.com/Nate-Wilkins/eslint-plugin-jsort.svg?branch=main&style=flat-square)](https://app.travis-ci.com/Nate-Wilkins/eslint-plugin-jsort)
[![test coverage](https://img.shields.io/badge/test%20coverage-100%25-green?style=flat-square)](https://travis-ci.com/Nate-Wilkins/eslint-plugin-jsort)
[![dependencies](https://badges.depfu.com/badges/705f59ba329b70bdea1483efccce11f5/overview.svg)](https://depfu.com/github/Nate-Wilkins/eslint-plugin-jsort?project_id=24360)

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
- [Force explicit default imports](./docs/rules/sort-imports.md#force-explicit-default-imports)
- [Force single line imports](./docs/rules/sort-imports.md#force-single-line-imports)
- [Force explicit type imports](./docs/rules/sort-imports.md#force-explicit-type-imports)
- [Normalize import source](./docs/rules/normalize-import-source.md)

## Supported Parsers

- [`@typescript-eslint/parser`](https://github.com/typescript-eslint/typescript-eslint)
- [`@babel/eslint-parser`](https://github.com/babel/babel)

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

## Development

Written in Typescript. Workflows are defined in `.envrc.sh`.

## Other Alternatives

- [ESLint Builtin `sort-imports` Rule](https://eslint.org/docs/rules/sort-imports)
- [eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort)
- [eslint-plugin-sort-imports-es6-autofix](https://github.com/marudor/eslint-plugin-sort-imports-es6-autofix)
- [prettier-plugin-sort-imports](https://github.com/trivago/prettier-plugin-sort-imports)
- [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import)

## Other Resources

- [AST Explorer](https://astexplorer.net/)

## Contributions

| Author       | Estimated Hours                                                                     |
| ------------ | ----------------------------------------------------------------------------------- | ------------------------------------ | ------------ |
| <%#authors%> | [![<%name%>](https://github.com/<%name%>.png?size=64)](https://github.com/<%name%>) | <p align="right"><%hours%> Hours</p> | <%/authors%> |
