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
  plugins: [],
  extends: ['eslint:recommended', 'prettier'],
  rules: {},
  settings: {},
};

