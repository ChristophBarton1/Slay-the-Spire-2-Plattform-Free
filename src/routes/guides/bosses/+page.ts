import { BOSS_DATA } from '$lib/sts2/data/bosses';

export const prerender = true;

export async function load() {
	return { bosses: BOSS_DATA };
}
