module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				primary: "var(--theme-primary)",
				secondary: "var(--theme-secondary)",
				accent: "var(--theme-accent)",
			},
			typography: (theme) => ({
				cactus: {
					css: {
						"--tw-prose-body": "var(--theme-text)",
						"--tw-prose-headings": "var(--theme-text)",
						"--tw-prose-links": "var(--theme-text)",
					},
				},
				DEFAULT: {
					css: {
						a: {
							"&:hover": {
								textDecorationColor: theme("colors.secondary"),
								textDecorationStyle: "double",
							},
						},
					},
				},
			}),
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
