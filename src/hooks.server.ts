import type { Handle } from '@sveltejs/kit';

// Standalone STS2 hub: no account system yet — every request is anonymous.
export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.session = null;
	const response = await resolve(event);
	const p = event.url.pathname;
	if (p.startsWith('/data/sts2/') && p.endsWith('.json')) {
		response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
	} else if (p.startsWith('/_app/') || /\.(js|css|woff2|png|jpg|webp|svg)$/.test(p)) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
	}
	return response;
};
