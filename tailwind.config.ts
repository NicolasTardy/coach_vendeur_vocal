import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f7f4ee",
        tomato: "#d8482f",
        citron: "#f0c94b",
        forest: "#1f6f5b",
        cobalt: "#2768c9"
      },
      boxShadow: {
        soft: "0 16px 50px rgba(23, 23, 23, 0.11)"
      }
    }
  },
  plugins: []
};

export default config;
