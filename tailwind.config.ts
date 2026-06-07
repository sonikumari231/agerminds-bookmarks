import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Instrument Serif'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          50: "#f5f0eb",
          100: "#e8ddd3",
          200: "#d4c4b6",
          300: "#b8a490",
          400: "#9a8270",
          500: "#7c6355",
          600: "#624d42",
          700: "#4a3932",
          800: "#332824",
          900: "#1e1714",
          950: "#120e0c",
        },
        cream: {
          50: "#fefcf9",
          100: "#fdf8f2",
          200: "#faf0e4",
          300: "#f5e4d0",
          400: "#eed4b8",
        },
        moss: {
          400: "#8fa87a",
          500: "#6d8a58",
          600: "#527040",
        },
        rust: {
          400: "#c97a4e",
          500: "#b5623a",
          600: "#9a4e2c",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
