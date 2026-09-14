<script>
	import { CHARACTER_THEMES, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { selectedCharacter, deck, selectedRelics, selectedPotions } from '$lib/sts2/stores/deckStore';
	import CharacterSelect from '$lib/sts2/components/CharacterSelect.svelte';
	import CardBrowser from '$lib/sts2/components/CardBrowser.svelte';
	import DeckPanel from '$lib/sts2/components/DeckPanel.svelte';
	import RelicPicker from '$lib/sts2/components/RelicPicker.svelte';
	import PotionPicker from '$lib/sts2/components/PotionPicker.svelte';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t } from 'svelte-i18n';
	import { getContext } from 'svelte';

	export let data;

	const localizedCards = getContext('localizedCards');

	let showRelicPicker = false;
	let showPotionPicker = false;
	let showMobileDeck = false;
	let showOnlyDeck = false;

	$: charId = $selectedCharacter?.id?.toLowerCase() || '';
	$: theme = charId ? CHARACTER_THEMES[charId] : null;
	$: deckCount = $deck.length;
	$: deckCardIds = $deck.map(c => c.id);

	function handleKeydown(e) {
		if (e.key === 'Escape') {
			if (showRelicPicker) { showRelicPicker = false; return; }
			if (showPotionPicker) { showPotionPicker = false; return; }
			if (showMobileDeck) { showMobileDeck = false; return; }
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title>{$t('sts2.seo.buildTitle')}</title>
	<meta name="description" content={$t('sts2.seo.buildDesc')}>
	<meta name="keywords" content={$t('sts2.seo.buildKeywords')}>
	<link rel="canonical" href="https://STS2_DOMAIN/build">
	<meta property="og:title" content={$t('sts2.seo.buildTitle')}>
	<meta property="og:description" content={$t('sts2.seo.buildDesc')}>
	<meta property="og:type" content="website">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:url" content="https://STS2_DOMAIN/build">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={$t('sts2.seo.buildTitle')}>
	<meta name="twitter:description" content={$t('sts2.seo.buildDesc')}>
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ggez.gg" },
			{ "@type": "ListItem", "position": 2, "name": "Slay the Spire 2", "item": "https://STS2_DOMAIN" },
			{ "@type": "ListItem", "position": 3, "name": "Deck Builder", "item": "https://STS2_DOMAIN/build" }
		]
	})}</script>`}
</svelte:head>

<div class="relative z-10 min-h-screen bg-[#0a0a0f]">
	<!-- Top Bar -->
	<div class="sticky top-14 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[#c8aa6e]/10">
		<div class="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<a href="/" class="text-sm text-[#c8aa6e]/80 hover:text-[#c8aa6e] transition-colors tracking-wider hidden sm:inline">GGEZ.GG</a>
				<span class="text-[#c8aa6e]/20 hidden sm:inline">/</span>
				<a href="/" class="text-sm text-gray-400 hover:text-[#c8aa6e] transition-colors tracking-wider">StS2</a>
				<span class="text-[#c8aa6e]/20">/</span>
				<span class="text-sm font-bold tracking-[2px] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#c8aa6e] to-[#f1ede3]">
					{$t('sts2.deckBuilder')}
				</span>
			</div>

			<div class="flex items-center gap-2">
				<a href="/game-database" class="hidden md:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.nav.cards')}
				</a>
				<a href="/game-database?tab=relics" class="hidden md:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.nav.relics')}
				</a>
				<a href="/decks" class="hidden md:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.nav.decks')}
				</a>
				<a href="/synergies" class="hidden md:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.synergies')}
				</a>
				<a href="/guides" class="hidden md:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.guides')}
				</a>
				<a href="/tier-list" class="hidden md:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.tierList')}
				</a>

	<!-- Tablet deck toggle (hidden on phone where we have FAB) -->
				<button
					on:click={() => showMobileDeck = !showMobileDeck}
					class="hidden sm:flex lg:hidden relative px-3 py-1.5 border border-[#c8aa6e]/20 text-xs text-gray-400 hover:text-[#c8aa6e] transition-colors font-medium tracking-wider"
				>
					{$t('sts2.deck')}
					{#if deckCount > 0}
						<span class="absolute -top-1.5 -right-1.5 w-5 h-5 text-[9px] font-bold flex items-center justify-center text-white bg-[#c8aa6e]">
							{deckCount}
						</span>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<h1 class="sr-only">{$t('sts2.seo.buildTitle')}</h1>
	<div class="max-w-[1600px] mx-auto px-4 py-6">
		<!-- Character Selection -->
		<div class="mb-6">
			<CharacterSelect characters={data.characters} allCards={$localizedCards} />
		</div>

		{#if $selectedCharacter}
			<!-- Relic & Potion buttons -->
			<div class="flex flex-wrap items-center gap-2 mb-4">
				<button
					on:click={() => showRelicPicker = true}
					class="flex items-center gap-2 px-3 py-2 border border-[#c8aa6e]/15 hover:border-[#c8aa6e]/40 bg-[#161620] transition-all text-xs text-gray-400 hover:text-[#c8aa6e] font-medium tracking-wider"
				>
					<span>{$t('sts2.buildPage.relics')}</span>
					{#if $selectedRelics.length > 0}
						<span class="px-1.5 py-0.5 text-[9px] font-bold bg-[#c8aa6e]/15 text-[#c8aa6e] border border-[#c8aa6e]/30">
							{$selectedRelics.length}
						</span>
					{/if}
				</button>

				<button
					on:click={() => showPotionPicker = true}
					class="flex items-center gap-2 px-3 py-2 border border-[#c8aa6e]/15 hover:border-[#c8aa6e]/40 bg-[#161620] transition-all text-xs text-gray-400 hover:text-[#c8aa6e] font-medium tracking-wider"
				>
					<span>{$t('sts2.buildPage.potions')}</span>
					{#if $selectedPotions.length > 0}
						<span class="px-1.5 py-0.5 text-[9px] font-bold bg-[#c8aa6e]/15 text-[#c8aa6e] border border-[#c8aa6e]/30">
							{$selectedPotions.length}/3
						</span>
					{/if}
				</button>

				{#if deckCount > 0}
					<button
						on:click={() => showOnlyDeck = !showOnlyDeck}
						class="flex items-center gap-2 px-3 py-2 border transition-all text-xs font-medium tracking-wider {showOnlyDeck ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-[#c8aa6e]/15 hover:border-[#c8aa6e]/40 bg-[#161620] text-gray-400 hover:text-[#c8aa6e]'}"
					>
						<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" /></svg>
						<span>{$t('sts2.buildPage.onlyFromDeck')}</span>
						<span class="px-1.5 py-0.5 text-[9px] font-bold {showOnlyDeck ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-[#c8aa6e]/15 text-[#c8aa6e] border border-[#c8aa6e]/30'}">
							{deckCount}
						</span>
					</button>
				{/if}

				<!-- Selected relic thumbnails (hidden on phones) -->
				{#if $selectedRelics.length > 0}
					<div class="hidden sm:flex gap-1 ml-2">
						{#each $selectedRelics.slice(0, 8) as relic}
							<div class="w-7 h-7 border border-[#c8aa6e]/20 overflow-hidden" title={relic.name}>
								{#if relic.image_url}
									<img src={getImageUrl(relic.image_url, 60)} alt={relic.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
								{/if}
							</div>
						{/each}
						{#if $selectedRelics.length > 8}
							<span class="text-[10px] text-gray-500 self-center">+{$selectedRelics.length - 8}</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Main Layout: Card Browser + Deck Panel -->
			<div class="flex gap-6">
				<div class="flex-1 min-w-0">
					<CardBrowser cards={$localizedCards} {deckCardIds} {showOnlyDeck} />
				</div>

				<!-- Deck Panel (right sidebar) - Desktop -->
				<div class="hidden lg:block w-80 shrink-0">
					<div class="sticky top-[4.25rem] bg-[#161620] border border-[#c8aa6e]/15 p-4">
						<DeckPanel
							user={data.user}
						/>
					</div>
				</div>
			</div>
		{:else}
			<div class="text-center py-20">
				<p class="text-gray-500 text-sm tracking-wide">{$t('sts2.buildPage.pickCharacter')}</p>
			</div>
		{/if}
	</div>

	<!-- Bottom spacer for mobile nav -->
	<div class="h-20 sm:hidden"></div>
	<div class="hidden sm:block h-16 lg:hidden"></div>
</div>

<!-- Mobile Deck FAB (phones only, above mobile nav) -->
{#if $selectedCharacter && !showMobileDeck}
	<button
		on:click={() => showMobileDeck = true}
		class="sm:hidden lg:hidden fixed bottom-[4.5rem] right-4 z-[9997] w-14 h-14 bg-[#c8aa6e]/90 hover:bg-[#c8aa6e] text-black rounded-full shadow-lg shadow-[#c8aa6e]/30 flex items-center justify-center transition-all active:scale-95"
		aria-label="Open deck"
	>
		<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
		</svg>
		{#if deckCount > 0}
			<span class="absolute -top-1 -right-1 w-6 h-6 text-[10px] font-bold flex items-center justify-center text-white bg-red-500 rounded-full">{deckCount}</span>
		{/if}
	</button>
{/if}

<MobileNav />

<!-- Mobile Deck Panel (bottom sheet) -->
{#if showMobileDeck}
	<div class="lg:hidden fixed inset-0 z-[9999]">
		<button class="absolute inset-0 bg-black/70 cursor-default" on:click={() => showMobileDeck = false} aria-label="Close deck panel"></button>
		<div class="absolute bottom-0 left-0 right-0 bg-[#161620] border-t border-[#c8aa6e]/20 max-h-[80vh] overflow-y-auto p-4">
			<div class="w-10 h-1 bg-[#c8aa6e]/30 mx-auto mb-4"></div>
			<DeckPanel
				user={data.user}
			/>
		</div>
	</div>
{/if}

<!-- Modals -->
<RelicPicker relics={data.relics} relicTranslations={data.relicTranslations} bind:show={showRelicPicker} />
<PotionPicker potions={data.potions} potionTranslations={data.potionTranslations} bind:show={showPotionPicker} />

