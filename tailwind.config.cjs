const { fontFamily } = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}"],
	darkMode: "class",
	corePlugins: {
		// disable aspect ratio as per docs -> @tailwindcss/aspect-ratio
		aspectRatio: false,
		// disable some core plugins as they are included in the css, even when unused
		touchAction: false,
		ringOffsetWidth: false,
		ringOffsetColor: false,
		scrollSnapType: false,
		borderOpacity: false,
		textOpacity: false,
		fontVariantNumeric: false,
	},
	theme: {
		extend: {
			colors: {
				bgColor: "var(--theme-bg)",
				textColor: "var(--theme-text)",
				link: "var(--theme-link)",
				accent: "var(--theme-accent)",
				"accent-2": "var(--theme-accent-2)",
			},
			fontFamily: {
				// Add any custom fonts here
				sans: [...fontFamily.sans],
				serif: [...fontFamily.serif],
			},
			transitionProperty: {
				height: "height",
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
							"@apply cactus-link no-underline": "",
						},
						strong: {
							fontWeight: "700",
						},
						code: {
							border: "1px dotted #666",
							borderRadius: "2px",
						},
						blockquote: {
							borderLeftWidth: "none",
						},
						hr: {
							borderTopStyle: "dashed",
						},
						thead: {
							borderBottomWidth: "none",
						},
						"thead th": {
							fontWeight: "700",
							borderBottom: "1px dashed #666",
						},
						"tbody tr": {
							borderBottomWidth: "none",
						},
						tfoot: {
							borderTop: "1px dashed #666",
						},
					},
				},
				sm: {
					css: {
						code: {
							fontSize: theme("fontSize.sm")[0],
							fontWeight: "400",
						},
					},
				},
			}),
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/line-clamp"),
		require("@tailwindcss/aspect-ratio"),
		plugin(function ({ addComponents }) {
			addComponents({
				".cactus-link": {
					"@apply bg-[size:100%_6px] bg-bottom bg-repeat-x": {},
					backgroundImage:
						"linear-gradient(transparent,transparent 5px,var(--theme-text) 5px,var(--theme-text))",
					"&:hover": {
						backgroundImage:
							"linear-gradient(transparent,transparent 4px,var(--theme-link) 4px,var(--theme-link))",
					},
				},
				".title": {
					"@apply text-2xl font-semibold text-accent-2": {},
				},
			});
		}),
	],
};
