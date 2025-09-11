import type { Config } from "tailwindcss";

export default {
	content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
	plugins: [require("@tailwindcss/typography")],
	theme: {
		container: {
			center: true,
			padding: { DEFAULT: "5px", lg: "7px", xl: "9px" }
		},
		extend: {
			colors: {
				paper: "#ffffff",
				ink: "#111111",
				accent: "#E10600"
			},
			fontFamily: {
				sans: ["aktiv-grotesk", "system-ui", "sans-serif"],
				mono: ["bc-sklonar", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
			},
			// 4px baseline system (keeps spacing predictable)
			spacing: {
				px: "1px", 1: "4px", 1.5: "6px", 2: "8px", 3: "12px", 4: "16px",
				5: "20px", 6: "24px", 7: "28px", 8: "32px", 10: "40px", 12: "48px",
				14: "56px", 16: "64px", 18: "72px", 20: "80px"
			},
			lineHeight: {
				snug: "1.25",
				normal: "1.5",
				loose: "1.65"
			},
			fontSize: {
				xs:   ["0.75rem", { lineHeight: "1.5" }],
				sm:   ["0.875rem", { lineHeight: "1.5" }],
				base: ["1rem", { lineHeight: "1.5" }],
				lg:   ["1.125rem", { lineHeight: "1.5" }],
				xl:   ["1.25rem", { lineHeight: "1.5" }],
				"2xl":["1.5rem", { lineHeight: "1.25" }],
				"3xl":["1.875rem", { lineHeight: "1.25" }],
				"4xl":["2.25rem", { lineHeight: "1.2" }],
				"5xl":["3rem", { lineHeight: "1.1" }],
				"6xl":["3.75rem", { lineHeight: "1.1" }]
			},
			maxWidth: {
				measure: "72ch"
			},
			gridTemplateColumns: {
				"12": "repeat(12, minmax(0, 1fr))"
			},
			typography: () => ({
				DEFAULT: {
					css: {
						a: {
							textUnderlineOffset: "2px",
							"&:hover": {
								"@media (hover: hover)": {
									textDecorationColor: "var(--color-link)",
									textDecorationThickness: "2px",
								},
							},
						},
						blockquote: {
							borderLeftWidth: "0",
						},
						code: {
							border: "1px dotted #666",
							borderRadius: "2px",
						},
						kbd: {
							"&:where([data-theme='dark'], [data-theme='dark'] *)": {
								background: "var(--color-global-text)",
							},
						},
						hr: {
							borderTopStyle: "dashed",
						},
						strong: {
							fontWeight: "700",
						},
						sup: {
							marginInlineStart: "calc(var(--spacing) * 0.5)",
							a: {
								"&:after": {
									content: "']'",
								},
								"&:before": {
									content: "'['",
								},
								"&:hover": {
									"@media (hover: hover)": {
										color: "var(--color-link)",
									},
								},
							},
						},
						/* Table */
						"tbody tr": {
							borderBottomWidth: "none",
						},
						tfoot: {
							borderTop: "1px dashed #666",
						},
						thead: {
							borderBottomWidth: "none",
						},
						"thead th": {
							borderBottom: "1px dashed #666",
							fontWeight: "700",
						},
						'th[align="center"], td[align="center"]': {
							"text-align": "center",
						},
						'th[align="right"], td[align="right"]': {
							"text-align": "right",
						},
						'th[align="left"], td[align="left"]': {
							"text-align": "left",
						},
						".expressive-code, .admonition, .github-card": {
							marginTop: "calc(var(--spacing)*4)",
							marginBottom: "calc(var(--spacing)*4)",
						},
					},
				},
				sm: {
					css: {
						code: {
							fontSize: "var(--text-sm)",
							fontWeight: "400",
						},
					},
				},
			}),
		},
	},
} satisfies Config;
