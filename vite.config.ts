import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const isServingExternally = command === 'serve' && process.env.HOST === '0.0.0.0';
  
  return {
    server: {
      host: process.env.HOST || "0.0.0.0",
      port: 3000,
      strictPort: true,
      hmr: {
        protocol: 'ws',
        host: "sneakyjp.duckdns.org",
        port: 3000,
      },
      watch: {
        usePolling: true
      }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        isServingExternally || mode === 'production' 
        ? 'http://sneakyjp.duckdns.org:5000' 
        : 'http://localhost:5000'
      )
    }
  }
});
