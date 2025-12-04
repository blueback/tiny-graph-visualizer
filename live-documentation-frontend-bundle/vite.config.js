import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        vis_graph: './src/templates/vis_graph.html'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5000
  },
  optimizeDeps: {
    include: ['viz.js'],
  },
});

