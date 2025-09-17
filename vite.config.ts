import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ✅ Moved define to the root level
  define: {
    'process.env': {},
  },

  // ✅ optimizeDeps is separate
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});