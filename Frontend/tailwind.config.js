import daisyui from 'daisyui';
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "forest",
      "light",
      "dark",
      "cupcake",
      "synthwave",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "aqua",
      "dracula",
      "night",
      "acid"
    ]
  }
  
}

