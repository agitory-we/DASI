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
        vintage: {
          50: "#faf8f5",
          100: "#f4ede4",
          200: "#e9dac9",
          300: "#d9c0a6",
          400: "#c4a17f",
          500: "#b28660",
          600: "#9e6f4f",
          700: "#80543f",
          800: "#694537",
          900: "#573a30",
        },
        terracotta: {
          DEFAULT: "#c85a38",
          light: "#d97453",
          dark: "#a84526",
        },
        cream: "#FDFBF7",
        paper: "#F7F4EE",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Pretendard",
          "Apple SD Gothic Neo",
          "sans-serif",
        ],
        serif: ["Georgia", "Nanum Myeongjo", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
