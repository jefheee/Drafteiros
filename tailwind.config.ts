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
        'bg-primary': '#0D0D0F',
        'bg-elevated': '#141417',
        'bg-card': '#1A1A1E',
        'bg-card-hover': '#222227',
        'text-primary': '#F4F4F5',
        'text-secondary': '#A1A1AA',
        'text-muted': '#71717A',
        brand: {
          bg: "#0D0D0F",
          card: "#1A1A1E",
          purple: "#7C5CFC",
          green: "#00E599",
          title: "#F4F4F5",
          subtitle: "#A1A1AA",
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
        display: [
          "Plus Jakarta Sans",
          "Inter",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
