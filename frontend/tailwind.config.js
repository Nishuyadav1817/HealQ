/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral surface system — warm off-white, not clinical grey.
        // One shared system for every panel (no more per-panel split).
        surface: {
          DEFAULT: '#F7F8F6', // app background
          card: '#FFFFFF',
          muted: '#EEF1ED', // quiet fills — table headers, chips
          border: '#E3E7E2',
        },
        ink: {
          DEFAULT: '#12211C', // primary text — deep charcoal-green, not pure black
          muted: '#5B6B63',
          subtle: '#94A299',
        },

        // PRIMARY — healthcare emerald/green. The brand color: logo,
        // primary buttons, active nav states, links, focus rings.
        primary: {
          50: '#EDFBF3',
          100: '#D3F5E1',
          200: '#A7EBC5',
          300: '#72DBA3',
          400: '#3EC17F',
          500: '#1D9D63',
          600: '#147D4F',
          700: '#0F6440',
          800: '#0C4F34',
          900: '#083A27',
        },
        // SECONDARY — deep teal/blue-green. Supporting accent: Doctor
        // Assistant panel, secondary data series, quiet highlights.
        secondary: {
          50: '#EBFAFA',
          100: '#CFF2F1',
          300: '#7FD6D3',
          500: '#1C8C88',
          600: '#146F6C',
          700: '#0F5654',
        },
        // Professional blue — informational accent, Reception-panel
        // alternative, secondary chart series.
        sky: {
          50: '#EEF4FF',
          100: '#D9E6FF',
          300: '#8CB4FF',
          500: '#3B6FE0',
          600: '#2C56B8',
          700: '#233F8A',
        },
        // Gold — warm accent used sparingly: live indicators, token
        // numbers, priority/rating marks. Never a large fill.
        gold: {
          50: '#FEF9EC',
          100: '#FCEFC5',
          300: '#F6D479',
          500: '#E8AC1E',
          600: '#C48D0F',
          700: '#96690A',
        },

        // Per-panel identity accent — drawn from the SAME palette above
        // (not unrelated hues) so all four panels still read as one
        // product wearing four badges, not four different apps.
        role: {
          patient: { DEFAULT: '#147D4F', soft: '#EDFBF3' }, // primary green
          reception: { DEFAULT: '#C48D0F', soft: '#FEF9EC' }, // gold
          doctor: { DEFAULT: '#146F6C', soft: '#EBFAFA' }, // teal
          admin: { DEFAULT: '#12211C', soft: '#EEF1ED' }, // charcoal
        },

        danger: { DEFAULT: '#D0362C', soft: '#FDEEEC' },
        success: { DEFAULT: '#147D4F', soft: '#EDFBF3' },
      },
      fontFamily: {
        // Body copy — highly readable at small sizes across dense tables
        // and forms.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        // Display/heading face — a confident geometric sans (the shape
        // premium SaaS product headlines use), replacing the earlier
        // clinic-letterhead serif now that the whole app shares one
        // identity rather than a patient-only sub-brand.
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        // Soft, low-opacity, charcoal-green tinted shadows — never pure
        // black, never heavy. "Expensive but restrained."
        'soft-sm': '0 1px 2px rgba(18, 33, 28, 0.06)',
        soft: '0 2px 8px rgba(18, 33, 28, 0.07), 0 1px 2px rgba(18, 33, 28, 0.05)',
        'soft-md': '0 8px 24px rgba(18, 33, 28, 0.08), 0 2px 6px rgba(18, 33, 28, 0.05)',
        'soft-lg': '0 20px 48px rgba(18, 33, 28, 0.12), 0 4px 12px rgba(18, 33, 28, 0.06)',
      },
    },
  },
  plugins: [],
};
