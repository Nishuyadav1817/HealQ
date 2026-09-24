export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand/Primary colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        // Surface colors
        surface: '#ffffff',
        'surface-border': '#e5e7eb',
        'surface-hover': '#f9fafb',
        'surface-active': '#f3f4f6',
        'surface-muted': '#f3f4f6',
        'surface-card': '#ffffff',
        // Text colors
        ink: '#1f2937',
        'ink-muted': '#6b7280',
        'ink-subtle': '#9ca3af',
        // Semantic colors
        success: '#10b981',
        'success-light': '#d1fae5',
        danger: '#ef4444',
        'danger-light': '#fee2e2',
        warning: '#f59e0b',
        'warning-light': '#fef3c7',
        info: '#3b82f6',
        'info-light': '#dbeafe',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      transitionDuration: {
        'smooth': '200ms',
      },
    },
  },
  plugins: [],
};
