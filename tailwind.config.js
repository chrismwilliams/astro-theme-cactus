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
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
