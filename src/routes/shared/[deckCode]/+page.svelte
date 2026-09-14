<script>
	import { CHARACTER_THEMES, CARD_TYPE_COLORS, RARITY_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { parseDescription } from '$lib/sts2/utils/cardFilters';
	import { detectSynergies } from '$lib/sts2/utils/synergies';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t, locale } from 'svelte-i18n';
	import { localizeItems } from '$lib/sts2/utils/itemLocale';
	import { localizeCards } from '$lib/sts2/utils/cardLocale';
	import { deck as deckStore, selectedCharacter as storeCharacter, selectedRelics as storeRelics, selectedPotions as storePotions } from '$lib/sts2/stores/deckStore';
	import { goto } from '$app/navigation';

	export let data;

	let copied = false;

	$: character = data.character;
	$: localizedDeckCards = localizeCards(data.deckCards || [], data.cardTranslations || {}, $locale);
	$: localizedRelics = localizeItems(data.deckRelics || [], data.relicTranslations || {}, $locale);
	$: localizedPotions = localizeItems(data.deckPotions || [], data.potionTranslations || {}, $locale);
	$: cards = localizedDeckCards;
	$: relics = localizedRelics;
	$: potions = localizedPotions;
	$: error = data.error;

	$: theme = character ? CHARACTER_THEMES[character.id.toLowerCase()] : null;
	$: synergies = detectSynergies(cards, relics);

	$: grouped = groupByType(cards);
	$: stats = calcStats(cards);

	function groupByType(cards) {
		const groups = { Attack: [], Skill: [], Power: [], Other: [] };
		for (const card of cards) {
			const key = groups[card.type] !== undefined ? card.type : 'Other';
			groups[key].push(card);
		}
		return Object.entries(groups).filter(([, c]) => c.length > 0);
	}

	function calcStats(cards) {
		const total = cards.length;
		const attacks = cards.filter(c => c.type === 'Attack').length;
		const skills = cards.filter(c => c.type === 'Skill').length;
		const powers = cards.filter(c => c.type === 'Power').length;
		const avgCost = total > 0 ? (cards.reduce((s, c) => s + (c.cost || 0), 0) / total).toFixed(1) : '0';
		const totalDamage = cards.reduce((s, c) => s + ((c.damage || 0) * (c.hit_count || 1)), 0);
		const totalBlock = cards.reduce((s, c) => s + (c.block || 0), 0);
		return { total, attacks, skills, powers, avgCost, totalDamage, totalBlock };
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			copied = true;
			setTimeout(() => copied = false, 2000);
		} catch {}
	}

	function importToBuilder() {
		if (!character) return;
		storeCharacter.set(character);
		deckStore.set(cards.map(c => ({ ...c, _uid: Date.now() + Math.random() })));
		storeRelics.set(relics);
		storePotions.set(potions);
		goto('/build');
	}

	$: costDisplay = (card) => card.is_x_cost ? 'X' : (card.star_cost != null ? `★${card.star_cost}` : card.cost);
</script>

<svelte:head>
	<title>{$t('sts2.sharedDeck.seoTitle', { values: { name: character?.name || $t('sts2.sharedDeck.sharedDeck') }})}</title>
	<meta name="description" content="{$t('sts2.sharedDeck.seoDesc', { values: { name: character?.name || '', count: cards.length }})}">
	<meta property="og:title" content="{$t('sts2.sharedDeck.ogTitle', { values: { name: character?.name || $t('sts2.sharedDeck.sharedDeck'), count: cards.length }})}">
	<meta property="og:description" content="{$t('sts2.sharedDeck.ogDesc', { values: { name: character?.name || '' }})}">
	<meta property="og:type" content="website">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
</svelte:head>

