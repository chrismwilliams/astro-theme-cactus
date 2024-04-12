/** @type {import("@types/eslint").Linter.Config} */
module.exports = {
	env: {
		browser: true,
		es2022: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:astro/recommended",
		"plugin:astro/jsx-a11y-recommended",
		"plugin:perfectionist/recommended-natural",
		"plugin:regexp/recommended",
		"plugin:typescript-sort-keys/recommended",
		"plugin:deprecation/recommended",
	],
	ignorePatterns: ["node_modules", "dist"],
	overrides: [
		{
			extends: ["plugin:@typescript-eslint/strict", "plugin:@typescript-eslint/stylistic"],
			files: ["*.astro"],
			parser: "astro-eslint-parser",
			parserOptions: {
				extraFileExtensions: [".astro"],
				parser: "@typescript-eslint/parser",
			},
			rules: {
				"astro/jsx-a11y/no-redundant-roles": [
					"error",
					{
						ol: ["list"],
						ul: ["list"],
					},
				],
			},
		},
		{
			extends: [
				"plugin:@typescript-eslint/strict-type-checked",
				"plugin:@typescript-eslint/stylistic-type-checked",
			],
			files: ["*.ts", "*.tsx"],
		},
		{
			extends: ["plugin:markdown/recommended-legacy"],
			files: ["**/*.md"],
			processor: "markdown/markdown",
		},
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		project: true,
		sourceType: "module",
		tsconfigRootDir: __dirname,
	},
	plugins: ["@typescript-eslint", "astro", "perfectionist", "regexp", "typescript-sort-keys"],
	root: true,
	rules: {
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{ ignoreRestSiblings: true, varsIgnorePattern: "Props" },
		],
		"@typescript-eslint/no-var-requires": "warn",
	},
};
