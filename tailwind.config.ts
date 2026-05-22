import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18202B",
        muted: "#667085",
        line: "#E6EAF0",
        board: "#F6F8FB",
        navy: "#17324D",
        steel: "#46627F",
        amber: "#C0841A",
        mint: "#2F8F7B",
        danger: "#B42318",
      },
      boxShadow: {
        premium: "0 18px 45px rgba(23, 50, 77, 0.08)",
        hairline: "0 1px 0 rgba(24, 32, 43, 0.05)",
      },
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "system-ui", "sans-serif"],
        display: ["IBM Plex Sans", "Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
