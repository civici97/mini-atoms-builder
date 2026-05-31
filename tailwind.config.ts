import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 16px 40px rgba(12, 18, 28, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
