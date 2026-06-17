/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        lg: "2rem",
      },
    },
    extend: {
      colors: {
        tea: {
          50: "#f7f5ef",
          100: "#ede8d8",
          200: "#dcd0ad",
          300: "#c9b27e",
          400: "#b89659",
          500: "#a97f44",
          600: "#8f673a",
          700: "#755032",
          800: "#5f412d",
          900: "#4f3627",
          950: "#2a1a13",
        },
        leaf: {
          50: "#f2f8ee",
          100: "#e0efd5",
          200: "#c3dfab",
          300: "#9ac87a",
          400: "#74ad50",
          500: "#579036",
          600: "#417028",
          700: "#345722",
          800: "#2d5a27",
          900: "#1f3d18",
          950: "#0f220b",
        },
        gold: {
          50: "#fcf8ea",
          100: "#f8edc9",
          200: "#f1d98c",
          300: "#e9c052",
          400: "#e4aa31",
          500: "#c9a227",
          600: "#ab7f1c",
          700: "#8a5d1b",
          800: "#724b1f",
          900: "#603e1f",
          950: "#36200d",
        },
        amber2: {
          400: "#e67e22",
          500: "#d35400",
        },
      },
      fontFamily: {
        serif: [
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          '"Source Serif Pro"',
          "Georgia",
          "serif",
        ],
        sans: [
          '"Noto Sans SC"',
          '"Source Han Sans CN"',
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        paper:
          "0 1px 2px rgba(47, 32, 15, 0.06), 0 4px 12px rgba(47, 32, 15, 0.08)",
        tea: "0 2px 8px rgba(45, 90, 39, 0.12), 0 8px 24px rgba(45, 90, 39, 0.08)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(230, 126, 34, 0.5)" },
          "50%": { boxShadow: "0 0 0 8px rgba(230, 126, 34, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadein: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        breathe: "breathe 2.4s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        fadein: "fadein 300ms ease-out both",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(rgba(113,80,50,0.04) 1px, transparent 1px)",
        "score-gradient":
          "linear-gradient(90deg, #d94f4f 0%, #e67e22 25%, #c9a227 50%, #74ad50 75%, #2d5a27 100%)",
      },
    },
  },
  plugins: [],
};
