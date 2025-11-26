import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Registers the CSS variables we set in layout.tsx
        sans: ["var(--font-manrope)", "sans-serif"],
        heading: ["var(--font-bodoni)", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#0066FF",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;