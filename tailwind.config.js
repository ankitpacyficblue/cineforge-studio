/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0f1117',
          surface: '#181b24',
          panel: '#1e2230',
          border: '#2a3042',
          accent: '#6366f1',
          accentHover: '#4f46e5',
          highlight: '#38bdf8',
          trackVideo: '#2563eb',
          trackAudio: '#059669',
          trackText: '#d97706',
          trackOverlay: '#9333ea',
        }
      }
    },
  },
  plugins: [],
}
