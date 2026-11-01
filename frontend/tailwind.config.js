/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          border: 'var(--color-border)',
          primary: 'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          'primary-light': 'var(--color-primary-light)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          accent: 'var(--color-accent)',
        },
        aqi: {
          good: '#16a34a',         // 0-50 Good
          satisfactory: '#65a30d', // 51-100 Satisfactory
          moderate: '#ca8a04',     // 101-200 Moderate
          poor: '#ea580c',         // 201-300 Poor
          verypoor: '#dc2626',     // 301-400 Very Poor
          severe: '#7f1d1d',       // 401-500 Severe
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

