import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        secondary: "#FFE600",
        "on-secondary": "#000000",
        primary: "#FFFFFF",
        "on-primary": "#0B1326",
        background: "#0B1326",
        surface: "#131B2E",
        "on-surface-variant": "#94A3B8"
      },
      borderRadius: {
        DEFAULT: "0px",
        sm: "0px",
        md: "0px",
        lg: "2px",
        xl: "4px",
        full: "9999px"
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        geist: ["Geist", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
