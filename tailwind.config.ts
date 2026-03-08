import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        medical: {
          green: "#22c55e",
          red: "#ef4444",
          amber: "#f59e0b",
        },
        surface: {
          base: "#0a0f1e",
          card: "#0d1424",
          elevated: "#111827",
          border: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        glow: "0 0 40px rgba(14,165,233,0.25)",
        "glow-sm": "0 0 20px rgba(14,165,233,0.15)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        breatheIn: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.1)" },
        },
        breatheOut: {
          "0%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
            boxShadow: "0 0 20px rgba(14,165,233,0.15)",
          },
          "50%": {
            opacity: ".8",
            transform: "scale(1.05)",
            boxShadow: "0 0 40px rgba(14,165,233,0.4)",
          },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out forwards",
        slideUp: "slideUp 0.5s ease-out forwards",
        breatheIn: "breatheIn 4s ease-in-out forwards",
        breatheOut: "breatheOut 4s ease-in-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
