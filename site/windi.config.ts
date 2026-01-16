import { defineConfig } from "vite-plugin-windicss";

export default defineConfig({
  darkMode: false,
  theme: {
    fontFamily: {
      sans: ["Poppins", "sans-serif"],
      mono: ["Jetbrains Mono", "monospace"],
    },
    extend: {
      colors: {
        primary: "#f97316",
        secondary: "#fb923c",
      },
      boxShadow: {
        "inner-lg": "inset 0 0 30px 20px rgba(0, 0, 0, 0.2)",
      },
      backgroundImage: {
        gradient: "linear-gradient(90deg, #f97316 0%, #fb923c 100%)",
      },
    },
  },
  shortcuts: {
    "primary-button":
      "text-white !bg-secondary " +
      "rounded-lg py-1 px-4 shadow " +
      "focus:outline-none focus:shadow-outline transform transition " +
      "!hover:scale-110 duration-300 ease-in-out " +
      "!active:scale-100",
  },
});
