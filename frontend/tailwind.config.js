/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral surface system — cool, clinical, calm. Deliberately NOT
        // the cream/terracotta or near-black/neon defaults; a functional
        // operations tool reads best as quiet and legible first.
        surface: {
          DEFAULT: '#F6F7F9', // app background
          card: '#FFFFFF',
          border: '#E4E7EC',
        },
        ink: {
          DEFAULT: '#101828', // primary text
          muted: '#667085', // secondary text
          subtle: '#98A2B3', // placeholders, disabled
        },
        // Shared brand accent — used for primary actions across every panel.
        brand: {
          50: '#EDFAF8',
          100: '#D2F1EC',
          500: '#0F8C82',
          600: '#0C716A',
          700: '#0A5B55',
        },
        // Each role gets its own restrained accent so the four panels feel
        // like distinct places without breaking a shared structural
        // language — this is the panels' one visual "signature," kept
        // deliberately small (sidebar active state, badges) rather than
        // repainting whole screens per role.
        role: {
          patient: { DEFAULT: '#0F8C82', soft: '#EDFAF8' }, // teal — calm, patient-facing
          reception: { DEFAULT: '#B5560F', soft: '#FBEDE2' }, // warm clay — front-desk energy
          doctor: { DEFAULT: '#33449E', soft: '#EBEDFA' }, // deep indigo — clinical focus
          admin: { DEFAULT: '#4B5165', soft: '#EEEFF2' }, // graphite — neutral authority
        },
        danger: { DEFAULT: '#D92D20', soft: '#FEF3F2' },
        success: { DEFAULT: '#0F8C5C', soft: '#EDFAF3' },

        // HealQ — the patient-facing brand palette (classic clinical
        // blue). Deliberately its OWN token family rather than a
        // reassignment of `brand` or `role.patient` above: those two
        // are load-bearing for every other panel's shared components
        // (Button, Card, Field, Badge all reference `brand-*`), so
        // recoloring them would repaint Admin/Reception/Doctor Assistant
        // too. Patient-only components (features/patient/components/ui)
        // reference `healq-*` instead, so the redesign is contained to
        // exactly the patient-facing surface + the shared Login/Register
        // screens.
        healq: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        // A clean system stack by default — swap in a loaded face (e.g.
        // Inter via @fontsource or a <link>) later without touching any
        // component code, since everything references this token.
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        // Display face for the HealQ patient surface + auth screens only
        // — a classic serif reads as "trustworthy clinic letterhead"
        // rather than "SaaS dashboard," which is the whole point of a
        // patient portal versus the operational panels.
        serif: ['Lora', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};
