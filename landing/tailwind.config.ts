import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        acid: "#C6FF1A",
        ink: "#050609",
        graphite: "#11151A"
      },
      boxShadow: {
        "acid-soft": "0 0 54px rgba(198, 255, 26, 0.18)",
        "acid-card": "0 24px 80px rgba(198, 255, 26, 0.08)"
      },
      backgroundImage: {
        "radial-acid": "radial-gradient(circle at center, rgba(198,255,26,0.32), rgba(198,255,26,0.06) 36%, transparent 68%)"
      }
    }
  },
  plugins: []
};

export default config;
