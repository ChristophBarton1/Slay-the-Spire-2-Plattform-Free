import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: { minify: 'esbuild', target: 'es2020', reportCompressedSize: false, chunkSizeWarningLimit: 1000 },
	server: { fs: { strict: false } },
	optimizeDeps: { include: ['svelte'] }
});
