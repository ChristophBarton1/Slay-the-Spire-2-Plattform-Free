/**
 * ⚡ Image Utilities — own CDN (R2 + image-cache worker)
 *
 * Images are served directly from our CDN worker which stores WebP copies in R2.
 * Set CDN_BASE to a custom domain (e.g. https://cdn.ggez.gg) once you add
 * a Custom Domain to the image-cache worker in the Cloudflare dashboard.
 *
 * Flow:  Browser → CDN worker → R2 (cache hit ~5ms) / wsrv.nl → R2 (cache miss)
 * Old:   Browser → SvelteKit /api/cdn → CDN worker → R2 / wsrv.nl  (extra hop)
 */

// ── CDN base URL ───────────────────────────────────────────────
// Change this to your custom domain once configured (e.g. 'https://cdn.ggez.gg')
// Until then, the workers.dev URL works fine.
export const CDN_BASE = 'https://image-cache.christophbarton.workers.dev';

// Current DDragon version - UPDATE THIS when new patch drops
export const DDRAGON_VERSION = '16.13.1';

/**
 * Data Dragon numbers the client (15.x, 16.x…) but Riot's PUBLIC patch name for
 * the 2020+ seasons is year-based: DDragon 16.13 = the officially announced
 * "Patch 26.13". The two majors differ by exactly 10 (season year − 2000 −
 * DDragon-major offset). Show players the OFFICIAL name; keep DDRAGON_VERSION for
 * asset URLs. Falls back to the raw major.minor if the input is unexpected.
 *   toOfficialPatch('16.13.1') === '26.13'
 */
export function toOfficialPatch(ddragonVersion: string | null | undefined): string {
	if (!ddragonVersion) return '';
	const [majStr, min] = ddragonVersion.split('.');
	const maj = parseInt(majStr, 10);
	if (!Number.isFinite(maj) || min == null) {
		return (ddragonVersion.split('.').slice(0, 2).join('.')) || ddragonVersion;
	}
	return `${maj + 10}.${min}`;
}

// Riot Match API v5 returns some champion names that don't match DDragon file names
const CHAMPION_NAME_NORMALIZE: Record<string, string> = {
	'FiddleSticks': 'Fiddlesticks',
	'LeBlanc': 'Leblanc',
	'Wukong': 'MonkeyKing',
	'NunuWillump': 'Nunu',
	'KaiSa': 'Kaisa',
	'KhaZix': 'Khazix',
	'KogMaw': 'KogMaw',
	'ChoGath': 'Chogath',
	'BelVeth': 'Belveth',
	'KSante': 'KSante',
	'RenataGlasc': 'Renata',
	'VelKoz': 'Velkoz',
	'TahmKench': 'TahmKench',
	'AurelionSol': 'AurelionSol',
	'DrMundo': 'DrMundo',
	'JarvanIV': 'JarvanIV',
	'LeeSin': 'LeeSin',
	'MasterYi': 'MasterYi',
	'MissFortune': 'MissFortune',
	'RekSai': "RekSai",
	'TwistedFate': 'TwistedFate',
	'XinZhao': 'XinZhao',
};

export function normalizeChampionName(name: string): string {
	if (!name) return name;
	return CHAMPION_NAME_NORMALIZE[name] ?? name;
}

interface ImageOptions {
	width?: number;
	quality?: number;
}

/**
 * Build a direct CDN URL for a Riot image.
 * Images are served from our own R2-backed CDN worker (WebP, edge-cached).
 */
export function optimizeRiotImage(riotUrl: string, options: ImageOptions = {}): string {
	if (!riotUrl) return '';

	const { width } = options;

	// DDragon → CDN worker (all paths: versioned 16.7.1/img/... and unversioned img/champion/splash/...)
	if (riotUrl.includes('ddragon.leagueoflegends.com/cdn/')) {
		const path = riotUrl.replace('https://ddragon.leagueoflegends.com/cdn/', '');
		const url = `${CDN_BASE}/image/ddragon/${path}`;
		return width ? `${url}?width=${width}` : url;
	}

	// CommunityDragon → CDN worker
	if (riotUrl.includes('raw.communitydragon.org/')) {
		const path = riotUrl.replace('https://raw.communitydragon.org/', '');
		const url = `${CDN_BASE}/image/communitydragon/${path}`;
		return width ? `${url}?width=${width}` : url;
	}

	return riotUrl;
}

/**
 * Short helper for hardcoded CDN paths.
 * All paths go through the Worker's /image/ endpoint which serves WebP from R2.
 * Usage: cdn('ddragon/16.7.1/img/champion/Jinx.png?width=64')
 *        cdn('ddragon/img/champion/splash/Jinx_0.jpg')
 *        cdn('communitydragon/latest/plugins/...')
 *        cdn('spirecodex/static/images/cards/x.png?width=150')
 */
export function cdn(path: string): string {
	return `${CDN_BASE}/image/${path}`;
}

/**
 * Champion Splash Image (optimiert für Match History)
 */
export function getChampionSplash(championName: string, size: string = 'small'): string {
	const baseUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;
	
	const widths: Record<string, number> = {
		small: 400,   // Match History
		medium: 800,  // Hover/Preview
		large: 1200   // Hero Background — DDragon originals are 1215px, 1200 = near-lossless on 1440p
	};
	
	return optimizeRiotImage(baseUrl, {
		width: widths[size] || widths.small
	});
}

