import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Lets the dev server be reached from the network (useful for testing
    // on a phone against the same machine) without changing anything for
    // plain localhost usage.
    host: true,
  },
});
