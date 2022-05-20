module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				link: "var(--theme-link)",
				accent: "var(--theme-accent)",
				"accent-2": "var(--theme-accent-2)",
			},
			typography: (theme) => ({
				cactus: {
					css: {
						"--tw-prose-body": "var(--theme-text)",
						"--tw-prose-headings": "var(--theme-accent-2)",
						"--tw-prose-links": "var(--theme-text)",
						"--tw-prose-bold": "var(--theme-text)",
						"--tw-prose-bullets": "var(--theme-text)",
						"--tw-prose-quotes": "var(--theme-quote)",
						"--tw-prose-code": "var(--theme-text)",
						"--tw-prose-hr": "0.5px dashed #666",
						"--tw-prose-th-borders": "#666",
					},
				},
				DEFAULT: {
					css: {
						a: {
							"&:hover": {
								textDecorationColor: "var(--theme-link)",
								textDecorationStyle: "double",
							},
						},
						strong: {
							fontWeight: "700"
						},
						code: {
							border: "1px dotted #666",
							borderRadius: "2px"
						},
						blockquote: {
							borderLeftWidth: 'none'
						},
						thead: {
							borderBottomWidth: 'none'
						},
						'thead th': {
							fontWeight: "700",
							borderBottom: "1px dashed #666"
						},
						'tbody tr': {
							borderBottomWidth: 'none'
						},
						tfoot: {
							borderTop: '1px dashed #666'
						}
					},
				},
				sm: {
					css: {
						code: {
							fontSize: theme("fontSize.sm")[0],
							fontWeight: "400"
						},
					},
				},
			}),
		},
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/line-clamp")],
};
