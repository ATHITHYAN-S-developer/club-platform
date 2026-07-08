import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
    watch: {
      // Ignore media/binary files and OneDrive temp files to prevent EBUSY errors
      ignored: ['**/*.mp4', '**/*.mp3', '**/*.mov', '**/*.avi', '**/*.mkv', '**/*.webm', '**/*.exe', '**/*.zip', '**/gallay and image details/**', '**/public/gallery/**', '~$*']
    }
  }
});
