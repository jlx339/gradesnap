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
        pokemon: {
          red: "#FF0000",
          blue: "#3B4CCA",
          yellow: "#FFDE00",
          gold: "#B3A125",
        },
      },
    },
  },
  plugins: [],
};

export default config;
