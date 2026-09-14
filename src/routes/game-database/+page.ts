import { browser } from '$app/environment';

export const load = async ({ fetch, depends }: { fetch: typeof globalThis.fetch; depends: (dep: string) => void }) => {
	depends('sts2:db-data');

	if (!browser) {
		return { potions: [], relics: [], monsters: [], encounters: [], events: [], enchantments: [], enchantmentTranslations: {}, powers: [] };
	}

	const [potions, relics, monsters, encounters, events, enchantments, enchantmentTranslations, powers] = await Promise.all([
		fetch('/data/sts2/potions.json').then(r => r.json()).catch(() => []),
		fetch('/data/sts2/relics.json').then(r => r.json()).catch(() => []),
		fetch('/data/sts2/monsters.json').then(r => r.json()).catch(() => []),
		fetch('/data/sts2/encounters.json').then(r => r.json()).catch(() => []),
		fetch('/data/sts2/events.json').then(r => r.json()).catch(() => []),
		fetch('/data/sts2/enchantments.json').then(r => r.json()).catch(() => []),
		fetch('/data/sts2/enchantments-i18n.json').then(r => r.json()).catch(() => ({})),
		fetch('/data/sts2/powers.json').then(r => r.json()).catch(() => [])
	]);

	return { potions, relics, monsters, encounters, events, enchantments, enchantmentTranslations, powers };
};
