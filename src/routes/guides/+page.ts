export const prerender = true;

export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	const [characters, cards] = await Promise.all([
		fetch('/data/sts2/characters.json').then(r => r.json()),
		fetch('/data/sts2/cards.json').then(r => r.json())
	]);
	return { characters, cards };
}
