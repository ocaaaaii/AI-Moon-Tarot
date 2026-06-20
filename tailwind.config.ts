import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Morandi & Cream palette
      colors: {
        cream: {
          50:  "#fdfaf4",
          100: "#f9f3e3",
          200: "#f2e8cc",
          300: "#e8d8ae",
          400: "#d9c28a",
        },
        morandi: {
          rose:    "#c9a8a0",
          sage:    "#a0b0a0",
          slate:   "#8a96a8",
          mauve:   "#b0a0b8",
          stone:   "#a89880",
          lavender:"#b8a8c8",
          gold:    "#d4a859",
        },
        mystic: {
          deep:   "#1a1228",
          purple: "#2d1f4a",
          indigo: "#1e2a4a",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans:  ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        "float":      "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "card-reveal":"cardReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%":      { opacity: "1" },
        },
        cardReveal: {
          "0%":   { opacity: "0", transform: "rotateY(90deg) scale(0.8)" },
          "100%": { opacity: "1", transform: "rotateY(0deg) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
