import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

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
      // React com suporte a Fast Refresh otimizado
      react({
        // Melhorar performance do Fast Refresh
        fastRefresh: true,
        // Incluir JSX runtime
        jsxRuntime: 'automatic',
        // Excluir arquivos de teste do HMR
        exclude: /\.(spec|test)\.(ts|tsx)$/,
      }),
      
      // Tailwind CSS
      tailwindcss(),
      
      // Compressão gzip/brotli para produção
      isProduction && compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240, // 10kb
        deleteOriginFile: false,
      }),
      
      isProduction && compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240,
        deleteOriginFile: false,
      }),
      
      // Visualizador de bundle (apenas em análise)
      process.env.ANALYZE === 'true' && visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),

    // ========================================
    // DEFINIÇÕES GLOBAIS
    // ========================================
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_IMGBB_KEY': JSON.stringify(env.VITE_IMGBB_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Definir variáveis para ambiente de produção
      __DEV__: !isProduction,
      __PROD__: isProduction,
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
      host: true, // Permitir acesso na rede local
      
      // CRÍTICO: Configuração para SPA - resolve erro 404 ao dar refresh
      historyApiFallback: true,
      
      // Configuração do HMR
      hmr: {
        // Desabilitar HMR apenas se explicitamente definido
        overlay: true,
        clientPort: 3000,
        timeout: 5000,
      },
      
      // Proxy para API (se necessário)
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      
      // Otimizações para desenvolvimento
      watch: {
        usePolling: false,
        interval: 100,
      },
    },

    // ========================================
    // BUILD (PRODUÇÃO)
    // ========================================
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment, // Sourcemap apenas em dev
      minify: 'terser', // Melhor minificação
      target: 'es2020', // Target moderno
      
      // Configurações do terser
      terserOptions: {
        compress: {
          drop_console: isProduction, // Remover console.log em produção
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        format: {
          comments: false, // Remover comentários
        },
      },
      
      // Divisão de chunks para melhor cache
      rollupOptions: {
        output: {
          // Nomenclatura dos arquivos
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
          
          // Divisão manual de chunks
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
      
      // Otimizações de chunk
      chunkSizeWarningLimit: 1000, // 1MB
      assetsInlineLimit: 4096, // 4kb - inline small assets
      
      // Relatório de tamanhos
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
      exclude: ['@tailwindcss/vite'],
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

    // ========================================
    // CONFIGURAÇÕES DE DEPENDÊNCIAS
    // ========================================
    ssr: {
      noExternal: ['framer-motion'],
    },

    // ========================================
    // CONFIGURAÇÕES DE CSS
    // ========================================
    css: {
      devSourcemap: isDevelopment,
      modules: {
        localsConvention: 'camelCase',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@styles/variables.scss";`,
        },
      },
    },
  };
});
