import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F1115",
        card: "#1A1D22",
        primary: "#C8FF1A",
        secondary: "#A6E800",
        muted: "#BFC3C9",
        border: "rgba(255,255,255,0.1)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 28px rgba(200, 255, 26, 0.16)",
        card: "0 18px 48px rgba(0, 0, 0, 0.28)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-from-bottom-2": {
          from: { transform: "translateY(0.5rem)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "in": "fade-in 180ms ease-out, slide-in-from-bottom-2 180ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
