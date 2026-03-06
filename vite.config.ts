import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      // Garantir que o React seja corretamente processado
      jsxRuntime: 'classic', // MUDAR para classic temporariamente
    }), 
    tailwindcss()
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // FORÇAR resolução correta do React
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'], // EVITAR duplicação
  },
  
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
  
  preview: {
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true, // ATIVAR para debug
    minify: false, // DESATIVAR temporariamente
    rollupOptions: {
      output: {
        // SIMPLIFICAR chunks
        manualChunks: undefined, // REMOVER divisão manual
      },
    },
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom'], // FORÇAR otimização
    force: true,
  },
});
