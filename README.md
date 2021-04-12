# eslint-plugin-jsort

> Sort imports effortlessly

This rule formats import declaration statements without mercy and with a lot of flexibility.
JavaScript imports are frustrating and this tries to make it easier to work with them.
Feel free to post any issues/suggestions you might have with the plugin on the [issue
tracker](https://github.com/Nate-Wilkins/eslint-plugin-jsort/issues).

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
    "jsort/jsort-imports": [
      "error",
      {
        /* Additional Configuration */
      }
    ]
  }
}
```

3. For "Additional Configuration" see [`jsort/jsort-imports` docs](./docs/rules/jsort_imports.md).

## Available Rules

- [`jsort/jsort-imports`](./docs/rules/jsort_imports.md)

## Other Resources

- [ESLint Builtin `sort-imports` Rule](https://eslint.org/docs/rules/sort-imports)
- [AST Explorer](https://astexplorer.net/)

