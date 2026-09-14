// cards + characters come from the STS2 layout — no need to re-fetch here.
// Removing them saves ~563KB from the serialized SSR HTML payload.
export const prerender = true;

export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	const [potions, relics] = await Promise.all([
		fetch('/data/sts2/potions.json').then(r => r.json()),
		fetch('/data/sts2/relics.json').then(r => r.json())
	]);
	return { potions, relics };
}
