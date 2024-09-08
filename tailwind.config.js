/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    colors:{
      mainBackground: 'rgba(255, 255, 255, 1)',
      mainShadow: '0px 7px 14px rgba(0, 0, 0, .05), 0px 0px 3.12708px rgba(0, 0, 0, .08), 0px 0px .931014px rgba(0, 0, 0, .1835)',
      shadow1: '0, 0, 0, 1px, #42409f',
      mainBorder: '#b8b8b8',
      border1: '#c9c9c9',
      mainText: '#303030',
      text1: '#cbc9fd',
    },
  },
  plugins: [],
};
