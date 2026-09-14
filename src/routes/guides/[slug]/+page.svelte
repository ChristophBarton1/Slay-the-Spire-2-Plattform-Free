<script>
	import { goto } from '$app/navigation';
	import { CHARACTER_THEMES, CARD_TYPE_COLORS, RARITY_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { parseDescription } from '$lib/sts2/utils/cardFilters';
	import { BOSS_DATA } from '$lib/sts2/data/bosses';
	import { loadCardsByIds } from '$lib/sts2/stores/deckStore';
	import { showCardHover, updateHoverPosition, hideCardHover } from '$lib/sts2/stores/cardHoverStore';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t, locale } from 'svelte-i18n';
	import { localizeItems } from '$lib/sts2/utils/itemLocale';

	export let data;

	$: guide = data.guide;
	$: character = data.character;
	$: allCards = data.cards || [];
	$: localizedRelics = localizeItems(data.relics || [], data.relicTranslations || {}, $locale);
	$: allRelics = localizedRelics;
	$: theme = CHARACTER_THEMES[data.slug] || CHARACTER_THEMES.ironclad;

	// SSR-safe i18n helpers — fallback to guide data if translation key not resolved
	$: guideTitle = (() => {
		const translated = $t(`sts2.guideData.${data.slug}.title`);
		return translated.includes('sts2.guideData.') ? `${guide.name} Guide — Decks, Playstyle & Strategy` : translated;
	})();
	$: guideOverview = (() => {
		const translated = $t(`sts2.guideData.${data.slug}.overview`);
		return translated.includes('sts2.guideData.') ? `Complete ${guide.name} guide for Slay the Spire 2. Decks, playstyle tips, boss matchups, and ascension strategies.` : translated;
	})();
	$: guideKeywords = `${guide.name} guide StS2, ${guide.name} deck Slay the Spire 2, ${guide.name} strategy, ${guide.name} archetypes, ${guide.name} key cards, ${guide.name} tips, Slay the Spire 2 ${guide.name}, how to play ${guide.name} StS2`;
	// Truncate at word boundary for meta descriptions
	function truncateAtWord(text, maxLen) {
		if (text.length <= maxLen) return text;
		const truncated = text.slice(0, maxLen);
		const lastSpace = truncated.lastIndexOf(' ');
		return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
	}

	$: PRIORITY_LABELS = {
		core: { label: $t('sts2.guidePage.core'), cardsLabel: $t('sts2.guidePage.coreCards'), badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
		early: { label: $t('sts2.guidePage.earlyPick'), cardsLabel: $t('sts2.guidePage.earlyPickCards'), badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
		payoff: { label: $t('sts2.guidePage.payoff'), cardsLabel: $t('sts2.guidePage.payoffCards'), badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30' }
	};

	const PRIORITY_ORDER = ['core', 'early', 'payoff'];

	function findCard(id) {
		return allCards.find(c => c.id === id);
	}
	function findRelic(id) {
		return allRelics.find(r => r.id === id);
	}

	function groupByPriority(cards) {
		const groups = {};
		for (let idx = 0; idx < cards.length; idx++) {
			const entry = cards[idx];
			const p = entry.priority || 'core';
			if (!groups[p]) groups[p] = [];
			groups[p].push({ ...entry, _origIdx: idx });
		}
		return PRIORITY_ORDER.filter(p => groups[p]).map(p => ({ key: p, ...PRIORITY_LABELS[p], cards: groups[p] }));
	}

	$: costDisplay = (card) => card?.is_x_cost ? 'X' : (card?.star_cost != null ? `★${card.star_cost}` : card?.cost ?? '?');

	function findCardByName(name) {
		const n = name.trim().toLowerCase();
		return allCards.find(c => c.name.toLowerCase() === n);
	}

	function parseDraftCards(cardsStr) {
		if (!cardsStr) return [];
		return cardsStr.split(',').map(s => s.trim()).filter(Boolean);
	}

	// Build boss name → image & slug maps from BOSS_DATA
	const BOSS_IMAGES = Object.fromEntries(BOSS_DATA.filter(b => b.image).map(b => [b.name, b.image]));
	const BOSS_SLUGS = Object.fromEntries(BOSS_DATA.map(b => [b.name, b.slug]));
	// Extra aliases for minion names used in matchups
	const BOSS_IMAGE_EXTRAS = {
		'Crusher': '/static/images/monsters/crusher.png',
		'Rocket': '/static/images/monsters/rocket.png',
		'Torch Head Amalgam': '/static/images/monsters/amalgam.png'
	};
	function bossImage(name) { return BOSS_IMAGES[name] || BOSS_IMAGE_EXTRAS[name] || null; }
	function bossSlug(name) { return BOSS_SLUGS[name] || null; }

	function importBuild(build) {
		const cardIds = build.fullDeck || build.keyCards.map(entry => entry.id);
		if (!character) return;
		loadCardsByIds(character, cardIds, allCards);
		goto('/build');
	}
</script>

<svelte:head>
	<title>{guideTitle} — ggez.gg</title>
	<meta name="description" content="{truncateAtWord(guideOverview, 155)}">
	<meta name="keywords" content={guideKeywords}>
	<link rel="canonical" href="https://STS2_DOMAIN/guides/{data.slug}">
	<meta property="og:title" content="{guideTitle} — ggez.gg">
	<meta property="og:description" content="{truncateAtWord(guideOverview, 200)}">
	<meta property="og:type" content="article">
	<meta property="og:url" content="https://STS2_DOMAIN/guides/{data.slug}">
	<meta property="og:site_name" content="ggez.gg">
	{#if character?.image_url}
		<meta property="og:image" content="https://ggez.gg{getImageUrl(character.image_url, 600)}">
		<meta name="twitter:image" content="https://ggez.gg{getImageUrl(character.image_url, 600)}">
	{:else}
		<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
		<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
	{/if}
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="{guideTitle} — ggez.gg">
	<meta name="twitter:description" content="{truncateAtWord(guideOverview, 200)}">
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "Article",
		"headline": guideTitle,
		"description": truncateAtWord(guideOverview, 200),
		"url": `https://STS2_DOMAIN/guides/${data.slug}`,
		"author": { "@type": "Organization", "name": "ggez.gg", "url": "https://ggez.gg" },
		"publisher": { "@type": "Organization", "name": "ggez.gg", "url": "https://ggez.gg" },
		"datePublished": "2024-01-01",
		"dateModified": new Date().toISOString().split('T')[0],
		"mainEntityOfPage": { "@type": "WebPage", "@id": `https://STS2_DOMAIN/guides/${data.slug}` }
	})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://ggez.gg"},
			{"@type": "ListItem", "position": 2, "name": "Slay the Spire 2", "item": "https://STS2_DOMAIN"},
			{"@type": "ListItem", "position": 3, "name": "Guides", "item": "https://STS2_DOMAIN/guides"},
			{"@type": "ListItem", "position": 4, "name": data.guide?.name || data.slug, "item": "https://STS2_DOMAIN/guides/" + data.slug}
		]
	})}</script>`}
</svelte:head>

<div class="relative z-10 min-h-screen bg-[#0a0a0f]">
	<!-- Top Bar -->
	<div class="sticky top-11 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[#c8aa6e]/10">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3 overflow-x-auto">
			<a href="/" class="text-sm text-[#c8aa6e]/80 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0 hidden sm:inline">GGEZ.GG</a>
			<span class="text-[#c8aa6e]/20 shrink-0 hidden sm:inline">/</span>
			<a href="/" class="text-sm text-gray-400 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0">StS2</a>
			<span class="text-[#c8aa6e]/20 shrink-0">/</span>
			<a href="/guides" class="text-sm text-gray-400 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0">{$t('sts2.guides')}</a>
			<span class="text-[#c8aa6e]/20 shrink-0">/</span>
			<span class="text-sm font-bold truncate text-transparent bg-clip-text bg-gradient-to-r from-[#c8aa6e] to-[#f1ede3]">{guide.name}</span>

			<div class="ml-auto flex items-center gap-2 shrink-0">
				<a href="/game-database" class="hidden sm:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.nav.cards')}
				</a>
				<a href="/game-database?tab=relics" class="hidden sm:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.nav.relics')}
				</a>
				<a href="/synergies" class="hidden sm:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.synergies')}
				</a>
				<a href="/build" class="hidden sm:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.deckBuilder')}
				</a>
			</div>
		</div>
	</div>

	<!-- Hero Banner -->
	<section class="relative overflow-hidden border-b border-[#c8aa6e]/10">
		{#if character?.image_url}
			<div class="absolute inset-0">
				<img src={getImageUrl(character.image_url, 800)} alt={guide.name} class="w-full h-full object-cover object-top opacity-20 scale-110" decoding="async" />
			</div>
		{/if}
		<div class="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/85 to-[#0a0a0f]/60"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>

		<div class="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
			<div class="flex flex-col sm:flex-row items-start gap-6 sm:gap-10">
				{#if character?.image_url}
					<div class="w-28 h-28 sm:w-36 sm:h-36 overflow-hidden border-2 border-[#c8aa6e]/30 shrink-0 shadow-lg shadow-black/50">
						<img src={getImageUrl(character.image_url, 300)} alt={guide.name} class="w-full h-full object-cover object-top" decoding="async" />
					</div>
				{/if}
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-3 mb-3">
						<span class="px-2 py-0.5 bg-[#c8aa6e]/15 border border-[#c8aa6e]/30 text-[#c8aa6e] text-[9px] font-bold uppercase tracking-[2px]">{$t('sts2.guidePage.guide')}</span>
						<span class="text-[10px] text-gray-500 uppercase tracking-widest font-medium">{character?.starting_hp || '?'} {$t('sts2.hp')} · {character?.max_energy || '?'} {$t('sts2.energy')}{character?.orb_slots ? ` · ${character.orb_slots} ${$t('sts2.buildPage.orbs')}` : ''}</span>
					</div>
					<h1 class="text-2xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#c8aa6e] via-[#f1ede3] to-[#c8aa6e]">{guide.name}</h1>
					<p class="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl mb-4 sm:mb-5">{$t(`sts2.guideData.${data.slug}.overview`)}</p>
					<div class="flex items-center gap-2 text-xs text-gray-500">
						<span class="text-gray-400 font-medium">{$t('sts2.guidePage.startingRelic')}:</span> {$t(`sts2.guideData.${data.slug}.startingRelic`)}
					</div>
				</div>
			</div>
		</div>
	</section>

	<div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
		<!-- Strengths & Weaknesses -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#c8aa6e]/10 border border-[#c8aa6e]/10 mb-10 sm:mb-14">
			<div class="relative p-4 sm:p-6 bg-[#161620] overflow-hidden">
				{#if character?.image_url}
					<div class="absolute right-0 top-0 w-32 sm:w-40 h-full pointer-events-none opacity-[0.07]">
						<img src={getImageUrl(character.image_url, 300)} alt="Image" class="w-full h-full object-cover object-top" loading="lazy" decoding="async" />
						<div class="absolute inset-0 bg-gradient-to-r from-[#161620] via-transparent to-transparent"></div>
					</div>
				{/if}
				<h3 class="relative text-[10px] uppercase tracking-[3px] text-green-400 font-bold mb-4 pb-2 border-b border-green-500/20">{$t('sts2.guidePage.strengths')}</h3>
				<ul class="relative space-y-2.5">
					{#each guide.strengths as s, si}
						<li class="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed">
							<span class="text-green-400 shrink-0 mt-0.5 text-xs">+</span>
							{$t(`sts2.guideData.${data.slug}.strengths.${si}`)}
						</li>
					{/each}
				</ul>
			</div>
			<div class="relative p-4 sm:p-6 bg-[#161620] overflow-hidden">
				{#if guide.weaknessImage}
					<div class="absolute right-0 top-0 w-32 sm:w-40 h-full pointer-events-none opacity-[0.07]">
						<img src={getImageUrl(guide.weaknessImage, 300)} alt="Image" class="w-full h-full object-cover object-top" loading="lazy" decoding="async" />
						<div class="absolute inset-0 bg-gradient-to-r from-[#161620] via-transparent to-transparent"></div>
					</div>
				{/if}
				<h3 class="relative text-[10px] uppercase tracking-[3px] text-red-400 font-bold mb-4 pb-2 border-b border-red-500/20">{$t('sts2.guidePage.weaknesses')}</h3>
				<ul class="relative space-y-2.5">
					{#each guide.weaknesses as w, wi}
						<li class="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed">
							<span class="text-red-400 shrink-0 mt-0.5 text-xs">-</span>
							{$t(`sts2.guideData.${data.slug}.weaknesses.${wi}`)}
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Build Navigation -->
		<div class="mb-10 sm:mb-14 border-b border-[#c8aa6e]/10 pb-4 sm:pb-6">
			<div class="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
				{#each guide.builds as build, i}
					<a href="#build-{i}" class="group flex items-center gap-2 pb-2 border-b-2 border-transparent hover:border-[#c8aa6e]/60 transition-all shrink-0">
						<span class="text-[10px] font-bold tracking-widest text-gray-600 group-hover:text-[#c8aa6e]/80 transition-colors">0{i + 1}</span>
						<span class="text-xs sm:text-sm font-bold text-gray-400 group-hover:text-white transition-colors tracking-wider">{$t(`sts2.guideData.${data.slug}.builds.${i}.name`)}</span>
					</a>
				{/each}
				{#if guide.bossMatchups?.length}
					<div class="w-px h-5 bg-[#c8aa6e]/10 shrink-0"></div>
					<a href="#boss-matchups" class="group flex items-center gap-1.5 pb-2 border-b-2 border-transparent hover:border-[#c8aa6e]/60 transition-all shrink-0">
						<span class="text-xs sm:text-sm font-bold text-gray-500 group-hover:text-white transition-colors tracking-wider">{$t('sts2.guidePage.bosses')}</span>
					</a>
				{/if}
				{#if guide.draftPriority?.length}
					<a href="#draft-priority" class="group flex items-center gap-1.5 pb-2 border-b-2 border-transparent hover:border-[#c8aa6e]/60 transition-all shrink-0">
						<span class="text-xs sm:text-sm font-bold text-gray-500 group-hover:text-white transition-colors tracking-wider">{$t('sts2.guidePage.draft')}</span>
					</a>
				{/if}
				{#if guide.ascensionTips?.length}
					<a href="#ascension-tips" class="group flex items-center gap-1.5 pb-2 border-b-2 border-transparent hover:border-[#c8aa6e]/60 transition-all shrink-0">
						<span class="text-xs sm:text-sm font-bold text-gray-500 group-hover:text-white transition-colors tracking-wider">{$t('sts2.guidePage.ascension')}</span>
					</a>
				{/if}
			</div>
		</div>

		<!-- Builds -->
		{#each guide.builds as build, i}
			<section id="build-{i}" class="mb-20 scroll-mt-20">
				<!-- Build Header -->
				<div class="flex items-center justify-between mb-2 pb-4 border-b border-[#c8aa6e]/10">
					<div class="flex items-center gap-4">
						<span class="text-2xl sm:text-4xl md:text-5xl font-bold text-white/5">0{i + 1}</span>
						<div>
							<h2 class="text-xl md:text-2xl font-bold text-white tracking-wider">{$t(`sts2.guideData.${data.slug}.builds.${i}.name`)}</h2>
							<p class="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">{$t(`sts2.guideData.${data.slug}.builds.${i}.desc`)}</p>
						</div>
					</div>
					<button
						on:click={() => importBuild(build)}
						class="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-[#c8aa6e]/30 hover:border-[#c8aa6e] hover:bg-[#c8aa6e]/5 text-[#c8aa6e] text-xs font-bold tracking-wider transition-all shrink-0"
					>
						<span>{$t('sts2.decksPage.openInBuilder')}</span>
						<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
					</button>
				</div>

				<!-- Mobile deck builder button -->
				<button
					on:click={() => importBuild(build)}
					class="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-6 border border-[#c8aa6e]/30 text-[#c8aa6e] text-xs font-bold tracking-wider transition-all"
				>
					{$t('sts2.decksPage.openInBuilder')} →
				</button>

				<!-- Key Cards grouped by priority -->
				{#each groupByPriority(build.keyCards) as group}
					<div class="mb-8">
						<h4 class="text-[10px] uppercase tracking-[3px] font-bold text-gray-500 mb-4">{group.cardsLabel}</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#c8aa6e]/5">
							{#each group.cards as entry}
								{@const card = findCard(entry.id)}
								{#if card}
									{@const typeStyle = CARD_TYPE_COLORS[card.type] || CARD_TYPE_COLORS.Attack}
									<div
									class="group relative flex items-start gap-4 p-4 bg-[#161620] hover:bg-[#1d1d29] transition-colors cursor-default"
									on:mouseenter={(e) => showCardHover(card, e)}
									on:mousemove={(e) => updateHoverPosition(e)}
									on:mouseleave={hideCardHover}
								>
										<!-- Card Image -->
										<div class="w-16 h-16 sm:w-20 sm:h-20 overflow-hidden shrink-0 border border-[#c8aa6e]/15">
											{#if card.image_url}
												<img src={getImageUrl(card.image_url, 240)} alt={card.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
											{:else}
												<div class="w-full h-full bg-gray-900 flex items-center justify-center text-xs text-gray-600">{card.type[0]}</div>
											{/if}
										</div>
										<!-- Card Info -->
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2 flex-wrap mb-1">
												<h5 class="text-sm font-bold text-white group-hover:text-[#c8aa6e] transition-colors">{card.name}</h5>
												<span class="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border {PRIORITY_LABELS[entry.priority || 'core']?.badge || PRIORITY_LABELS.core.badge}">{PRIORITY_LABELS[entry.priority || 'core']?.label || $t('sts2.guidePage.core')}</span>
											</div>
											<div class="flex items-center gap-1.5 text-[10px] mb-2">
												<span class="{typeStyle.text} uppercase font-bold tracking-wider">{card.type}</span>
												<span class="text-gray-700">·</span>
												<span class="text-gray-500">{card.rarity}</span>
												<span class="text-gray-700">·</span>
												<span class="text-gray-500">{costDisplay(card)} {$t('sts2.guidePage.energy')}</span>
												{#if card.damage}
													<span class="text-gray-700">·</span>
													<span class="text-red-400/80">{card.damage}{card.hit_count > 1 ? `×${card.hit_count}` : ''} {$t('sts2.dmg')}</span>
												{/if}
												{#if card.block}
													<span class="text-gray-700">·</span>
													<span class="text-blue-400/80">{card.block} {$t('sts2.blk')}</span>
												{/if}
											</div>
											<p class="text-xs text-gray-400 leading-relaxed">{$t(`sts2.guideData.${data.slug}.builds.${i}.cardNotes.${entry._origIdx}`)}</p>
										</div>
										<!-- Hover accent -->
										<div class="absolute bottom-0 left-0 w-full h-px bg-[#c8aa6e] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/each}

				<!-- Defining Relics -->
				{#if build.keyRelics?.length}
					<div class="mb-8">
						<h4 class="text-[10px] uppercase tracking-[3px] font-bold text-gray-500 mb-4">{$t('sts2.guidePage.keyRelics')}</h4>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#c8aa6e]/5">
							{#each build.keyRelics as entry, k}
							{@const relic = findRelic(entry.id)}
							{#if relic}
								<div class="group relative flex items-center gap-3 p-4 bg-[#161620] hover:bg-[#1d1d29] transition-colors">
									{#if relic.image_url}
										<div class="w-12 h-12 overflow-hidden shrink-0 border border-[#c8aa6e]/15">
											<img src={getImageUrl(relic.image_url, 120)} alt={relic.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
										</div>
									{/if}
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 mb-0.5">
											<span class="text-sm font-bold text-white group-hover:text-[#c8aa6e] transition-colors">{relic.name}</span>
											<span class="text-[9px] text-gray-600 capitalize tracking-wider">{relic.rarity}</span>
										</div>
										<p class="text-xs text-gray-400 leading-relaxed">{$t(`sts2.guideData.${data.slug}.builds.${i}.relicNotes.${k}`)}</p>
									</div>
										<div class="absolute bottom-0 left-0 w-full h-px bg-[#c8aa6e] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</section>
		{/each}

		<!-- Boss Matchups -->
		{#if guide.bossMatchups?.length}
			<section id="boss-matchups" class="mb-14 sm:mb-20 scroll-mt-20">
				<div class="flex items-center gap-3 mb-6 pb-3 border-b border-[#c8aa6e]/10">
					<svg class="w-5 h-5 text-[#c8aa6e]/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
					<h2 class="text-base sm:text-lg font-bold text-white tracking-wider uppercase">{$t('sts2.guidePage.bossMatchups')}</h2>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#c8aa6e]/5">
				{#each guide.bossMatchups as matchup, mi}
					{@const diffBadge = matchup.difficulty === 'easy' ? 'text-green-400 bg-green-500/10 border-green-500/25' : matchup.difficulty === 'hard' ? 'text-red-400 bg-red-500/10 border-red-500/25' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25'}
					{@const bossImg = bossImage(matchup.boss)}
					{@const slug = bossSlug(matchup.boss)}
					<a href={slug ? `/guides/bosses/${slug}` : '/guides/bosses'} class="group relative flex items-start gap-4 p-4 sm:p-5 bg-[#161620] hover:bg-[#1d1d29] transition-colors">
						{#if bossImg}
							<div class="w-16 h-16 sm:w-20 sm:h-20 overflow-hidden shrink-0 border border-[#c8aa6e]/15">
								<img src={getImageUrl(bossImg, 240)} alt={matchup.boss} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap mb-1">
								<h4 class="text-sm font-bold text-white group-hover:text-[#c8aa6e] transition-colors">{matchup.boss}</h4>
								<span class="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border {diffBadge}">{$t(`sts2.guideData.difficulty.${matchup.difficulty}`)}</span>
							</div>
							<p class="text-xs text-gray-400 leading-relaxed">{$t(`sts2.guideData.${data.slug}.bossMatchups.${mi}`)}</p>
						</div>
						<div class="hidden sm:flex items-center text-gray-700 group-hover:text-[#c8aa6e] transition-colors">
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
						</div>
						<div class="absolute bottom-0 left-0 w-full h-px bg-[#c8aa6e] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
					</a>
				{/each}
				</div>
			</section>
		{/if}

		<!-- Draft Priority -->
		{#if guide.draftPriority?.length}
		<section id="draft-priority" class="mb-14 sm:mb-20 scroll-mt-20">
				<div class="flex items-center gap-3 mb-6 pb-3 border-b border-[#c8aa6e]/10">
					<svg class="w-5 h-5 text-[#c8aa6e]/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>
					<h2 class="text-base sm:text-lg font-bold text-white tracking-wider uppercase">{$t('sts2.guidePage.draftPriority')}</h2>
				</div>
				{#each guide.draftPriority as phase, di}
					{@const draftCards = parseDraftCards(phase.cards)}
					<div class="mb-8">
						<div class="flex items-center gap-4 mb-4">
							<span class="text-2xl sm:text-4xl md:text-5xl font-bold text-white/5">0{di + 1}</span>
							<div>
								<span class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#c8aa6e]/10 text-[#c8aa6e] border border-[#c8aa6e]/25">{$t(`sts2.guideData.${data.slug}.draftPriority.${di}.phase`)}</span>
								<p class="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-2xl">{$t(`sts2.guideData.${data.slug}.draftPriority.${di}.note`)}</p>
							</div>
						</div>
						{#if draftCards.length}
							<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-[#c8aa6e]/5">
								{#each draftCards as cardName}
									{@const card = findCardByName(cardName)}
									{#if card}
										<div
											class="group/card relative flex flex-col items-center p-3 bg-[#161620] hover:bg-[#1d1d29] transition-colors cursor-default"
											on:mouseenter={(e) => showCardHover(card, e)}
											on:mousemove={(e) => updateHoverPosition(e)}
											on:mouseleave={hideCardHover}
											role="img"
											aria-label={card.name}
										>
											{#if card.image_url}
												<div class="w-14 h-14 sm:w-16 sm:h-16 overflow-hidden shrink-0 border border-[#c8aa6e]/15 mb-2">
													<img src={getImageUrl(card.image_url, 200)} alt={card.name} class="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
												</div>
											{/if}
											<span class="text-[10px] sm:text-xs font-medium text-gray-400 group-hover/card:text-[#c8aa6e] transition-colors text-center leading-tight">{card.name}</span>
											<div class="absolute bottom-0 left-0 w-full h-px bg-[#c8aa6e] transform scale-x-0 group-hover/card:scale-x-100 transition-transform duration-300 origin-left"></div>
										</div>
									{:else}
										<div class="flex flex-col items-center justify-center p-3 bg-[#161620]">
											<div class="w-14 h-14 sm:w-16 sm:h-16 bg-gray-900 border border-[#c8aa6e]/10 mb-2 flex items-center justify-center">
												<span class="text-xs text-gray-700">?</span>
											</div>
											<span class="text-[10px] text-gray-600 text-center leading-tight">{cardName}</span>
										</div>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</section>
		{/if}

		<!-- Ascension Tips -->
		{#if guide.ascensionTips?.length}
			<section id="ascension-tips" class="mb-14 sm:mb-20 scroll-mt-20">
				<div class="flex items-center gap-3 mb-6 pb-3 border-b border-[#c8aa6e]/10">
					<svg class="w-5 h-5 text-[#c8aa6e]/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
					<h2 class="text-base sm:text-lg font-bold text-white tracking-wider uppercase">{$t('sts2.guidePage.ascensionTips')}</h2>
				</div>
				<div class="grid grid-cols-1 gap-px bg-[#c8aa6e]/5">
					{#each guide.ascensionTips as tip, ai}
					<div class="group relative bg-[#161620] hover:bg-[#1d1d29] transition-colors">
						<div class="flex items-start gap-4 p-4 sm:p-5">
							<span class="w-7 h-7 shrink-0 flex items-center justify-center text-[10px] font-bold text-[#c8aa6e]/80 bg-[#c8aa6e]/5 border border-[#c8aa6e]/15">{ai + 1}</span>
							<div class="flex-1 min-w-0">
								<p class="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">{$t(`sts2.guideData.${data.slug}.ascensionTips.${ai}`)}</p>
								{#if tip.cards?.length || tip.relics?.length}
									<div class="flex flex-wrap gap-2">
										{#each (tip.relics || []) as relicId}
											{@const relic = findRelic(relicId)}
											{#if relic?.image_url}
												<div class="group/item relative flex items-center gap-1.5 px-1.5 py-1 bg-[#111118] border border-[#c8aa6e]/10 hover:border-[#c8aa6e]/30 transition-all cursor-default">
													<div class="w-7 h-7 overflow-hidden shrink-0">
														<img src={getImageUrl(relic.image_url, 56)} alt={relic.name} class="w-full h-full object-contain" loading="lazy" decoding="async" />
													</div>
													<span class="text-[10px] text-gray-500 group-hover/item:text-[#c8aa6e] transition-colors whitespace-nowrap">{relic.name}</span>
												</div>
											{/if}
										{/each}
										{#each (tip.cards || []) as cardId}
											{@const card = findCard(cardId)}
											{#if card}
												<div
													class="group/item relative flex items-center gap-1.5 px-1.5 py-1 bg-[#111118] border border-[#c8aa6e]/10 hover:border-[#c8aa6e]/30 transition-all cursor-default"
													on:mouseenter={(e) => showCardHover(card, e)}
													on:mousemove={(e) => updateHoverPosition(e)}
													on:mouseleave={hideCardHover}
													role="img"
													aria-label={card.name}
												>
													{#if card.image_url}
														<div class="w-7 h-7 overflow-hidden shrink-0">
															<img src={getImageUrl(card.image_url, 56)} alt={card.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
														</div>
													{/if}
													<span class="text-[10px] text-gray-500 group-hover/item:text-[#c8aa6e] transition-colors whitespace-nowrap">{card.name}</span>
												</div>
											{/if}
										{/each}
									</div>
								{/if}
							</div>
						</div>
						<div class="absolute bottom-0 left-0 w-full h-px bg-[#c8aa6e] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
					</div>
				{/each}
				</div>
			</section>
		{/if}

		<!-- Navigation -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-10 border-t border-[#c8aa6e]/10">
			<a href="/guides" class="text-sm text-gray-500 hover:text-[#c8aa6e] transition-colors font-medium tracking-wider">← {$t('sts2.allGuides')}</a>
			<div class="flex flex-wrap gap-2 sm:gap-3">
				<a href="/guides/bosses" class="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] font-bold tracking-wider transition-all">
					Boss Guide
				</a>
				<a href="/synergies" class="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] font-bold tracking-wider transition-all">
					{$t('sts2.synergyExplorer')}
				</a>
				<a href="/tier-list" class="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 border border-[#c8aa6e]/30 hover:border-[#c8aa6e] hover:bg-[#c8aa6e]/5 text-[#c8aa6e] text-xs font-bold tracking-wider transition-all">
					{$t('sts2.tierList')} →
				</a>
			</div>
		</div>
	</div>

	<!-- Bottom spacer for mobile nav -->
	<div class="h-16 sm:hidden"></div>
</div>

<MobileNav />

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
