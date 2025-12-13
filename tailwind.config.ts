import type { Config } from "tailwindcss";
import { frostedThemePlugin } from "@whop/react/tailwind";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PaveOS Brand Colorsgit status

        primary: {
          DEFAULT: "#0e1d3a",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#F4C542",
          foreground: "#0e1d3a",
        },
        // Semantic colors - static values (no CSS variables for clarity)
        background: "#ffffff",
        foreground: "#0e1d3a",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0e1d3a",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#0e1d3a",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          foreground: "#0e1d3a",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#737373",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#e5e5e5",
        input: "#e5e5e5",
        ring: "#F4C542",
        // Sidebar colors
        sidebar: {
          DEFAULT: "#0e1d3a",
          foreground: "#f5f5f5",
          primary: "#F4C542",
          "primary-foreground": "#0e1d3a",
          accent: "#152a4a",
          "accent-foreground": "#f5f5f5",
          border: "#152a4a",
          ring: "#F4C542",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    frostedThemePlugin(),
  ],
};

export default config;
