import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc5fb",
          400: "#36a5f7",
          500: "#0c87eb",
          600: "#026ac9",
          700: "#0354a2",
          800: "#074785",
          900: "#0c3b6e",
          950: "#082549",
        },
        accent: {
          50: "#faf5ff",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
        }
      },
    },
  },
  plugins: [],
};
export default config;
