import type { Config } from "tailwindcss";

// Brownish-orange coat drive palette: espresso ink, rust accent, warm sand
// neutrals. Same token structure as the iThirst blue theme so components
// port cleanly between Verity giving dashboards.
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#2B1A10",
          50: "#FAF5F0",
          100: "#F0E4D8",
          200: "#DCC5AE",
          300: "#BE9877",
          400: "#966A47",
          500: "#6F4A2E",
          600: "#573822",
          700: "#432A19",
          800: "#33200F",
          900: "#2B1A10",
          950: "#180E07",
        },
        rust: {
          DEFAULT: "#B4571B",
          50: "#FDF5EE",
          100: "#FAE6D3",
          200: "#F3C9A3",
          300: "#E9A56F",
          400: "#D9803F",
          500: "#B4571B",
          600: "#954615",
          700: "#763711",
          800: "#582A0E",
          900: "#3D1D09",
        },
        sand: {
          50: "#FBF8F4",
          100: "#F5EFE7",
          200: "#EADFD1",
          300: "#D8C8B4",
          400: "#AB9780",
          500: "#7F6C58",
          600: "#615141",
          700: "#463A2E",
          800: "#2F261E",
          900: "#1E1812",
        },
        coat: {
          light: "#E39A5B",
          DEFAULT: "#C26A2A",
          dark: "#7A3E17",
        },
      },
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        rise: {
          "0%": { transform: "translateY(6px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        stitch: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-24px)" },
        },
      },
      animation: {
        rise: "rise 0.4s ease-out both",
        stitch: "stitch 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
