const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        turbovets: {
          primary: '#003366',      // Deep blue - Turbovets primary
          secondary: '#000000',     // Black
          accent: '#666666',        // Gray
          light: '#FFFFFF',         // White background
          'blue-light': '#004080',  // Lighter blue for hover states
          'blue-dark': '#002244',   // Darker blue for dark mode
        },
      },
    },
  },
  plugins: [],
};