{#if error}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<h1 class="text-2xl text-white mb-2">{$t('sts2.sharedDeck.invalidLink')}</h1>
			<p class="text-gray-500 mb-6">{$t('sts2.sharedDeck.cannotDecode')}</p>
			<a href="/build" class="px-5 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white text-sm transition-colors">
				{$t('sts2.sharedDeck.goToBuilder')}
			</a>
		</div>
	</div>
{:else}
	<!-- Ambient glow -->
	<div class="fixed inset-0 pointer-events-none z-0 transition-all duration-1000"
		style="background: radial-gradient(ellipse at 30% 20%, {theme?.bgGlow || 'rgba(200,170,110,0.05)'} 0%, transparent 60%)"
	></div>

	<div class="relative z-10 min-h-screen">
		<!-- Top Bar -->
		<div class="bg-[#161620]/90 backdrop-blur-md border-b border-white/5">
			<div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
				<div class="flex items-center gap-2 sm:gap-3 min-w-0">
					<a href="/" class="text-xs sm:text-sm text-[#c8aa6e]/80 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0 hidden sm:inline">GGEZ.GG</a>
					<span class="text-gray-600 shrink-0 hidden sm:inline">/</span>
					<a href="/build" class="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors tracking-wider shrink-0">{$t('sts2.buildPage.title')}</a>
					<span class="text-gray-600 shrink-0">/</span>
					<span class="text-xs sm:text-sm font-bold truncate" style="color: {theme?.color || '#c8aa6e'}">{$t('sts2.sharedDeck.sharedDeck')}</span>
				</div>
				<div class="flex items-center gap-2 shrink-0">
					<button
						on:click={copyLink}
						class="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-white transition-colors"
					>
						{copied ? $t('sts2.sharedDeck.copied') : $t('sts2.sharedDeck.copyLink')}
					</button>
					<button
						on:click={importToBuilder}
						class="px-3 py-1.5 border text-xs font-bold tracking-wider uppercase transition-all"
						style="border-color: {theme?.color || '#c8aa6e'}50; color: {theme?.color || '#c8aa6e'}; background: {theme?.color || '#c8aa6e'}15"
					>
						Import to Builder
					</button>
				</div>
			</div>
		</div>

		<div class="max-w-5xl mx-auto px-4 py-8">
			<!-- Character Header -->
			{#if character}
				<div class="flex items-center gap-4 mb-8">
					{#if character.image_url}
						<div class="w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0" style="border-color: {theme?.color || '#c8aa6e'}40">
							<img src={getImageUrl(character.image_url, 200)} alt={character.name} class="w-full h-full object-cover object-top" decoding="async" />
						</div>
					{/if}
					<div>
						<h1 class="text-xl sm:text-2xl font-bold tracking-wider" style="color: {theme?.color || '#c8aa6e'}">{character.name} {$t('sts2.sharedDeck.deck')}</h1>
						<div class="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400 mt-1">
							<span>{stats.total} {$t('sts2.buildPage.cards')}</span>
							<span class="text-gray-600">•</span>
							<span>{$t('sts2.buildPage.avgCost')}: {stats.avgCost}</span>
							<span class="text-gray-600">•</span>
							<span class="text-red-400">{$t('sts2.dmg')} {stats.totalDamage}</span>
							<span class="text-gray-600">•</span>
							<span class="text-blue-400">{$t('sts2.blk')} {stats.totalBlock}</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Stats Bar -->
			<div class="grid grid-cols-3 gap-4 mb-8">
				<div class="bg-[#0a0a10] border border-red-500/20 rounded-lg p-3 text-center">
					<span class="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">{$t('sts2.sharedDeck.attacks')}</span>
					<span class="text-lg font-bold text-red-400">{stats.attacks}</span>
				</div>
				<div class="bg-[#0a0a10] border border-blue-500/20 rounded-lg p-3 text-center">
					<span class="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">{$t('sts2.sharedDeck.skills')}</span>
					<span class="text-lg font-bold text-blue-400">{stats.skills}</span>
				</div>
				<div class="bg-[#0a0a10] border border-yellow-500/20 rounded-lg p-3 text-center">
					<span class="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">{$t('sts2.sharedDeck.powers')}</span>
					<span class="text-lg font-bold text-yellow-400">{stats.powers}</span>
				</div>
			</div>

			<!-- Relics & Potions -->
			{#if relics.length > 0 || potions.length > 0}
				<div class="flex flex-wrap gap-6 mb-8">
					{#if relics.length > 0}
						<div>
							<span class="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">{$t('sts2.buildPage.relics')}</span>
							<div class="flex flex-wrap gap-2">
								{#each relics as relic}
									<div class="flex items-center gap-2 px-2 py-1.5 bg-[#0a0a10] border border-white/10 rounded-lg" title={relic.description}>
										{#if relic.image_url}
											<img src={getImageUrl(relic.image_url, 60)} alt={relic.name} class="w-7 h-7 rounded object-cover" loading="lazy" decoding="async" />
										{/if}
										<span class="text-xs text-white">{relic.name}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
					{#if potions.length > 0}
						<div>
							<span class="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">{$t('sts2.buildPage.potions')}</span>
							<div class="flex flex-wrap gap-2">
								{#each potions as potion}
									<div class="flex items-center gap-2 px-2 py-1.5 bg-[#0a0a10] border border-white/10 rounded-lg" title={potion.description}>
										{#if potion.image_url}
											<img src={getImageUrl(potion.image_url, 60)} alt={potion.name} class="w-7 h-7 rounded object-cover" loading="lazy" decoding="async" />
										{/if}
										<span class="text-xs text-white">{potion.name}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Synergies -->
			{#if synergies.length > 0}
				<div class="mb-8">
					<span class="text-[10px] uppercase tracking-widest text-gray-500 block mb-3">{$t('sts2.sharedDeck.detectedSynergies')}</span>
					<div class="flex flex-wrap gap-2">
						{#each synergies as syn}
							<div class="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs
								{syn.strength === 'strong' ? 'bg-green-500/5 border-green-500/20 text-green-400' :
								 syn.strength === 'warning' ? 'bg-yellow-500/5 border-yellow-500/15 text-yellow-400' :
								 'bg-blue-500/5 border-blue-500/10 text-blue-400'}"
							>
								<span class="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-current/10">{syn.icon}</span>
								<span class="font-bold">{syn.name}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Cards Grid -->
			{#each grouped as [type, typeCards]}
				{@const typeStyle = CARD_TYPE_COLORS[type] || CARD_TYPE_COLORS.Attack}
				<div class="mb-8">
					<div class="flex items-center gap-3 mb-3">
						<h3 class="text-sm font-bold tracking-wider {typeStyle.text}">{type}</h3>
						<span class="text-[10px] text-gray-600">({typeCards.length})</span>
						<div class="flex-1 h-px bg-white/5"></div>
					</div>
					<div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
						{#each typeCards as card}
							{@const rarityStyle = RARITY_COLORS[card.rarity] || RARITY_COLORS.Common}
							<div class="relative bg-[#0a0a10] border {typeStyle.border} rounded-lg overflow-hidden">
								<div class="relative aspect-[3/4] overflow-hidden">
									{#if card.image_url}
										<img src={getImageUrl(card.image_url, 200)} alt={card.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
									{:else}
										<div class="w-full h-full bg-gray-900 flex items-center justify-center text-2xl opacity-20">⚔️</div>
									{/if}
									<div class="absolute inset-0 bg-gradient-to-t from-[#0a0a10] via-transparent to-transparent"></div>
									<div class="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">
										{costDisplay(card)}
									</div>
								</div>
								<div class="p-1.5">
									<h4 class="text-[10px] text-white truncate">{card.name}</h4>
									<div class="flex items-center gap-1 mt-0.5">
										<span class="text-[8px] {rarityStyle.text} uppercase">{card.rarity}</span>
										{#if card.damage}
											<span class="text-[8px] text-red-400">{$t('sts2.dmg')} {card.damage}</span>
										{/if}
										{#if card.block}
											<span class="text-[8px] text-blue-400">{$t('sts2.blk')} {card.block}</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}

			<!-- CTA -->
			<div class="py-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<a href="/decks" class="text-sm text-gray-500 hover:text-[#c8aa6e] transition-colors">← {$t('sts2.communityDecks')}</a>
				<button
					on:click={importToBuilder}
					class="flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-wider uppercase border transition-all hover:brightness-110"
					style="border-color: {theme?.color || '#c8aa6e'}50; color: {theme?.color || '#c8aa6e'}; background: {theme?.color || '#c8aa6e'}15"
				>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
					{$t('sts2.sharedDeck.importToBuilder')}
				</button>
			</div>
		</div>

		<!-- Bottom spacer for mobile nav -->
		<div class="h-16 sm:hidden"></div>
	</div>
{/if}

<MobileNav />
