/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // --- FIX: Add this future flag to disable modern color formats ---
  // This ensures compatibility with animation libraries like Framer Motion.
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
}