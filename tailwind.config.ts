import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07110f",
        moss: "#10251f",
        mint: "#72f2c7",
        copper: "#f2a65a",
        danger: "#ff6b6b"
      },
      boxShadow: {
        glass: "0 18px 60px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
