/** @type {import("@types/eslint").Linter.Config} */
module.exports = {
	settings: {
		"import/resolver": {
			typescript: {
				alwaysTryTypes: true,
				project: "./tsconfig.json",
			},
		},
	},
	env: {
		node: true,
		es2022: true,
		browser: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:astro/recommended",
		"plugin:astro/jsx-a11y-recommended",
	],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	overrides: [
		{
			files: ["*.astro"],
			parser: "astro-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser",
				extraFileExtensions: [".astro"],
			},
			rules: {
				"import/no-named-as-default-member": "off",
				"import/no-named-as-default": "off",
				"@typescript-eslint/consistent-type-imports": "error",
				"@typescript-eslint/no-unused-vars": "off",
			},
			globals: {
				Astro: "readonly",
			},
		},
		{
			files: ["**/*.mjs"],
			parserOptions: {
				sourceType: "module",
				ecmaVersion: 2015,
			},
			rules: {
				"import/no-extraneous-dependencies": "off",
				"import/no-unresolved": "off",
			},
		},
		{
			files: ["**/*.ts"],
			parser: "@typescript-eslint/parser",
			extends: ["plugin:@typescript-eslint/recommended"],
			rules: {
				"@typescript-eslint/no-unused-vars": [
					"error",
					{ argsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
				],
				"@typescript-eslint/no-non-null-assertion": "off",
			},
		},
	],
};
