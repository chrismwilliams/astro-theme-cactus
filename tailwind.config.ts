import type { Config } from "tailwindcss";

export default {
	plugins: [require("@tailwindcss/typography")],
	theme: {
		extend: {
			// @apply doesn't work the same in v4.0.0-beta.8 as it did in v3
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
					},
				},
				cactus: {
					css: {
						"--tw-prose-body": "var(--color-global-text)",
						"--tw-prose-bold": "var(--color-global-text)",
						"--tw-prose-bullets": "var(--color-global-text)",
						"--tw-prose-code": "var(--color-global-text)",
						"--tw-prose-headings": "var(--color-accent-2)",
						"--tw-prose-hr": "0.5px dashed #666",
						"--tw-prose-links": "var(--color-global-text)",
						"--tw-prose-quotes": "var(--color-quote)",
						"--tw-prose-th-borders": "#666",
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
