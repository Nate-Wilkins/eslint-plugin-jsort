module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true,
      modules: true,
    },
  },
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true,
  },
  plugins: ['bdd'],
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'bdd/focus': 2,
    'bdd/exclude': 2,
  },
  settings: {},
};

