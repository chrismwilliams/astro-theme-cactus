/**
 * Personal info shown on the About page, home page and footer.
 * Edit this file to update links, focus areas or the toolbox.
 */

export const socialLinks = {
	github: { label: "GitHub", handle: "@datntpro", url: "https://github.com/datntpro" },
	youtube: { label: "YouTube", handle: "@datntwork", url: "https://www.youtube.com/@datntwork" },
} as const;

/** cycled by the typing effect under the name */
export const roles = ["Security Engineer", "AppSec", "DevSecOps", "tool builder", "note-taker"];

export const focusAreas: {
	icon: string;
	title: string;
	text: string;
	/** posts with this tag are counted and linked */
	tag: string;
}[] = [
	{
		icon: "🛡️",
		tag: "appsec",
		text: "Secure code review, threat modeling và tìm lỗi trước khi nó lên production.",
		title: "Application Security",
	},
	{
		icon: "⚙️",
		tag: "devsecops",
		text: "Đưa security vào CI/CD sao cho dev không thấy phiền: tự động, nhanh, ít false positive.",
		title: "DevSecOps",
	},
	{
		icon: "🧰",
		tag: "tools",
		text: "Build những công cụ nhỏ giải quyết vấn đề thật mình gặp hằng ngày.",
		title: "Open source & tools",
	},
];

/** TODO(dat): placeholder list, replace with the tools you actually use */
export const toolbox: { group: string; items: string[] }[] = [
	{ group: "offensive / testing", items: ["Burp Suite", "ffuf", "nuclei"] },
	{ group: "code & pipeline", items: ["Semgrep", "CodeQL", "Trivy", "GitHub Actions"] },
	{ group: "daily", items: ["Neovim", "Go", "Python", "Docker"] },
];

export const threatModel: { kind: string; text: string; severity?: "HIGH" | "MED" }[] = [
	{ kind: "ASSET", text: "Sự tò mò không giới hạn" },
	{ kind: "THREAT", severity: "HIGH", text: "Rabbit hole lúc 2h sáng" },
	{ kind: "THREAT", severity: "MED", text: "Quên mất cái vừa học tuần trước" },
	{ kind: "MITIGATION", text: "Viết note lại ngay, chính là blog này ✍️" },
];
