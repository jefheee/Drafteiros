import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          bg: "#F5F6FA",
          card: "#FFFFFF",
          purple: "#7C5CFC",
          green: "#38C958",
          title: "#18181B",
          subtitle: "#71717A",
        },
        esports: {
          dark: "#020617",
          card: "#0b1329",
          border: "rgba(255, 255, 255, 0.07)",
          cyan: "#06b6d4",
          gold: "#f59e0b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "Roboto",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
