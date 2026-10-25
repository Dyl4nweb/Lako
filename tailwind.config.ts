import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        movli: {
          DEFAULT: "#E25822", // Movli Kinetic Amber
          50: "#FFF5F0",
          100: "#FFE8DE",
          200: "#FFD0BE",
          300: "#FFAA8A",
          400: "#F27848",
          500: "#E25822",
          600: "#C94614",
          700: "#A5360F",
          800: "#832C10",
          900: "#6C2610",
        },
        slate: {
          deep: "#1A202C", // Lingayen Deep Slate
          surface: "#2D3748",
          muted: "#718096",
        },
        sand: {
          light: "#FDFDFB",
          canvas: "#FBFBF9", // Coastal Neutral Sand
          border: "#EFEFEA",
        },
        status: {
          emerald: "#10B981",
          amber: "#F59E0B",
          cobalt: "#2563EB",
          crimson: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(26, 32, 44, 0.05)",
        card: "0 10px 25px -5px rgba(26, 32, 44, 0.04), 0 8px 10px -6px rgba(26, 32, 44, 0.03)",
        elevated: "0 20px 30px -10px rgba(226, 88, 34, 0.15)",
      },
      borderRadius: {
        sm: "4px",
        xl: "12px",
        "2xl": "18px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
