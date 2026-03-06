import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');
  
  // Verificar se estamos em produção
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  
  return {
    // ========================================
    // PLUGINS
    // ========================================
    plugins: [
      // React com suporte a Fast Refresh
      react({
        fastRefresh: true,
        jsxRuntime: 'automatic',
      }),
      
      // Tailwind CSS
      tailwindcss(),
    ],

    // ========================================
    // DEFINIÇÕES GLOBAIS
    // ========================================
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_IMGBB_KEY': JSON.stringify(env.VITE_IMGBB_KEY),
    },

    // ========================================
    // RESOLVE DE ALIAS
    // ========================================
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@constants': path.resolve(__dirname, './src/constants'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@types': path.resolve(__dirname, './src/types'),
      },
    },

    // ========================================
    // SERVIDOR DE DESENVOLVIMENTO
    // ========================================
    server: {
      port: 3000,
      open: true,
      host: true,
      
      // CRÍTICO: Resolve erro 404 ao dar refresh
      historyApiFallback: true,
      
      // Configuração do HMR
      hmr: {
        overlay: true,
        clientPort: 3000,
      },
    },

    // ========================================
    // BUILD (PRODUÇÃO) - USANDO ESBUILD (MAIS RÁPIDO)
    // ========================================
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment,
      
      // USAR ESBUILD EM VEZ DE TERSER (não requer instalação adicional)
      minify: 'esbuild',
      
      // Opções do esbuild
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : [],
        pure: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
      },
      
      target: 'es2020',
      
      // Divisão de chunks simplificada
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // React e ReactDOM
            if (id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/react-router-dom/')) {
              return 'vendor-react';
            }
            
            // Firebase
            if (id.includes('node_modules/firebase/')) {
              return 'vendor-firebase';
            }
            
            // UI Libraries
            if (id.includes('node_modules/framer-motion/') ||
                id.includes('node_modules/lucide-react/')) {
              return 'vendor-ui';
            }
            
            // Outros node_modules
            if (id.includes('node_modules/')) {
              return 'vendor-other';
            }
          },
        },
      },
      
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
      reportCompressedSize: true,
    },

    // ========================================
    // OTIMIZAÇÕES DE DEPENDÊNCIAS
    // ========================================
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'lucide-react',
        'firebase/app',
        'firebase/firestore',
      ],
    },

    // ========================================
    // PREVIEW (TESTE DE PRODUÇÃO)
    // ========================================
    preview: {
      port: 3000,
      open: true,
      host: true,
      // CRÍTICO: Também necessário no preview
      historyApiFallback: true,
    },
  };
});
