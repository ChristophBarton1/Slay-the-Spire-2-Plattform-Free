<script>
	import '../app.css';
	import { initWithSSRData, initFallback } from '$lib/i18n';
	import { isLoading, locale, t } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { setContext, onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { invalidate } from '$app/navigation';
	import GlobalCardTooltip from '$lib/sts2/components/GlobalCardTooltip.svelte';
	import { localizeCards } from '$lib/sts2/utils/cardLocale';

	export let data;

	if (data?.ssrLocale && data?.ssrMessages) {
		initWithSSRData(data.ssrLocale, data.ssrMessages, data.ssrGuidesMessages, data.ssrFallbackMessages);
	} else {
		initFallback();
	}
	$: if (browser && $locale) document.documentElement.lang = $locale;

	// Card data context (was the /slay-the-spire-2 layout inside ggez.gg)
	const cardsStore = writable(data.cards || []);
	const translationsStore = writable(data.cardTranslations || {});
	$: cardsStore.set(data.cards || []);
	$: translationsStore.set(data.cardTranslations || {});
	const localizedCards = derived(
		[locale, cardsStore, translationsStore],
		([$locale, $cards, $translations]) => localizeCards($cards, $translations, $locale)
	);
	setContext('localizedCards', localizedCards);
	setContext('sts2', { keywordTranslations: data.keywordTranslations });
	onMount(() => {
		if (!data.cards || data.cards.length === 0) invalidate('sts2:cards');
	});

	const NAV = [
		{ href: '/', key: 'sts2.nav.home', match: (p) => p === '/' },
		{ href: '/build', key: 'sts2.nav.build', match: (p) => p.startsWith('/build') },
		{ href: '/game-database', key: 'sts2.nav.cards', match: (p) => p.startsWith('/game-database') || p.startsWith('/cards') },
		{ href: '/guides', key: 'sts2.guides', match: (p) => p.startsWith('/guides') },
		{ href: '/tier-list', key: 'sts2.tierList', match: (p) => p.startsWith('/tier-list') },
		{ href: '/synergies', key: 'sts2.synergies', match: (p) => p.startsWith('/synergies') },
		{ href: '/decks', key: 'sts2.nav.decks', match: (p) => p.startsWith('/decks') }
	];
	$: path = $page.url.pathname;
</script>

{#if $isLoading}
	<div class="min-h-screen bg-[#0a0a0f]"></div>
{:else}
	<!-- Desktop top bar (phones use the STS2 MobileNav inside each page) -->
	<nav class="hub-nav" aria-label="Main">
		<div class="hub-nav-inner">
			<a href="/" class="hub-brand">{$t('sts2.title')}</a>
			<div class="hub-links">
				{#each NAV as l}<a href={l.href} class:on={l.match(path)}>{$t(l.key)}</a>{/each}
			</div>
		</div>
	</nav>
	<main class="hub-main">
		<slot />
	</main>
	<GlobalCardTooltip />
	<footer class="border-t border-[#c8aa6e]/8 bg-[#0a0a0f] mt-auto">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
			<div class="flex items-center gap-3 text-[10px] text-gray-600 uppercase tracking-widest">
				<span>Slay the Spire 2</span><span>·</span><span>Early Access · March 2026</span>
			</div>
			<div class="flex items-center gap-4 text-[10px] text-gray-600 uppercase tracking-widest">
				<span>Fan site — not affiliated with Mega Crit</span><span>·</span>
				<a href="https://www.reddit.com/r/slaythespire/" target="_blank" rel="noopener" class="hover:text-[#c8aa6e]/60 transition-colors">r/slaythespire</a>
			</div>
		</div>
	</footer>
{/if}

<style>
	.hub-nav { position: sticky; top: 0; z-index: 50; background: rgba(10, 10, 15, 0.94); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(200, 170, 110, 0.12); }
	.hub-nav-inner { max-width: 80rem; margin: 0 auto; padding: 0 16px; height: 56px; display: flex; align-items: center; gap: 24px; }
	.hub-brand { font-family: 'Cinzel', serif; font-weight: 700; font-size: 15px; letter-spacing: 0.06em; color: #e6c98a; text-decoration: none; white-space: nowrap; }
	.hub-links { display: none; align-items: center; gap: 2px; height: 100%; }
	@media (min-width: 640px) { .hub-links { display: flex; } }
	.hub-links a { display: flex; align-items: center; height: 100%; padding: 0 12px; font-size: 13px; font-weight: 600; color: #b9bcc6; text-decoration: none; border-bottom: 2px solid transparent; margin-bottom: -1px; }
	.hub-links a:hover { color: #f1ede3; }
	.hub-links a.on { color: #e6c98a; border-bottom-color: #c8aa6e; }
	.hub-main { min-height: calc(100vh - 56px); }
</style>
