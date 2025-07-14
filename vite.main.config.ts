import { defineConfig } from "vite";
import path from "path";
import fs from "fs";

// Plugin to copy migrations to build directory
function copyMigrationsPlugin() {
  return {
    name: 'copy-migrations',
    buildStart() {
      // Copy migrations at the start of the build process
      const srcMigrationsPath = path.join(__dirname, 'src', 'database', 'migrations');
      const buildMigrationsPath = path.join(__dirname, '.vite', 'build', 'migrations');
      
      try {
        if (fs.existsSync(srcMigrationsPath)) {
          console.log('📁 Copying migrations from:', srcMigrationsPath);
          console.log('📁 Copying migrations to:', buildMigrationsPath);
          
          // Create build migrations directory
          fs.mkdirSync(buildMigrationsPath, { recursive: true });
          fs.mkdirSync(path.join(buildMigrationsPath, 'meta'), { recursive: true });
          
          // Copy SQL files
          const files = fs.readdirSync(srcMigrationsPath);
          files.forEach(file => {
            if (file.endsWith('.sql')) {
              const srcFile = path.join(srcMigrationsPath, file);
              const destFile = path.join(buildMigrationsPath, file);
              fs.copyFileSync(srcFile, destFile);
              console.log('📄 Copied migration:', file);
            }
          });
          
          // Copy meta files
          const metaPath = path.join(srcMigrationsPath, 'meta');
          if (fs.existsSync(metaPath)) {
            const metaFiles = fs.readdirSync(metaPath);
            metaFiles.forEach(file => {
              const srcFile = path.join(metaPath, file);
              const destFile = path.join(buildMigrationsPath, 'meta', file);
              fs.copyFileSync(srcFile, destFile);
              console.log('📄 Copied meta file:', file);
            });
          }
          
          console.log('✅ Migrations copied to build directory successfully');
        } else {
          console.warn('⚠️ Source migrations directory not found:', srcMigrationsPath);
        }
      } catch (error) {
        console.error('❌ Error copying migrations:', error);
      }
    }
  };
}

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    rollupOptions: {
      external: ['better-sqlite3'],
    },
    chunkSizeWarningLimit: 1600,
  },
  plugins: [copyMigrationsPlugin()],
});
