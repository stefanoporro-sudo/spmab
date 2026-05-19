import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f0",
          100: "#faefd9",
          200: "#f4dab0",
          300: "#ebbf7e",
          400: "#e0994a",
          500: "#d47e28",
          600: "#b8651e",
          700: "#964d1a",
          800: "#7a3e1c",
          900: "#65341a",
        },
        dark: {
          900: "#0f0e0d",
          800: "#1a1917",
          700: "#252320",
          600: "#332f2a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
