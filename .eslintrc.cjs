module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // possible-errors
    'no-console': [1],

    // best-practices
    curly: [2],
    'default-case': [1],
    'default-case-last': [1],
    eqeqeq: [1, 'always'],
    'no-multi-spaces': [1],
    'no-alert': [1],

    // variables
    'no-undef-init': [2],

    // stylistic-issues
    'array-bracket-newline': [1, 'consistent'],
    'brace-style': [2],
    camelcase: [2, { properties: 'always' }],
    'comma-spacing': [1, { 'before': false, 'after': true }],
    'eol-last': [2, 'always'],
    'object-curly-newline': [1, { consistent: true }],
    'object-curly-spacing': [1, 'always'],
    'func-style': [1, 'expression'],
    quotes: [1, 'single'],
    semi: [1, 'always'],
    'semi-style': [2, 'last'],
    'no-nested-ternary': [1],
    'no-unneeded-ternary': [2],
    'no-whitespace-before-property': [2],
    'no-trailing-spaces': [1, { 'skipBlankLines': true }],
    'no-multiple-empty-lines': [2, { 'max': 1, 'maxEOF': 0, 'maxBOF': 0 }],

    // es 6
    'arrow-spacing': [1, { 'before': true, 'after': true }],
    'no-duplicate-imports': [1],
  },
};
