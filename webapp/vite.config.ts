import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
    ],
  },
  server: {
    port: 3000,
    open: true,
    host: true, // Allow external connections
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@aws-amplify/ui-react'],
          amplify: ['aws-amplify', '@aws-amplify/auth', '@aws-amplify/core'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          utils: ['axios', 'crypto-js', 'i18next', 'react-i18next'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  define: {
    // Replace process.env with import.meta.env for Vite compatibility
    'process.env': 'import.meta.env',
  },
  // CSS configuration
  css: {
    devSourcemap: true,
  },
});