import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ config: 'wrangler.toml' }),
		csrf: { trustedOrigins: [] },
		prerender: {
			entries: ['/', '/guides', '/decks', '/cards', '/tier-list'],
			handleHttpError: ({ path, status, message }) => {
				console.warn(`[prerender] skip ${path} (${status}): ${message}`);
			},
			handleMissingId: 'warn',
			handleEntryGeneratorMismatch: 'warn'
		}
	}
};
export default config;
