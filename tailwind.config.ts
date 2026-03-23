import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080810",
        surface: "#12121E",
        border: "#1E1E32",
        primary: "#00FF88",
        danger: "#FF3355",
        accent: "#FF6B35",
        info: "#4FC3F7",
        purple: "#CE93D8",
        muted: "#4A4A6A",
        foreground: "#EDEDFC",
      },
      fontFamily: {
        heading: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        body: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [typography],
};
export default config;
