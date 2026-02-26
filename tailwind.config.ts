import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0A0A0F", secondary: "#12121A", card: "#1A1A26", elevated: "#252536", hover: "#222233" },
        accent: { DEFAULT: "#00D4AA", glow: "rgba(0,212,170,0.15)", dim: "rgba(0,212,170,0.08)", warm: "#FFB347" },
        danger: "#FF4D6A",
        txt: { DEFAULT: "#F0F0F5", secondary: "#9090A8", muted: "#606078" },
      },
      fontFamily: {
        display: ["Instrument Serif", "Georgia", "serif"],
        body: ["DM Sans", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
