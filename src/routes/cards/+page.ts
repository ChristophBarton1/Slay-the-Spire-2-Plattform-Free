import { browser } from '$app/environment';
import type { PageLoad } from './$types';

// cards/characters come from layout. The remaining ~578KB of tab data is only
// loaded client-side (not embedded in SSR HTML) to keep the initial response small.
// The page.svelte calls invalidate('sts2:db-data') in onMount to trigger this.
export const load: PageLoad = async ({ fetch, depends }) => {
	depends('sts2:db-data');

	if (!browser) {
		return { potions: [], relics: [], monsters: [], encounters: [], events: [], enchantments: [], enchantmentTranslations: {}, powers: [] };
	}

	const [potions, relics, monsters, encounters, events, enchantments, enchantmentTranslations, powers] = await Promise.all([
		fetch('/data/sts2/potions.json').then(r => r.json()),
		fetch('/data/sts2/relics.json').then(r => r.json()),
		fetch('/data/sts2/monsters.json').then(r => r.json()),
		fetch('/data/sts2/encounters.json').then(r => r.json()),
		fetch('/data/sts2/events.json').then(r => r.json()),
		fetch('/data/sts2/enchantments.json').then(r => r.json()),
		fetch('/data/sts2/enchantments-i18n.json').then(r => r.json()).catch(() => ({})),
		fetch('/data/sts2/powers.json').then(r => r.json()).catch(() => [])
	]);

	return { potions, relics, monsters, encounters, events, enchantments, enchantmentTranslations, powers };
};