/**
 * Responsive srcset für Champion Splash
 * Für <img srcset="..." sizes="...">
 */
export function getChampionSplashSrcset(championName: string) {
	const baseUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;
	
	return {
		src: optimizeRiotImage(baseUrl, { width: 400 }),
		srcset: [
			`${optimizeRiotImage(baseUrl, { width: 214 })} 214w`,
			`${optimizeRiotImage(baseUrl, { width: 400 })} 400w`,
			`${optimizeRiotImage(baseUrl, { width: 600 })} 600w`
		].join(', '),
		sizes: '(max-width: 640px) 100vw, 214px'
	};
}

/**
 * Item Icon - Cloudflare WebP optimized
 */
export function getItemIcon(itemId: number | string, size: number = 64): string {
	if (!itemId) return '';
	const url = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${itemId}.png`;
	return optimizeRiotImage(url, { width: size });
}

/**
 * Champion Icon (Square) - for chat and inline use
 */
export function getChampionIcon(championName: string, size: number = 48): string {
	if (!championName) return '';
	const url = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${normalizeChampionName(championName)}.png`;
	return optimizeRiotImage(url, { width: size });
}

/**
 * Spell/Ability Icon helper.
 * Handles 3 inputs:
 *   - Summoner spell file names: "SummonerFlash" → ddragon spell/<name>.png
 *   - Champion ability shorthand: "AsheQ", "OrnnW", "FlashFrost" — the AI chat
 *     sometimes emits `<Champion><Slot>` which doesn't exist as a DDragon file.
 *     For "<Champion><Q|W|E|R>" we resolve via cdragon-proxy ability-icon path
 *     (our /img/[...] route maps this to DDragon's real filename via champion.json).
 *   - Anything else: pass through to DDragon spell/<X>.png (fallback).
 */
export function getSpellIcon(spellName: string, size: number = 48): string {
	if (!spellName) return '';
	// Pattern: <ChampionName><Q|W|E|R> — route through ability-icon resolver
	const m = spellName.match(/^([A-Z][A-Za-z]+?)([QWER])$/);
	if (m) {
		const champ = m[1];
		const slot = m[2].toLowerCase();
		return `${CDN_BASE}/image/cdragon/latest/champion/${champ}/ability-icon/${slot}?width=${size}`;
	}
	// Standard summoner-spell file lookup
	const url = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/spell/${spellName}.png`;
	return optimizeRiotImage(url, { width: size });
}

// Alias for backward compatibility
export const getSummonerSpellIcon = getSpellIcon;

/**
 * Rune Icon - for chat inline use
 * Uses CommunityDragon for better quality rune icons
 */
export function getRuneIcon(runeId: number | string, size: number = 48): string {
	if (!runeId) return '';
	// CommunityDragon has better organized rune icons
	const url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/${runeId}.png`;
	return optimizeRiotImage(url, { width: size });
}

/**
 * Rank Emblem - Compact icon (PBE shared-components) for profile/leaderboard
 */
export function getRankEmblem(tier: string, size: number = 64): string {
	if (!tier) return '';
	const tierLower = tier.toLowerCase();
	return `${CDN_BASE}/image/communitydragon/pbe/plugins/rcp-fe-lol-shared-components/global/default/images/${tierLower}.png?width=${size}`;
}

/**
 * Rank Emblem Full - Large emblem for hero sections
 */
export function getRankEmblemFull(tier: string): string {
	if (!tier) return '';
	return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`;
}

/**
 * Profile Icon - CommunityDragon has ALL icons including newest
 */
export function getProfileIcon(iconId: number | string, size: number = 64): string {
	if (!iconId && iconId !== 0) return '';
	// CommunityDragon has all profile icons including newest ones (443xxx, 447xxx series)
	const url = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${iconId}.jpg`;
	return optimizeRiotImage(url, { width: size });
}

/**
 * Profile Icon Fallback URL (DDragon) - for onerror handlers
 */
export function getProfileIconFallback(iconId: number | string): string {
	if (!iconId && iconId !== 0) return '';
	return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${iconId}.png`;
}

/**
 * Homepage Champion Cards (für trending champions)
 * Lighthouse-optimiert: Lädt nur die tatsächlich benötigte Größe (174x316)
 */
export function getChampionLoading(championName: string) {
	const baseUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championName}_0.jpg`;
	
	return {
		src: optimizeRiotImage(baseUrl, { width: 174 }),
		srcset: [
			`${optimizeRiotImage(baseUrl, { width: 174 })} 174w`,
			`${optimizeRiotImage(baseUrl, { width: 308 })} 308w`,
			`${optimizeRiotImage(baseUrl, { width: 400 })} 400w`
		].join(', '),
		sizes: '(max-width: 640px) 50vw, 174px'
	};
}

/**
 * Background Image (für Homepage Hero)
 */
export function getBackgroundImage(imageUrl: string): string {
	return optimizeRiotImage(imageUrl, { width: 1920 });
}

/**
 * Preload critical images (für LCP optimization)
 * Usage: In <svelte:head>
 */
export function preloadChampionSplash(championName: string): string {
	const url = getChampionSplash(championName, 'small');
	return `<link rel="preload" as="image" href="${url}" fetchpriority="high">`;
}
