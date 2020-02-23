'use strict';

module.exports = {
  extends: ['eslint:recommended', 'google'],
  env: {
    node: true,
    es2017: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'require-jsdoc': 'off',
    strict: ['error', 'global'],
  },
};
