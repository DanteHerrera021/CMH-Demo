/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ui: {
          background: "#F8FAFC",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          text: "#0F172A",
          muted: "#64748B"
        },
        brand: {
          primary: "#6ca9dc",
          danger: "#D82A30"
        },
        state: {
          success: "#16A34A",
          warning: "#F59E0B"
        }
      }
    }
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}

