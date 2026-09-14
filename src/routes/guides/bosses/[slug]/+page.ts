import { BOSS_DATA } from '$lib/sts2/data/bosses';
import { error } from '@sveltejs/kit';

// Static content — prerender at build for instant CDN delivery (0ms TTFB).
export const prerender = true;
export const entries = () => BOSS_DATA.map((b) => ({ slug: b.slug }));

export async function load({ params }: { params: { slug: string } }) {
	const boss = BOSS_DATA.find(b => b.slug === params.slug);
	if (!boss) {
		throw error(404, 'Boss not found');
	}
	const idx = BOSS_DATA.indexOf(boss);
	const prev = idx > 0 ? BOSS_DATA[idx - 1] : null;
	const next = idx < BOSS_DATA.length - 1 ? BOSS_DATA[idx + 1] : null;
	return { boss, prev, next };
}
