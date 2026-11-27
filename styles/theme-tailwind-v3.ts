/*
  TEMA WARNA — untuk Tailwind v3.
  Gabungkan bagian `extend` ini ke tailwind.config.ts di proyek Anda.
  Tambahkan juga ke app/globals.css:
    html { scroll-behavior: smooth; }
    body { background-color: #eef7ff; color: #1f3a44; }
*/
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#eef7ff",
        soft: "#cde8e5",
        brand: {
          300: "#7ab2b2",
          500: "#4d869c",
          600: "#3f7487",
          700: "#335f6f",
        },
        ink: "#1f3a44",
        muted: "#5b7680",
      },
    },
  },
  plugins: [],
};

export default config;
