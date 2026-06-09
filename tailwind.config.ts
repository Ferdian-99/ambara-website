import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F7F2E8",
        parchment: "#EFE7DA",
        stone: "#BDB8AE",
        smoke: "#E4DED3",
        charcoal: "#171717",
        graphite: "#2B2A27",
        champagne: "#C8A86A",
        linen: "#FBF8F0",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "Avenir Next", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(23, 23, 23, 0.10)",
        line: "inset 0 0 0 1px rgba(23, 23, 23, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
