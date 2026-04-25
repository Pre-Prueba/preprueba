import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const resolveLocal = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^react$/, replacement: resolveLocal('./node_modules/react/index.js') },
      { find: /^react\/jsx-runtime$/, replacement: resolveLocal('./node_modules/react/jsx-runtime.js') },
      { find: /^react\/jsx-dev-runtime$/, replacement: resolveLocal('./node_modules/react/jsx-dev-runtime.js') },
      { find: /^react-dom$/, replacement: resolveLocal('./node_modules/react-dom/index.js') },
      { find: /^react-dom\/client$/, replacement: resolveLocal('./node_modules/react-dom/client.js') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react')) {
            return 'ui';
          }
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
        },
      },
    },
  },
}))
