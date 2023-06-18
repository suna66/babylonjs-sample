import { defineConfig } from 'vite';
import path from "path";

export default defineConfig({
  root: '.',
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
});
