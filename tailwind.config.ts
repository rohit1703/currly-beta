import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Ensure dark mode is set
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This sets Manrope as the default font for everything
        sans: ["var(--font-manrope)", "sans-serif"],
        // This creates a 'font-heading' utility for Bodoni
        heading: ["var(--font-bodoni)", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#0066FF", // Currly Electric Blue
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Optional: Good for blog content
  ],
};
export default config;