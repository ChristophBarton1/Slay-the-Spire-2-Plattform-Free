// 🚀 Prerender at build — fully static page, served from CF Pages CDN globally.
// Result: ~0ms TTFB worldwide, no per-request 533KB cards.json fetch.
// Page content (cards + characters) baked into the HTML at build time.
export const prerender = true;

export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	const [cardsRes, charsRes] = await Promise.all([
		fetch('/data/sts2/cards.json'),
		fetch('/data/sts2/characters.json')
	]);
	const cards = await cardsRes.json();
	const characters = await charsRes.json();
	return { cards, characters };
}
