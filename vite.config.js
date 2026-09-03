import path from 'path';
import checker from 'vite-plugin-checker';
import { loadEnv, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 3032;

const env = loadEnv('all', process.cwd());

export default defineConfig({
  // base: env.VITE_BASE_PATH,
  plugins: [
    react(),
    checker({
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    port: PORT,
    host: true,
    proxy: {
      // Forward client requests to local Tally HTTP server
      '/tally': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        secure: false,
        // Keep path as root for Tally; it accepts POST at '/'
        rewrite: (path) => path.replace(/^\/tally/, '/'),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/lab', '@mui/x-data-grid', '@mui/x-date-pickers', '@mui/x-tree-view', '@emotion/react', '@emotion/styled', '@emotion/cache'],
          'vendor-charts': ['apexcharts', 'react-apexcharts'],
          'vendor-pdf': ['@react-pdf/renderer'],
          'vendor-excel': ['exceljs'],
          'vendor-map': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
  preview: { port: PORT, host: true },
});
