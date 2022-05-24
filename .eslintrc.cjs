module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["plugin:@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    // override/add rules settings here, such as:
    // "astro/no-set-html-directive": "error"
    '@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/camelcase': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'no-console': 'warn',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': ['error'],
		'@typescript-eslint/no-var-requires': 'off',
		// 'prefer-const': 'off',
		// '@typescript-eslint/no-non-null-assertion': 'off',
		// 'prettier/prettier': 'error',
  },
  overrides: [
    {
			files: ['*.astro'],
			parser: 'astro-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
  ],
}