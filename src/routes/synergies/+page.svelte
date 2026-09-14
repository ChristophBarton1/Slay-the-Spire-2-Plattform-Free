<script>
	import { CHARACTER_THEMES, CARD_TYPE_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { parseDescription } from '$lib/sts2/utils/cardFilters';
	import { findSynergies } from '$lib/sts2/utils/cardSynergies';
	import { CHARACTER_GUIDES } from '$lib/sts2/data/guides';
	import { showCardHover, updateHoverPosition, hideCardHover } from '$lib/sts2/stores/cardHoverStore';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t } from 'svelte-i18n';
	import { addCard, deck, selectedCharacter as deckCharacter } from '$lib/sts2/stores/deckStore';
	import { getContext, onMount } from 'svelte';

	export let data;

	const localizedCards = getContext('localizedCards');

	$: allCards = $localizedCards || data.cards || [];
	$: characters = data.characters || [];

	let selectedChar = 'ironclad';
	let searchQuery = '';
	let selectedCard = null;
	let searchInput;

	$: theme = CHARACTER_THEMES[selectedChar] || CHARACTER_THEMES.ironclad;

	// Filter cards for the selected character + colorless, exclude curses/statuses
	$: charCards = allCards.filter(c =>
		(c.color === selectedChar || c.color === 'colorless') &&
		c.type !== 'Curse' && c.type !== 'Status' && c.type !== 'Quest'
	);

	// Search results — matches name, keywords, and description
	$: filteredCards = searchQuery.length >= 1
		? charCards.filter(c => {
			const q = searchQuery.toLowerCase();
			if (c.name.toLowerCase().includes(q)) return true;
			if ((c.keywords || []).some(k => k.toLowerCase().includes(q))) return true;
			if ((c.description || '').toLowerCase().includes(q)) return true;
			return false;
		}).slice(0, 50)
		: [];

	function findCard(id) {
		return allCards.find(c => c.id === id);
	}

	// ── Synergies, tiered by strength (ranking beats taxonomy) ──
	$: synergies = selectedCard ? findSynergies(selectedCard, allCards) : [];
	$: totalSynergies = synergies.length;
	$: bestReason = (s) => s.reasons.slice().sort((a, b) => b.score - a.score)[0];
	$: perfectTier = synergies.filter(s => s.reasons.some(r => r.score >= 3));
	$: strongTier = synergies.filter(s => !s.reasons.some(r => r.score >= 3) && s.score >= 2);
	$: goodTier = synergies.filter(s => !s.reasons.some(r => r.score >= 3) && s.score < 2);

	let showAllGood = false;
	$: if (selectedCard) showAllGood = false;
	$: visibleGood = showAllGood ? goodTier : goodTier.slice(0, 6);

	// ── Explorer trail: hopping between cards keeps a clickable history ──
	let trail = [];

	function selectCard(card) {
		if (selectedCard && selectedCard.id !== card.id) {
			if (!trail.length || trail[trail.length - 1].id !== selectedCard.id) {
				trail = [...trail, selectedCard].slice(-6);
			}
		}
		selectedCard = card;
		searchQuery = '';
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function jumpToTrail(i) {
		const card = trail[i];
		trail = trail.slice(0, i);
		selectedCard = card;
	}

	function clearSelection() {
		selectedCard = null;
		searchQuery = '';
		trail = [];
		showAllCards = false;
	}

	// Full card pool browser (empty state): collapsed by default, grouped by type
	let showAllCards = false;
	const TYPE_ORDER = ['Attack', 'Skill', 'Power'];
	$: cardsByType = TYPE_ORDER.map(type => ({
		type,
		cards: charCards.filter(c => c.type === type).sort((a, b) => a.name.localeCompare(b.name))
	})).filter(g => g.cards.length > 0);

	// ── Archetype quick-starts: each guide build → its core card ──
	$: archetypes = (CHARACTER_GUIDES[selectedChar]?.builds || []).map((b, i) => {
		const core = (b.keyCards || []).find(k => k.priority === 'core') || (b.keyCards || [])[0];
		return { index: i, name: b.name, card: core ? findCard(core.id) : null };
	}).filter(a => a.card);

	$: costDisplay = (card) => card?.is_x_cost ? 'X' : (card?.star_cost != null ? `★${card.star_cost}` : card?.cost ?? '?');

	let addedCards = new Set();
	function handleAddCard(card) {
		addCard(card);
		addedCards = new Set([...addedCards, card.id]);
		setTimeout(() => {
			addedCards.delete(card.id);
			addedCards = new Set(addedCards);
		}, 1500);
	}

	// Auto-sync character from deck store when arriving from builder + `/` search hotkey
	onMount(() => {
		if ($deckCharacter && $deck.length > 0) {
			selectedChar = $deckCharacter.id.toLowerCase();
		}
		const onKey = (e) => {
			if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
				e.preventDefault();
				searchInput?.focus();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	// Deck synergy analysis
	$: deckCards = $deck.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i); // unique cards
	$: deckSynergies = deckCards.length >= 2
		? deckCards.flatMap(card => {
			const syns = findSynergies(card, deckCards);
			return syns.map(s => ({ source: card, ...s }));
		}).reduce((acc, s) => {
			const key = [s.source.id, s.card.id].sort().join('|');
			if (!acc.has(key)) acc.set(key, { ...s, key });
			return acc;
		}, new Map())
		: new Map();
	$: deckSynergyList = [...deckSynergies.values()].slice(0, 12);

	$: popularCards = charCards
		.filter(c => c.color === selectedChar && (c.rarity === 'Rare' || c.rarity === 'Uncommon'))
		.sort((a, b) => (b.keywords?.length || 0) + (b.powers_applied?.length || 0) - (a.keywords?.length || 0) - (a.powers_applied?.length || 0))
		.slice(0, 8);

	// Deck recommendations: external cards with most synergies to the current deck
	$: deckCardIds = new Set($deck.map(c => c.id));
	$: deckRecommendations = deckCards.length >= 2
		? charCards
			.filter(c => !deckCardIds.has(c.id))
			.map(c => {
				const syns = findSynergies(c, deckCards);
				return { card: c, synCount: syns.length, topSyn: syns[0] };
			})
			.filter(r => r.synCount > 0)
			.sort((a, b) => b.synCount - a.synCount)
			.slice(0, 8)
		: [];

	const TYPE_ACCENT = {
		Attack: '#fb7185',
		Skill: '#38bdf8',
		Power: '#c8aa6e',
		Status: '#9ca3af',
		Curse: '#a78bfa',
	};
</script>

<svelte:head>
	<title>{$t('sts2.seo.synergiesTitle')}</title>
	<meta name="description" content={$t('sts2.seo.synergiesDesc')}>
	<meta name="keywords" content={$t('sts2.seo.synergiesKeywords')}>
	<link rel="canonical" href="https://STS2_DOMAIN/synergies">
	<meta property="og:title" content={$t('sts2.seo.synergiesTitle')}>
	<meta property="og:description" content={$t('sts2.seo.synergiesDesc')}>
	<meta property="og:type" content="website">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:url" content="https://STS2_DOMAIN/synergies">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={$t('sts2.seo.synergiesTitle')}>
	<meta name="twitter:description" content={$t('sts2.seo.synergiesDesc')}>
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ggez.gg" },
			{ "@type": "ListItem", "position": 2, "name": "Slay the Spire 2", "item": "https://STS2_DOMAIN" },
			{ "@type": "ListItem", "position": 3, "name": "Synergies", "item": "https://STS2_DOMAIN/synergies" }
		]
	})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "Slay the Spire 2 Synergy Finder",
		"url": "https://STS2_DOMAIN/synergies",
		"applicationCategory": "GameApplication",
		"operatingSystem": "All",
		"description": "Free interactive tool to discover card synergies in Slay the Spire 2. Pick any card and instantly see which other cards combo with it.",
		"offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
		"isAccessibleForFree": true
	})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": [
			{
				"@type": "Question",
				"name": "How does the Slay the Spire 2 synergy finder work?",
				"acceptedAnswer": { "@type": "Answer", "text": "Select any card from the four characters (Ironclad, Silent, Defect, Watcher) or colorless pool. The tool scans every other card and ranks combos by how well their effects, keywords, and tags interact." }
			},
			{
				"@type": "Question",
				"name": "Is the synergy data up to date with the latest patch?",
				"acceptedAnswer": { "@type": "Answer", "text": "Yes. Card data is pulled from the live game files and rebuilt on every patch. Card icons and descriptions match the in-game versions exactly." }
			},
			{
				"@type": "Question",
				"name": "Can I build a deck while exploring synergies?",
				"acceptedAnswer": { "@type": "Answer", "text": "Yes. Every card in the synergy results has an Add button that drops it into the deck builder, so you can prototype runs as you discover combos." }
			}
		]
	})}</script>`}
</svelte:head>

<div class="sts2-shell relative z-10 min-h-screen">
	<!-- Breadcrumb -->
	<div class="sticky top-11 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[rgba(200,170,110,0.10)]">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
			<a href="/" class="text-sm font-extrabold text-[#c8aa6e] hover:text-[#e6c98a] transition-colors tracking-wide shrink-0 hidden sm:inline">GGEZ.GG</a>
			<span class="text-[#7c828f] shrink-0 hidden sm:inline">/</span>
			<a href="/" class="text-sm text-[#b9bcc6] hover:text-[#c8aa6e] transition-colors shrink-0">StS2</a>
			<span class="text-[#7c828f] shrink-0">/</span>
			<span class="text-sm font-bold text-[#f1ede3] shrink-0">{$t('sts2.synergies')}</span>

			<div class="ml-auto flex items-center gap-2 shrink-0">
				<a href="/game-database" class="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-xs text-[#b9bcc6] hover:text-[#f1ede3] transition-all font-medium">
					{$t('sts2.nav.cards')}
				</a>
				<a href="/decks" class="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-xs text-[#b9bcc6] hover:text-[#f1ede3] transition-all font-medium">
					{$t('sts2.nav.decks')}
				</a>
				<a href="/guides" class="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-xs text-[#b9bcc6] hover:text-[#f1ede3] transition-all font-medium">
					{$t('sts2.guides')}
				</a>
				<a href="/tier-list" class="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-xs text-[#b9bcc6] hover:text-[#f1ede3] transition-all font-medium">
					{$t('sts2.tierList')}
				</a>
			</div>
		</div>
	</div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
		<!-- Header -->
		<div class="mb-6 flex items-end justify-between gap-4">
			<div>
				<h1 class="font-display text-4xl md:text-5xl font-bold text-[#f1ede3] tracking-tight mb-2">
					{$t('sts2.synergyExplorer')}
				</h1>
				<p class="text-[#b9bcc6] text-base max-w-2xl leading-relaxed">{$t('sts2.synergyDesc')}</p>
			</div>
			<span class="hidden lg:inline-flex items-center gap-1.5 shrink-0 text-[10px] text-[#7c828f] pb-1">
				<kbd class="px-1.5 py-0.5 rounded border border-[rgba(200,170,110,0.2)] bg-[#14141c] font-mono text-[#b9bcc6]">/</kbd>
				{$t('sts2.synergyPage.pressSlash')}
			</span>
		</div>

		<!-- Controls: character + search -->
		<div class="flex gap-2 mb-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide">
			{#each characters as char}
				{@const charTheme = CHARACTER_THEMES[char.id.toLowerCase()]}
				{@const isActive = selectedChar === char.id.toLowerCase()}
				<button
					on:click={() => { selectedChar = char.id.toLowerCase(); clearSelection(); }}
					class="char-chip group flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-lg border transition-all duration-200 shrink-0 {isActive ? 'active' : 'border-[rgba(200,170,110,0.12)] hover:border-[#c8aa6e]/35 opacity-60 hover:opacity-90'}"
					style="--gc: {charTheme?.color}"
				>
					{#if char.image_url}
						<img src={getImageUrl(char.image_url, 40)} alt={char.name} class="w-6 h-6 sm:w-7 sm:h-7 rounded object-cover object-top" loading="lazy" decoding="async" />
					{/if}
					<span class="text-xs sm:text-sm font-bold {isActive ? '' : 'text-[#b9bcc6]'}">{char.name}</span>
				</button>
			{/each}
		</div>

		<div class="relative mb-6">
			<div class="search-wrap relative rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.14)]" style="--accent: {theme.color}">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c8aa6e]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					bind:this={searchInput}
					placeholder={$t('sts2.synergyPage.searchCard')}
					class="w-full pl-12 pr-4 py-3 bg-transparent border-none text-white text-sm sm:text-base placeholder-gray-600 focus:outline-none transition-colors"
					style="caret-color: {theme.color}"
				/>
				{#if selectedCard}
					<button
						on:click={clearSelection}
						class="absolute right-4 top-1/2 -translate-y-1/2 text-[#7c828f] hover:text-[#f1ede3] transition-colors text-sm"
					>
						{$t('sts2.synergyPage.clearSelection')}
					</button>
				{/if}
			</div>

			<!-- Search Dropdown -->
			{#if filteredCards.length > 0 && !selectedCard}
				<div class="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.20)] shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
					{#each filteredCards as card}
						{@const typeStyle = CARD_TYPE_COLORS[card.type] || CARD_TYPE_COLORS.Attack}
						<button
							on:click={() => selectCard(card)}
							class="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#c8aa6e]/5 transition-colors text-left border-b border-[rgba(200,170,110,0.06)] last:border-0"
						>
							<div class="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
								{#if card.image_url}
									<img src={getImageUrl(card.image_url, 120)} alt={card.name} class="w-full h-full object-cover" decoding="async" />
								{:else}
									<div class="w-full h-full bg-gray-900 flex items-center justify-center text-xs text-gray-600">{card.type[0]}</div>
								{/if}
							</div>
							<div class="flex-1 min-w-0">
								<span class="text-sm font-semibold text-white">{card.name}</span>
								<div class="flex items-center gap-1.5 text-xs">
									<span class="{typeStyle.text} uppercase">{card.type}</span>
									<span class="text-gray-600">·</span>
									<span class="text-gray-500">{card.rarity}</span>
									<span class="text-gray-600">·</span>
									<span class="text-gray-500">{$t('sts2.cost')} {costDisplay(card)}</span>
								</div>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		{#if selectedCard}
			{@const typeStyle = CARD_TYPE_COLORS[selectedCard.type] || CARD_TYPE_COLORS.Attack}
			{@const typeAccent = TYPE_ACCENT[selectedCard.type] || '#c8aa6e'}

			<!-- Explorer trail -->
			{#if trail.length > 0}
				<div class="flex items-center gap-1.5 mb-5 flex-wrap">
					<span class="text-[10px] uppercase tracking-[2px] font-bold text-[#7c828f] mr-1">{$t('sts2.synergyPage.trail')}</span>
					{#each trail as tc, i}
						<button
							on:click={() => jumpToTrail(i)}
							class="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-[#14141c] border border-[rgba(200,170,110,0.14)] hover:border-[#c8aa6e]/45 transition-colors group"
						>
							{#if tc.image_url}
								<img src={getImageUrl(tc.image_url, 40)} alt="" class="w-5 h-5 rounded-full object-cover" loading="lazy" decoding="async" />
							{/if}
							<span class="text-[11px] font-bold text-[#b9bcc6] group-hover:text-[#f1ede3] transition-colors">{tc.name}</span>
						</button>
						<svg class="w-3 h-3 text-[#7c828f]/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
					{/each}
					<span class="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-[#c8aa6e]/10 border border-[#c8aa6e]/35">
						{#if selectedCard.image_url}
							<img src={getImageUrl(selectedCard.image_url, 40)} alt="" class="w-5 h-5 rounded-full object-cover" loading="lazy" decoding="async" />
						{/if}
						<span class="text-[11px] font-bold text-[#e6c98a]">{selectedCard.name}</span>
					</span>
				</div>
			{/if}

			<!-- App layout: sticky card rail left, ranked results right -->
			<div class="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-5 items-start mb-10">
				<!-- LEFT: selected card panel -->
				<div class="lg:sticky lg:top-28 rounded-xl overflow-hidden bg-[#0e0e15] border" style="border-color: {typeAccent}30">
					<div
						role="presentation"
						class="relative h-48 overflow-hidden cursor-default"
						on:mouseenter={(e) => showCardHover(selectedCard, e)}
						on:mousemove={(e) => updateHoverPosition(e)}
						on:mouseleave={hideCardHover}
					>
						{#if selectedCard.image_url}
							<img src={getImageUrl(selectedCard.image_url, 500)} alt={selectedCard.name} class="absolute inset-0 w-full h-full object-cover object-top" decoding="async" />
						{:else}
							<div class="absolute inset-0 bg-gray-900 flex items-center justify-center text-sm text-gray-600">{selectedCard.type}</div>
						{/if}
						<div class="absolute inset-0 bg-gradient-to-t from-[#0e0e15] via-[#0e0e15]/20 to-transparent"></div>
						<span class="absolute top-3 right-3 {typeStyle.bg} {typeStyle.text} border {typeStyle.border} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">{selectedCard.type}</span>
					</div>
					<div class="p-4 -mt-8 relative">
						<h2 class="font-display text-2xl font-bold text-[#f1ede3] leading-tight mb-1.5">{selectedCard.name}</h2>
						<div class="flex flex-wrap items-center gap-2 mb-3 text-xs">
							<span class="text-[#7c828f]">{selectedCard.rarity}</span>
							<span class="text-[#7c828f]/50">·</span>
							<span class="font-semibold" style="color: {typeAccent}">{$t('sts2.cost')} {costDisplay(selectedCard)}</span>
							{#if selectedCard.damage}
								<span class="text-[#7c828f]/50">·</span>
								<span class="text-red-400">{$t('sts2.dmg')} {selectedCard.damage}{selectedCard.hit_count > 1 ? `×${selectedCard.hit_count}` : ''}</span>
							{/if}
							{#if selectedCard.block}
								<span class="text-[#7c828f]/50">·</span>
								<span class="text-blue-400">{$t('sts2.blk')} {selectedCard.block}</span>
							{/if}
						</div>
						<p class="text-sm text-[#d5d2c9] leading-relaxed mb-4">{@html parseDescription(selectedCard.description)}</p>
						{#if selectedCard.keywords?.length}
							<div class="flex flex-wrap gap-1.5 mb-4">
								{#each selectedCard.keywords as kw}
									<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#c8aa6e]/5 border border-[rgba(200,170,110,0.15)] text-[#b9bcc6]">{kw}</span>
								{/each}
							</div>
						{/if}
						<button
							on:click={() => handleAddCard(selectedCard)}
							class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-xs font-bold tracking-wider uppercase {addedCards.has(selectedCard.id) ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-[#c8aa6e]/35 hover:border-[#c8aa6e] bg-[#c8aa6e]/10 hover:bg-[#c8aa6e]/15 text-[#c8aa6e]'}"
						>
							{#if addedCards.has(selectedCard.id)}
								<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
								{$t('sts2.synergyPage.addedToDeck')}
							{:else}
								<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
								{$t('sts2.synergyPage.addToDeck')}
							{/if}
						</button>

						<!-- Summary strip -->
						<div class="grid grid-cols-3 gap-px mt-4 rounded-lg overflow-hidden border border-[rgba(200,170,110,0.10)] bg-[rgba(200,170,110,0.10)]">
							<div class="bg-[#14141c] px-2 py-2.5 text-center">
								<div class="text-lg font-bold text-[#f1ede3] tabular-nums leading-none">{totalSynergies}</div>
								<div class="text-[8px] uppercase tracking-[2px] text-[#7c828f] font-bold mt-1">{$t('sts2.synergies')}</div>
							</div>
							<div class="bg-[#14141c] px-2 py-2.5 text-center">
								<div class="text-lg font-bold text-[#e6c98a] tabular-nums leading-none">{perfectTier.length}</div>
								<div class="text-[8px] uppercase tracking-[2px] text-[#7c828f] font-bold mt-1">{$t('sts2.synergyPage.perfect')}</div>
							</div>
							<div class="bg-[#14141c] px-2 py-2.5 text-center">
								<div class="text-lg font-bold text-[#b9bcc6] tabular-nums leading-none">{strongTier.length}</div>
								<div class="text-[8px] uppercase tracking-[2px] text-[#7c828f] font-bold mt-1">{$t('sts2.synergyPage.strong')}</div>
							</div>
						</div>
					</div>
				</div>

				<!-- RIGHT: ranked results -->
				<div class="min-w-0">
					{#if totalSynergies > 0}
						<!-- Tier 1: Perfect combos as pair tiles -->
						{#if perfectTier.length > 0}
							<div class="flex items-center gap-3 mb-4">
								<h3 class="font-display text-xl font-bold text-[#e6c98a]">{$t('sts2.synergyPage.perfectCombos')}</h3>
								<span class="text-xs text-[#7c828f] tabular-nums">{perfectTier.length}</span>
								<div class="flex-1 h-px bg-gradient-to-r from-[#c8aa6e]/30 to-transparent"></div>
							</div>
							<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-8">
								{#each perfectTier as entry}
									{@const reason = bestReason(entry)}
									<div
										role="presentation"
										class="pair-tile group relative rounded-xl bg-[#14141c] border border-[#c8aa6e]/20 p-3.5 cursor-pointer overflow-hidden"
										on:click={() => selectCard(entry.card)}
										on:mouseenter={(e) => showCardHover(entry.card, e)}
										on:mousemove={(e) => updateHoverPosition(e)}
										on:mouseleave={hideCardHover}
									>
										<div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c8aa6e]/60 to-transparent"></div>
										<div class="flex items-center gap-2 mb-3">
											<div class="w-11 h-11 rounded-lg overflow-hidden border border-[rgba(200,170,110,0.25)] shrink-0">
												{#if selectedCard.image_url}
													<img src={getImageUrl(selectedCard.image_url, 90)} alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
												{/if}
											</div>
											<span class="font-display text-base font-bold text-[#c8aa6e] shrink-0">+</span>
											<div class="w-11 h-11 rounded-lg overflow-hidden border border-[rgba(200,170,110,0.25)] shrink-0">
												{#if entry.card.image_url}
													<img src={getImageUrl(entry.card.image_url, 90)} alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
												{:else}
													<div class="w-full h-full bg-gray-900 flex items-center justify-center text-[10px] text-gray-600">{entry.card.type[0]}</div>
												{/if}
											</div>
											<button
												on:click|stopPropagation={() => handleAddCard(entry.card)}
												class="ml-auto w-8 h-8 rounded-lg flex items-center justify-center border transition-all shrink-0 {addedCards.has(entry.card.id) ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-[rgba(200,170,110,0.20)] hover:border-[#c8aa6e]/55 text-[#7c828f] hover:text-[#c8aa6e]'}"
												title={$t('sts2.synergyPage.addToDeck')}
											>
												{#if addedCards.has(entry.card.id)}
													<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
												{:else}
													<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
												{/if}
											</button>
										</div>
										<p class="text-sm font-bold text-[#f1ede3] group-hover:text-[#e6c98a] transition-colors truncate mb-1">{entry.card.name}</p>
										<p class="text-[11px] text-[#9ba0ab] leading-snug line-clamp-2">{reason.reason}</p>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Tier 2: Strong -->
						{#if strongTier.length > 0}
							<div class="flex items-center gap-3 mb-4">
								<h3 class="font-display text-lg font-bold text-[#f1ede3]">{$t('sts2.synergyPage.strongSynergies')}</h3>
								<span class="text-xs text-[#7c828f] tabular-nums">{strongTier.length}</span>
								<div class="flex-1 h-px bg-gradient-to-r from-[rgba(200,170,110,0.15)] to-transparent"></div>
							</div>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
								{#each strongTier as entry}
									{@const reason = bestReason(entry)}
									<div
										role="presentation"
										class="row-tile group relative flex items-center gap-3 p-2.5 rounded-lg bg-[#14141c] border border-[rgba(200,170,110,0.08)] cursor-pointer"
										on:click={() => selectCard(entry.card)}
										on:mouseenter={(e) => showCardHover(entry.card, e)}
										on:mousemove={(e) => updateHoverPosition(e)}
										on:mouseleave={hideCardHover}
									>
										<div class="w-11 h-11 rounded-md overflow-hidden shrink-0 border border-[rgba(200,170,110,0.14)]">
											{#if entry.card.image_url}
												<img src={getImageUrl(entry.card.image_url, 90)} alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
											{:else}
												<div class="w-full h-full bg-gray-900 flex items-center justify-center text-[10px] text-gray-600">{entry.card.type[0]}</div>
											{/if}
										</div>
										<div class="flex-1 min-w-0">
											<p class="text-sm font-bold text-[#f1ede3] group-hover:text-[#e6c98a] transition-colors truncate">{entry.card.name}</p>
											<p class="text-[11px] text-[#9ba0ab] truncate mt-0.5">{reason.reason}</p>
										</div>
										<button
											on:click|stopPropagation={() => handleAddCard(entry.card)}
											class="w-7 h-7 rounded-md flex items-center justify-center border transition-all shrink-0 sm:opacity-0 sm:group-hover:opacity-100 {addedCards.has(entry.card.id) ? 'border-green-500/50 bg-green-500/10 text-green-400 sm:opacity-100' : 'border-[rgba(200,170,110,0.18)] hover:border-[#c8aa6e]/50 text-[#7c828f] hover:text-[#c8aa6e]'}"
											title={$t('sts2.synergyPage.addToDeck')}
										>
											{#if addedCards.has(entry.card.id)}
												<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
											{:else}
												<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
											{/if}
										</button>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Tier 3: everything else, collapsed -->
						{#if goodTier.length > 0}
							<div class="flex items-center gap-3 mb-4">
								<h3 class="font-display text-lg font-bold text-[#9ba0ab]">{$t('sts2.synergyPage.moreSynergies')}</h3>
								<span class="text-xs text-[#7c828f] tabular-nums">{goodTier.length}</span>
								<div class="flex-1 h-px bg-gradient-to-r from-[rgba(200,170,110,0.10)] to-transparent"></div>
							</div>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
								{#each visibleGood as entry}
									{@const reason = bestReason(entry)}
									<div
										role="presentation"
										class="row-tile group relative flex items-center gap-3 px-2.5 py-2 rounded-lg bg-[#101018] border border-[rgba(200,170,110,0.05)] cursor-pointer"
										on:click={() => selectCard(entry.card)}
										on:mouseenter={(e) => showCardHover(entry.card, e)}
										on:mousemove={(e) => updateHoverPosition(e)}
										on:mouseleave={hideCardHover}
									>
										<div class="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-[rgba(200,170,110,0.10)]">
											{#if entry.card.image_url}
												<img src={getImageUrl(entry.card.image_url, 60)} alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
											{:else}
												<div class="w-full h-full bg-gray-900 flex items-center justify-center text-[9px] text-gray-600">{entry.card.type[0]}</div>
											{/if}
										</div>
										<div class="flex-1 min-w-0">
											<p class="text-xs font-bold text-[#d5d2c9] group-hover:text-[#e6c98a] transition-colors truncate">{entry.card.name}</p>
											<p class="text-[10px] text-[#7c828f] truncate">{reason.reason}</p>
										</div>
										<button
											on:click|stopPropagation={() => handleAddCard(entry.card)}
											class="w-6 h-6 rounded flex items-center justify-center border transition-all shrink-0 sm:opacity-0 sm:group-hover:opacity-100 {addedCards.has(entry.card.id) ? 'border-green-500/50 bg-green-500/10 text-green-400 sm:opacity-100' : 'border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-[#7c828f] hover:text-[#c8aa6e]'}"
											title={$t('sts2.synergyPage.addToDeck')}
										>
											{#if addedCards.has(entry.card.id)}
												<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
											{:else}
												<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
											{/if}
										</button>
									</div>
								{/each}
							</div>
							{#if goodTier.length > 6}
								<button
									on:click={() => showAllGood = !showAllGood}
									class="w-full py-2.5 rounded-lg border border-[rgba(200,170,110,0.14)] hover:border-[#c8aa6e]/40 text-xs font-bold text-[#b9bcc6] hover:text-[#f1ede3] transition-all"
								>
									{showAllGood ? $t('sts2.synergyPage.showLess') : `${$t('sts2.synergyPage.showAll')} (${goodTier.length}) ↓`}
								</button>
							{/if}
						{/if}
					{:else}
						<div class="text-center py-16 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.08)]">
							<p class="text-[#b9bcc6] text-base">{$t('sts2.synergyPage.noSynergies')}</p>
							<p class="text-[#7c828f] text-sm mt-1">{$t('sts2.synergyPage.noSynergiesDesc')}</p>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Empty state: archetype quick-starts + popular cards as a visual grid -->
			<div class="py-4">
				<div class="text-center mb-8">
					<h3 class="font-display text-xl sm:text-2xl font-bold text-[#f1ede3] mb-2">{$t('sts2.synergyPage.selectCardPrompt')}</h3>
					<p class="text-sm text-[#7c828f] max-w-md mx-auto leading-relaxed">
						{$t('sts2.synergyPage.selectCardDesc')}
					</p>
				</div>

				{#if archetypes.length > 0}
					<div class="flex items-center justify-center gap-2 mb-10 flex-wrap">
						<span class="text-[10px] uppercase tracking-[2px] font-bold text-[#7c828f] w-full text-center sm:w-auto mb-1 sm:mb-0">{$t('sts2.synergyPage.quickStart')}:</span>
						{#each archetypes as arch}
							<button
								on:click={() => selectCard(arch.card)}
								class="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-[#14141c] border border-[rgba(200,170,110,0.16)] hover:border-[#c8aa6e]/50 transition-all group"
							>
								{#if arch.card.image_url}
									<img src={getImageUrl(arch.card.image_url, 48)} alt="" class="w-6 h-6 rounded-full object-cover" loading="lazy" decoding="async" />
								{/if}
								<span class="text-xs font-bold text-[#b9bcc6] group-hover:text-[#e6c98a] transition-colors">{$t(`sts2.guideData.${selectedChar}.builds.${arch.index}.name`)}</span>
							</button>
						{/each}
					</div>
				{/if}

				<div class="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(200,170,110,0.12)]">
					<p class="text-[10px] uppercase tracking-[3px] font-bold text-[#7c828f]">{$t('sts2.synergyPage.popularCards')}</p>
					<span class="text-[10px] uppercase tracking-widest font-bold" style="color: {theme.color}">{theme.name}</span>
				</div>
				<div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
					{#each popularCards as card}
						<button
							on:click={() => selectCard(card)}
							class="pop-card group relative overflow-hidden rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.10)] text-left"
						>
							<div class="relative aspect-[3/4] overflow-hidden">
								{#if card.image_url}
									<img src={getImageUrl(card.image_url, 200)} alt={card.name} class="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500" loading="lazy" decoding="async" />
								{:else}
									<div class="w-full h-full bg-[#0e0e15] flex items-center justify-center text-xs text-[#7c828f]">{card.type[0]}</div>
								{/if}
								<div class="absolute inset-0 bg-gradient-to-t from-[#14141c] via-transparent to-transparent"></div>
							</div>
							<div class="p-2">
								<p class="text-[11px] font-bold text-[#f1ede3] group-hover:text-[#e6c98a] transition-colors truncate">{card.name}</p>
								<p class="text-[9px] text-[#7c828f] uppercase tracking-wider">{card.type} · {costDisplay(card)}</p>
							</div>
						</button>
					{/each}
				</div>

				<!-- Full card pool: collapsed browser, grouped by type -->
				<button
					on:click={() => showAllCards = !showAllCards}
					class="w-full mt-6 py-3 rounded-xl border border-[rgba(200,170,110,0.14)] hover:border-[#c8aa6e]/40 text-xs font-bold text-[#b9bcc6] hover:text-[#f1ede3] transition-all"
				>
					{showAllCards ? $t('sts2.synergyPage.showLess') + ' ↑' : `${$t('sts2.synergyPage.showAll')}: ${charCards.length} ${$t('sts2.nav.cards')} ↓`}
				</button>

				{#if showAllCards}
					{#each cardsByType as group}
						<div class="mt-8">
							<div class="flex items-center gap-3 mb-3">
								<h4 class="text-[10px] uppercase tracking-[3px] font-bold text-[#7c828f]">{group.type}s</h4>
								<span class="text-[10px] text-[#7c828f]/70 tabular-nums">{group.cards.length}</span>
								<div class="flex-1 h-px bg-gradient-to-r from-[rgba(200,170,110,0.12)] to-transparent"></div>
							</div>
							<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
								{#each group.cards as card}
									<button
										on:click={() => selectCard(card)}
										on:mouseenter={(e) => showCardHover(card, e)}
										on:mousemove={(e) => updateHoverPosition(e)}
										on:mouseleave={hideCardHover}
										class="row-tile group flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#101018] border border-[rgba(200,170,110,0.05)] text-left"
									>
										<div class="w-7 h-7 rounded overflow-hidden shrink-0 border border-[rgba(200,170,110,0.10)]">
											{#if card.image_url}
												<img src={getImageUrl(card.image_url, 56)} alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
											{:else}
												<div class="w-full h-full bg-gray-900 flex items-center justify-center text-[8px] text-gray-600">{card.type[0]}</div>
											{/if}
										</div>
										<div class="flex-1 min-w-0">
											<p class="text-[11px] font-bold text-[#d5d2c9] group-hover:text-[#e6c98a] transition-colors truncate">{card.name}</p>
										</div>
										<span class="text-[9px] text-[#7c828f] tabular-nums shrink-0">{costDisplay(card)}</span>
									</button>
								{/each}
							</div>
						</div>
					{/each}
				{/if}
			</div>
		{/if}

		<!-- Deck Recommendations: cards not in deck that synergize most with deck cards -->
	{#if deckRecommendations.length > 0}
		<div class="mb-10 p-4 sm:p-6 rounded-xl border border-[rgba(200,170,110,0.16)] bg-[#14141c]">
			<div class="flex items-center gap-3 mb-5">
				<svg class="w-4 h-4 text-[#c8aa6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
				<h3 class="text-sm font-bold tracking-[2px] uppercase text-[#c8aa6e]">{$t('sts2.synergyPage.recommendedForDeck')}</h3>
				<span class="text-xs text-gray-600">{$t('sts2.synergyPage.notInDeckYet')}</span>
			</div>
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
				{#each deckRecommendations as rec}
					{@const typeStyle = CARD_TYPE_COLORS[rec.card.type] || CARD_TYPE_COLORS.Attack}
					<div class="group relative rounded-lg bg-[#0a0a10] border {typeStyle.border} overflow-hidden hover:border-[#c8aa6e]/50 transition-all">
						<button
							on:click={() => selectCard(rec.card)}
							on:mouseenter={(e) => showCardHover(rec.card, e)}
							on:mousemove={(e) => updateHoverPosition(e)}
							on:mouseleave={hideCardHover}
							class="w-full"
						>
							<div class="relative aspect-[3/4] overflow-hidden">
								{#if rec.card.image_url}
									<img src={getImageUrl(rec.card.image_url, 120)} alt={rec.card.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
								{:else}
									<div class="w-full h-full bg-gray-900 flex items-center justify-center text-gray-600 text-xs">{rec.card.type[0]}</div>
								{/if}
								<div class="absolute top-1 right-1 px-1 py-0.5 rounded text-[8px] font-bold bg-[#c8aa6e]/90 text-black">{rec.synCount}</div>
							</div>
							<div class="p-1.5">
								<p class="text-[9px] font-semibold text-gray-200 truncate">{rec.card.name}</p>
								{#if rec.topSyn}
									<p class="text-[8px] text-gray-600 truncate">{$t('sts2.synergyPage.synsWith')} {rec.topSyn.card.name}</p>
								{/if}
							</div>
						</button>
						<button
							on:click={() => handleAddCard(rec.card)}
							class="w-full py-1 text-[9px] font-bold tracking-wider uppercase transition-all border-t {addedCards.has(rec.card.id) ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'border-[#c8aa6e]/20 text-[#c8aa6e]/70 hover:bg-[#c8aa6e]/10 hover:text-[#c8aa6e]'}"
						>
							{addedCards.has(rec.card.id) ? $t('sts2.synergyPage.addedToDeck') : '+ ' + $t('sts2.synergyPage.addToDeck')}
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Deck Synergy Analysis Panel -->
		{#if deckSynergyList.length > 0}
			<div class="mb-10 p-4 sm:p-6 rounded-xl border border-[rgba(200,170,110,0.16)] bg-[#14141c]">
				<div class="flex items-center gap-3 mb-5">
					<svg class="w-4 h-4 text-[#c8aa6e]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.10 6.31l1.424 4.381A2 2 0 0016.425 12h4.576M13.10 6.31A2 2 0 0011.19 5H6.5a2 2 0 00-1.98 2.31l1.52 9A2 2 0 007.02 18H18a2 2 0 001.98-1.69l.5-3M13.10 6.31L16.5 5" /></svg>
					<h3 class="text-sm font-bold tracking-[2px] uppercase text-[#c8aa6e]/80">{$t('sts2.synergyPage.deckSynergies')}</h3>
					<span class="text-xs text-gray-600">{deckSynergyList.length} {$t('sts2.synergyPage.pairsFound')}</span>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
					{#each deckSynergyList as syn}
						{@const aStyle = CARD_TYPE_COLORS[syn.source.type] || CARD_TYPE_COLORS.Attack}
						{@const bStyle = CARD_TYPE_COLORS[syn.card.type] || CARD_TYPE_COLORS.Attack}
						<div class="flex items-center gap-3 p-3 rounded-lg bg-[#101018] border border-[rgba(200,170,110,0.06)] hover:border-[rgba(200,170,110,0.18)] transition-colors">
							<button
								class="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-[rgba(200,170,110,0.12)] hover:border-[#c8aa6e]/40 transition-colors"
								on:mouseenter={(e) => showCardHover(syn.source, e)}
								on:mousemove={(e) => updateHoverPosition(e)}
								on:mouseleave={hideCardHover}
								on:click={() => selectCard(syn.source)}
							>
								{#if syn.source.image_url}
									<img src={getImageUrl(syn.source.image_url, 120)} alt={syn.source.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
								{:else}
									<div class="w-full h-full bg-gray-900 flex items-center justify-center text-[10px] text-gray-600">{syn.source.type[0]}</div>
								{/if}
							</button>
							<div class="w-5 shrink-0 flex items-center justify-center">
								<span class="font-display text-sm font-bold text-[#c8aa6e]/60">+</span>
							</div>
							<button
								class="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-[rgba(200,170,110,0.12)] hover:border-[#c8aa6e]/40 transition-colors"
								on:mouseenter={(e) => showCardHover(syn.card, e)}
								on:mousemove={(e) => updateHoverPosition(e)}
								on:mouseleave={hideCardHover}
								on:click={() => selectCard(syn.card)}
							>
								{#if syn.card.image_url}
									<img src={getImageUrl(syn.card.image_url, 120)} alt={syn.card.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
								{:else}
									<div class="w-full h-full bg-gray-900 flex items-center justify-center text-[10px] text-gray-600">{syn.card.type[0]}</div>
								{/if}
							</button>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-1.5 text-xs mb-0.5 flex-wrap">
									<span class="{aStyle.text} font-semibold truncate max-w-[100px] sm:max-w-[80px]">{syn.source.name}</span>
									<span class="text-gray-700">+</span>
									<span class="{bStyle.text} font-semibold truncate max-w-[100px] sm:max-w-[80px]">{syn.card.name}</span>
								</div>
								<p class="text-[10px] text-gray-600 leading-snug truncate">{syn.reasons?.[0]?.reason || ''}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Builder CTA -->
		<div class="flex items-center justify-center py-6">
			<a href="/build" class="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#c8aa6e]/40 hover:border-[#c8aa6e] bg-[#c8aa6e]/10 hover:bg-[#c8aa6e]/15 text-[#c8aa6e] text-xs font-bold tracking-wider uppercase transition-all">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" /></svg>
				{$t('sts2.synergyPage.openBuilder')}
			</a>
		</div>

		<!-- Navigation -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-10 mt-10 border-t border-[rgba(200,170,110,0.12)]">
			<a href="/" class="text-sm text-[#7c828f] hover:text-[#c8aa6e] transition-colors font-medium">← {$t('sts2.hub')}</a>
			<div class="flex flex-wrap gap-2 sm:gap-3">
				<a href="/tier-list" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#c8aa6e]/25 hover:border-[#c8aa6e]/55 text-xs text-[#b9bcc6] hover:text-[#f1ede3] font-bold transition-all">
					{$t('sts2.tierList')}
				</a>
				<a href="/guides" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#c8aa6e]/30 hover:border-[#c8aa6e] hover:bg-[#c8aa6e]/5 text-[#c8aa6e] text-xs font-bold transition-all">
					{$t('sts2.guides')} →
				</a>
			</div>
		</div>
	</div>

	<!-- Bottom spacer for mobile nav -->
	<div class="h-16 sm:hidden"></div>
</div>

<!-- Floating deck bar: closes the find-combo → build-deck loop -->
{#if $deck.length > 0}
	<a
		href="/build"
		class="deck-bar fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-xl bg-[#14141c]/95 backdrop-blur-md border border-[#c8aa6e]/30 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7)]"
	>
		<div class="flex">
			{#each $deck.slice(-3) as dc, i (dc.id + '-' + i)}
				{#if dc.image_url}
					<div class="w-8 h-8 rounded-md overflow-hidden border-2 border-[#14141c] -ml-2 first:ml-0" style="box-shadow: 0 0 0 1px rgba(200,170,110,0.3);">
						<img src={getImageUrl(dc.image_url, 64)} alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
					</div>
				{/if}
			{/each}
		</div>
		<div class="leading-tight">
			<div class="text-sm font-bold text-[#f1ede3] tabular-nums">{$deck.length} <span class="text-[10px] uppercase tracking-wider text-[#7c828f] font-bold">{$t('sts2.deck')}</span></div>
			<div class="text-[10px] font-bold text-[#c8aa6e]">{$t('sts2.synergyPage.openBuilder')}</div>
		</div>
	</a>
{/if}

<MobileNav />

<style>
	.sts2-shell {
		background:
			radial-gradient(1100px 500px at 50% -180px, rgba(200, 170, 110, 0.07), transparent 65%),
			#0a0a0f;
		font-family: 'Inter', system-ui, sans-serif;
	}
	.font-display {
		font-family: var(--font-display, 'Cinzel', Georgia, serif);
	}

	.pop-card, .pair-tile, .row-tile {
		transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
	}
	.pop-card:hover, .pair-tile:hover {
		transform: translateY(-3px);
		border-color: rgba(200, 170, 110, 0.45);
		box-shadow: 0 12px 32px -12px rgba(200, 170, 110, 0.25);
	}
	.row-tile:hover {
		background-color: #181822;
		border-color: rgba(200, 170, 110, 0.28);
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-clamp: 2;
		overflow: hidden;
	}

	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}

	/* Character chip: active state glows in the character's own theme color */
	.char-chip.active {
		border-color: color-mix(in srgb, var(--gc) 55%, transparent);
		background: color-mix(in srgb, var(--gc) 12%, transparent);
		color: var(--gc);
		box-shadow: 0 6px 24px -10px color-mix(in srgb, var(--gc) 70%, transparent);
	}

	/* Search box: focus glow themed to the active character's color */
	.search-wrap {
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}
	.search-wrap:focus-within {
		border-color: color-mix(in srgb, var(--accent) 55%, transparent);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent),
			0 12px 32px -14px color-mix(in srgb, var(--accent) 55%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.pop-card, .pair-tile, .row-tile {
			transition: none !important;
		}
		.pop-card:hover, .pair-tile:hover {
			transform: none !important;
		}
	}
</style>
