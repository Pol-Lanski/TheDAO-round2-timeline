import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/TheDAO-round2-timeline/',
  plugins: [react()],
});
