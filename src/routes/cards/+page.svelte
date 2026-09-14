<script>
	import { CHARACTER_THEMES, CARD_TYPE_COLORS, RARITY_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { filterCards, sortCards, parseDescription } from '$lib/sts2/utils/cardFilters';
	import { showCardHover, updateHoverPosition, hideCardHover, showUpgradedCards } from '$lib/sts2/stores/cardHoverStore';
	import { applyUpgrade } from '$lib/sts2/utils/cardUpgrade';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t, locale } from 'svelte-i18n';
	import { getContext, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';

	export let data;

	const localizedCards = getContext('localizedCards');
	const { keywordTranslations } = getContext('sts2') || {};

	function translateKeyword(kw) {
		if (!keywordTranslations || !$locale) return kw;
		const lang = $locale.split('-')[0];
		const translation = keywordTranslations[lang]?.[kw];
		return translation?.name || kw;
	}

	const validTabs = ['cards', 'potions', 'relics', 'monsters', 'events', 'enchantments', 'powers'];
	let activeTab = 'cards';

	onMount(() => {
		const tab = $page.url.searchParams.get('tab');
		if (tab && validTabs.includes(tab)) {
			activeTab = tab;
		}
		if (!data.potions || data.potions.length === 0) {
			invalidate('sts2:db-data');
		}
	});
	let filterMonsterType = '';
	let expandedMonster = null;
	let filterEventType = '';
	let filterEventAct = '';
	let expandedEvent = null;
	let filterEnchantType = '';
	let filterPowerType = '';
	const PAGE_SIZE = 80;
	let visibleCount = PAGE_SIZE;
	let search = '';
	let searchRaw = '';
	let searchDebounceTimer;
	let filterType = '';
	let filterRarity = '';
	let filterCost = '';
	let filterKeyword = '';
	let filterCharacter = '';
	let sortBy = 'cost';
	let searchInput;
	let viewMode = 'grid';

	function handleKeydown(e) {
		if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
			e.preventDefault();
			searchInput?.focus();
		}
		if (e.key === 'Escape' && document.activeElement === searchInput) {
			searchInput?.blur();
		}
	}

	$: allCards = $localizedCards || data.cards || [];
	$: isLoading = allCards.length === 0;
	$: characters = data.characters || [];
	$: potions = data.potions || [];
	$: relics = data.relics || [];
	$: allMonsters = (data.monsters || []).filter(m => m.min_hp !== 9999);
	$: encounters = data.encounters || [];
	$: allEvents = data.events || [];
	$: enchantmentTranslations = data.enchantmentTranslations || {};
	$: allEnchantments = (data.enchantments || []).map(e => {
		const lang = $locale?.split('-')[0];
		const tr = enchantmentTranslations[lang]?.[e.id];
		if (!tr) return e;
		return { ...e, name: tr.name || e.name, description: tr.description || e.description };
	});

	$: monsterActs = (() => {
		const map = {};
		for (const enc of encounters) {
			if (!enc.monsters) continue;
			for (const mon of enc.monsters) {
				if (!map[mon.id]) map[mon.id] = [];
				if (enc.act && !map[mon.id].includes(enc.act)) map[mon.id].push(enc.act);
			}
		}
		return map;
	})();

	$: filteredMonsters = allMonsters.filter(m => {
		if (filterMonsterType && m.type !== filterMonsterType) return false;
		if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
		return true;
	});

	$: eventTypes = [...new Set(allEvents.map(e => e.type).filter(Boolean))].sort();
	$: eventActs = [...new Set(allEvents.map(e => e.act).filter(Boolean))].sort();
	$: filteredEvents = allEvents.filter(e => {
		if (filterEventType && e.type !== filterEventType) return false;
		if (filterEventAct && e.act !== filterEventAct) return false;
		if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
		return true;
	});

	$: enchantTypes = [...new Set(allEnchantments.map(e => e.card_type).filter(Boolean))];

	$: allPowers = data.powers || [];
	$: filteredPowers = allPowers.filter(p => {
		if (filterPowerType && p.type !== filterPowerType) return false;
		if (search) {
			const q = search.toLowerCase();
			if (!p.name.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false;
		}
		return true;
	});
	$: filteredEnchantments = allEnchantments.filter(e => {
		if (filterEnchantType && e.card_type !== filterEnchantType) return false;
		if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.description?.toLowerCase().includes(search.toLowerCase())) return false;
		return true;
	});

	function parseColoredText(text) {
		if (!text) return '';
		return text
			.replace(/\[sine\]/g, '').replace(/\[\/sine\]/g, '')
			.replace(/\[jitter\]/g, '').replace(/\[\/jitter\]/g, '')
			.replace(/\[blue\](.*?)\[\/blue\]/g, '<span class="text-sky-400">$1</span>')
			.replace(/\[red\](.*?)\[\/red\]/g, '<span class="text-red-400">$1</span>')
			.replace(/\[green\](.*?)\[\/green\]/g, '<span class="text-emerald-400">$1</span>')
			.replace(/\[gold\](.*?)\[\/gold\]/g, '<span class="text-[#c8aa6e]">$1</span>')
			.replace(/\[orange\](.*?)\[\/orange\]/g, '<span class="text-orange-400">$1</span>')
			.replace(/\[gray\](.*?)\[\/gray\]/g, '<span class="text-gray-500">$1</span>')
			.replace(/\n/g, '<br>');
	}

	$: allFilteredCards = sortCards(
		filterCards(allCards, {
			character: filterCharacter,
			type: filterType,
			rarity: filterRarity,
			cost: filterCost,
			keyword: filterKeyword,
			search
		}),
		sortBy
	);
	$: filteredCards = allFilteredCards.slice(0, visibleCount);
	$: hasMore = visibleCount < allFilteredCards.length;

	$: allKeywords = [...new Set(allCards.flatMap(c => c.keywords || []))].sort();
	$: uniqueCosts = [...new Set(allCards.filter(c => !c.is_x_cost).map(c => c.cost))].sort((a, b) => a - b);
	$: costDisplay = (card) => card?.is_x_cost ? 'X' : (card?.star_cost != null ? `★${card.star_cost}` : card?.cost ?? '?');

	$: activeFilterCount = [filterType, filterRarity, filterCost, filterKeyword].filter(Boolean).length;

	function handleSearch(e) {
		searchRaw = e.target.value;
		clearTimeout(searchDebounceTimer);
		searchDebounceTimer = setTimeout(() => { search = searchRaw; visibleCount = PAGE_SIZE; }, 200);
	}

	function clearFilters() {
		filterType = '';
		filterRarity = '';
		filterCost = '';
		filterKeyword = '';
		filterCharacter = '';
		searchRaw = '';
		search = '';
		visibleCount = PAGE_SIZE;
	}

	function switchTab(tab) {
		activeTab = tab;
		clearFilters();
		filterMonsterType = '';
		expandedMonster = null;
		filterEventType = '';
		filterEventAct = '';
		expandedEvent = null;
		filterEnchantType = '';
		filterPowerType = '';
		visibleCount = PAGE_SIZE;
	}

	function typeBadge(type) {
		if (type === 'Boss') return 'bg-red-500/10 border-red-500/20 text-red-400';
		if (type === 'Elite') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
		return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
	}

	function hpDisplay(m) {
		if (!m.min_hp && !m.max_hp) return '?';
		if (m.min_hp === m.max_hp || !m.max_hp) return `${m.min_hp}`;
		return `${m.min_hp}\u2013${m.max_hp}`;
	}

	// Filtered potions and relics
	$: filteredPotions = potions.filter(potion => {
		const matchesSearch = !search || potion.name.toLowerCase().includes(search.toLowerCase()) || potion.description?.toLowerCase().includes(search.toLowerCase());
		const matchesRarity = !filterRarity || potion.rarity === filterRarity;
		const matchesChar = !filterCharacter || potion.pool === filterCharacter || potion.pool === 'shared';
		return matchesSearch && matchesRarity && matchesChar;
	});

	$: filteredRelics = relics.filter(relic => {
		const matchesSearch = !search || relic.name.toLowerCase().includes(search.toLowerCase()) || relic.description?.toLowerCase().includes(search.toLowerCase());
		const matchesRarity = !filterRarity || relic.rarity === filterRarity;
		const matchesChar = !filterCharacter || relic.pool === filterCharacter || relic.pool === 'shared';
		return matchesSearch && matchesRarity && matchesChar;
	});
</script>

<svelte:head>
	<title>{$t('sts2.seo.cardsTitle')}</title>
	<meta name="description" content={$t('sts2.seo.cardsDesc')}>
	<link rel="canonical" href="https://STS2_DOMAIN/game-database">
	<meta property="og:title" content={$t('sts2.seo.cardsTitle')}>
	<meta property="og:description" content={$t('sts2.seo.cardsDesc')}>
	<meta property="og:type" content="website">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:url" content="https://STS2_DOMAIN/game-database">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={$t('sts2.seo.cardsTitle')}>
	<meta name="twitter:description" content={$t('sts2.seo.cardsDesc')}>
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		"name": $t('sts2.seo.cardsTitle'),
		"description": $t('sts2.seo.cardsDesc'),
		"url": "https://STS2_DOMAIN/game-database",
		"publisher": { "@type": "Organization", "name": "ggez.gg", "url": "https://ggez.gg" },
		"mainEntityOfPage": { "@type": "WebPage", "@id": "https://STS2_DOMAIN/game-database" },
		"about": { "@type": "VideoGame", "name": "Slay the Spire 2" }
	})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://ggez.gg"},
			{"@type": "ListItem", "position": 2, "name": "Slay the Spire 2", "item": "https://STS2_DOMAIN"},
			{"@type": "ListItem", "position": 3, "name": $t('sts2.cardsPage.title'), "item": "https://STS2_DOMAIN/game-database"}
		]
	})}</script>`}
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="sts2-shell relative z-10 min-h-screen">
	<!-- Breadcrumb -->
	<div class="sticky top-14 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[rgba(200,170,110,0.10)]">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
			<a href="/" class="text-sm font-extrabold text-[#c8aa6e] hover:text-[#e6c98a] transition-colors tracking-wide shrink-0 hidden sm:inline">GGEZ.GG</a>
			<span class="text-[#7c828f] shrink-0 hidden sm:inline">/</span>
			<a href="/" class="text-sm text-[#b9bcc6] hover:text-[#c8aa6e] transition-colors shrink-0">StS2</a>
			<span class="text-[#7c828f] shrink-0">/</span>
			<span class="text-sm font-bold text-[#f1ede3] shrink-0">{$t('sts2.databaseTitle')}</span>

			<div class="ml-auto flex items-center gap-2 shrink-0">
				<a href="/build" class="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-xs text-[#b9bcc6] hover:text-[#f1ede3] transition-all font-medium">
					{$t('sts2.nav.build')}
				</a>
				<a href="/synergies" class="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-xs text-[#b9bcc6] hover:text-[#f1ede3] transition-all font-medium">
					{$t('sts2.synergies')}
				</a>
				<a href="/tier-list" class="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-xs text-[#b9bcc6] hover:text-[#f1ede3] transition-all font-medium">
					{$t('sts2.tierList')}
				</a>
			</div>
		</div>
	</div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="font-display text-4xl md:text-5xl font-bold text-[#f1ede3] tracking-tight mb-2">
				{$t('sts2.databaseTitle')}
			</h1>
			<p class="text-[#b9bcc6] text-base max-w-2xl leading-relaxed">{$t('sts2.databaseDesc')}</p>
		</div>

		<!-- Tabs -->
		<div class="flex gap-1.5 mb-8 overflow-x-auto scrollbar-hide">
			<button
				on:click={() => switchTab('cards')}
				class="db-tab px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all shrink-0 whitespace-nowrap {activeTab === 'cards' ? 'text-[#e6c98a] border-[#c8aa6e]/45 bg-[#c8aa6e]/10' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-[rgba(200,170,110,0.18)]'}"
			>
				{$t('sts2.nav.cards')} <span class="opacity-60 tabular-nums">{allCards.length}</span>
			</button>
			<button
				on:click={() => switchTab('potions')}
				class="db-tab px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all shrink-0 whitespace-nowrap {activeTab === 'potions' ? 'text-[#e6c98a] border-[#c8aa6e]/45 bg-[#c8aa6e]/10' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-[rgba(200,170,110,0.18)]'}"
			>
				{$t('sts2.nav.potions')} <span class="opacity-60 tabular-nums">{potions.length}</span>
			</button>
			<button
				on:click={() => switchTab('relics')}
				class="db-tab px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all shrink-0 whitespace-nowrap {activeTab === 'relics' ? 'text-[#e6c98a] border-[#c8aa6e]/45 bg-[#c8aa6e]/10' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-[rgba(200,170,110,0.18)]'}"
			>
				{$t('sts2.nav.relics')} <span class="opacity-60 tabular-nums">{relics.length}</span>
			</button>
			<button
				on:click={() => switchTab('monsters')}
				class="db-tab px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all shrink-0 whitespace-nowrap {activeTab === 'monsters' ? 'text-red-300 border-red-400/40 bg-red-500/10' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-[rgba(200,170,110,0.18)]'}"
			>
				{$t('sts2.nav.monsters')} <span class="opacity-60 tabular-nums">{allMonsters.length}</span>
			</button>
			<button
				on:click={() => switchTab('events')}
				class="db-tab px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all shrink-0 whitespace-nowrap {activeTab === 'events' ? 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-[rgba(200,170,110,0.18)]'}"
			>
				{$t('sts2.eventsPage.title')} <span class="opacity-60 tabular-nums">{allEvents.length}</span>
			</button>
			<button
				on:click={() => switchTab('enchantments')}
				class="db-tab px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all shrink-0 whitespace-nowrap {activeTab === 'enchantments' ? 'text-purple-300 border-purple-400/40 bg-purple-500/10' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-[rgba(200,170,110,0.18)]'}"
			>
				{$t('sts2.enchantmentsPage.title')} <span class="opacity-60 tabular-nums">{allEnchantments.length}</span>
			</button>
			<button
				on:click={() => switchTab('powers')}
				class="db-tab px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase border transition-all shrink-0 whitespace-nowrap {activeTab === 'powers' ? 'text-amber-300 border-amber-400/40 bg-amber-500/10' : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-[rgba(200,170,110,0.18)]'}"
			>
				{$t('sts2.nav.powers')} <span class="opacity-60 tabular-nums">{allPowers.length}</span>
			</button>
		</div>

		<!-- Loading state -->
		{#if isLoading && activeTab === 'cards'}
		<div class="flex flex-col items-center justify-center py-20 gap-4">
			<div class="w-8 h-8 border-2 border-[#c8aa6e]/30 border-t-[#c8aa6e] rounded-full animate-spin"></div>
			<p class="text-xs text-gray-500 uppercase tracking-widest">{$t('common.loading')}</p>
		</div>
		{/if}

		<!-- Character Selector (Cards only) -->
		{#if activeTab === 'cards' && !isLoading}
		<div class="flex gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide">
			<button
				on:click={() => filterCharacter = ''}
				class="group flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all duration-200 shrink-0 {filterCharacter === '' ? 'border-[#c8aa6e]/50 bg-[#c8aa6e]/10' : 'border-[#c8aa6e]/10 hover:border-[#c8aa6e]/30 opacity-60 hover:opacity-90'}"
			>
				<span class="text-xs sm:text-sm font-bold tracking-wider {filterCharacter === '' ? 'text-[#c8aa6e]' : 'text-gray-400'}">{$t('sts2.common.all')}</span>
			</button>
			{#each characters as char}
				{@const charTheme = CHARACTER_THEMES[char.id.toLowerCase()]}
				{@const isActive = filterCharacter === char.id.toLowerCase()}
				<button
					on:click={() => filterCharacter = char.id.toLowerCase()}
					class="group flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all duration-200 shrink-0 {isActive ? '' : 'border-[#c8aa6e]/10 hover:border-[#c8aa6e]/30 opacity-60 hover:opacity-90'}"
					style="{isActive ? `border-color: ${charTheme?.color}50; background: ${charTheme?.color}10; color: ${charTheme?.color}` : ''}"
				>
					{#if char.image_url}
						<img src={getImageUrl(char.image_url, 40)} alt="Image" class="w-6 h-6 sm:w-7 sm:h-7 object-cover object-top" />
					{/if}
					<span class="text-xs sm:text-sm font-bold tracking-wider {isActive ? '' : 'text-gray-400'}">{char.name}</span>
				</button>
			{/each}
		</div>

		<!-- Search -->
		<div class="relative mb-6">
			<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
			</svg>
			<input
				bind:this={searchInput}
				value={searchRaw}
				on:input={handleSearch}
				type="text"
				placeholder={$t('sts2.cardsPage.searchPlaceholder')}
				class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.14)] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors"
			/>
			{#if searchRaw}
				<button on:click={() => { searchRaw = ''; search = ''; }} class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs transition-colors">✕</button>
			{/if}
		</div>

		<!-- Filter Row -->
		<div class="flex flex-wrap items-center gap-2 mb-6">
			<select bind:value={filterType} aria-label="Filter by type" class="rounded-lg bg-[#14141c] border border-[rgba(200,170,110,0.14)] px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors">
				<option value="">{$t('sts2.cardsPage.allTypes')}</option>
				<option value="Attack">{$t('sts2.cardsPage.attack')}</option>
				<option value="Skill">{$t('sts2.cardsPage.skill')}</option>
				<option value="Power">{$t('sts2.cardsPage.power')}</option>
			</select>
			<select bind:value={filterRarity} aria-label="Filter by rarity" class="rounded-lg bg-[#14141c] border border-[rgba(200,170,110,0.14)] px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors">
				<option value="">{$t('sts2.cardsPage.allRarities')}</option>
				<option value="Basic">{$t('sts2.cardsPage.basic')}</option>
				<option value="Common">{$t('sts2.cardsPage.common')}</option>
				<option value="Uncommon">{$t('sts2.cardsPage.uncommon')}</option>
				<option value="Rare">{$t('sts2.cardsPage.rare')}</option>
			</select>
			<select bind:value={filterCost} aria-label="Filter by cost" class="rounded-lg bg-[#14141c] border border-[rgba(200,170,110,0.14)] px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors">
				<option value="">{$t('sts2.cardsPage.allCosts')}</option>
				{#each uniqueCosts as c}
					<option value={String(c)}>{c}</option>
				{/each}
				<option value="X">X</option>
			</select>
			{#if allKeywords.length > 0}
				<select bind:value={filterKeyword} aria-label="Filter by keyword" class="rounded-lg bg-[#14141c] border border-[rgba(200,170,110,0.14)] px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors">
					<option value="">{$t('sts2.cardsPage.allKeywords')}</option>
					{#each allKeywords as kw}
						<option value={kw}>{translateKeyword(kw)}</option>
					{/each}
				</select>
			{/if}
			<select bind:value={sortBy} aria-label="Sort by" class="rounded-lg bg-[#14141c] border border-[rgba(200,170,110,0.14)] px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors">
				<option value="cost">Sort: Cost</option>
				<option value="name">Sort: Name</option>
				<option value="type">Sort: Type</option>
				<option value="rarity">Sort: Rarity</option>
			</select>

			<!-- Upgrade toggle -->
			<button
				on:click={() => $showUpgradedCards = !$showUpgradedCards}
				class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider font-bold border transition-all {$showUpgradedCards ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-[#c8aa6e]/15 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
				title={$showUpgradedCards ? $t('sts2.cardsPage.showBase') : $t('sts2.cardsPage.showUpgraded')}
			>
				<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
				</svg>
				{$showUpgradedCards ? $t('sts2.cardsPage.upgraded') : $t('sts2.cardsPage.base')}
			</button>

			<!-- View toggle -->
			<div class="flex rounded-lg border border-[rgba(200,170,110,0.15)] overflow-hidden ml-auto">
				<button on:click={() => viewMode = 'grid'} aria-label="Grid view" class="px-2.5 py-2 text-xs transition-all {viewMode === 'grid' ? 'bg-[#c8aa6e]/15 text-[#c8aa6e]' : 'text-gray-500 hover:text-white'}">
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
					</svg>
				</button>
				<button on:click={() => viewMode = 'list'} aria-label="List view" class="px-2.5 py-2 text-xs transition-all {viewMode === 'list' ? 'bg-[#c8aa6e]/15 text-[#c8aa6e]' : 'text-gray-500 hover:text-white'}">
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>

			{#if activeFilterCount > 0 || search}
				<button on:click={clearFilters} class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] border border-red-500/20 text-red-400/80 hover:text-red-400 hover:border-red-500/40 transition-all uppercase tracking-wider font-bold">
					<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
					{$t('sts2.cardsPage.clearAll')}
					{#if activeFilterCount > 0}<span class="w-4 h-4 flex items-center justify-center bg-red-500/20 text-red-400 font-bold" style="font-size:9px">{activeFilterCount}</span>{/if}
				</button>
			{/if}
		</div>

		<!-- Results count -->
		<div class="flex items-center justify-between mb-4">
			<p class="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{allFilteredCards.length} / {allCards.length} {$t('sts2.nav.cards')}</p>
		</div>

		<!-- Cards Grid -->
		{#if viewMode === 'grid'}
			<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
				{#each filteredCards as card (card.id)}
					{@const typeColor = CARD_TYPE_COLORS[card.type] || CARD_TYPE_COLORS.Skill}
					{@const rarityStyle = RARITY_COLORS[card.rarity] || RARITY_COLORS.Common}
					{@const charId = card.character?.toLowerCase() || ''}
					{@const theme = CHARACTER_THEMES[charId]}
					{@const upg = $showUpgradedCards && card.upgrade ? applyUpgrade(card) : null}
					{@const displayName = upg ? upg.name : card.name}
					{@const displayCost = upg ? costDisplay(upg) : costDisplay(card)}
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div
						class="group relative rounded-lg border {upg ? 'border-green-500/15 hover:border-green-500/40' : 'border-[rgba(200,170,110,0.07)] hover:border-[#c8aa6e]/35'} bg-[#14141c] transition-all duration-200 cursor-pointer overflow-hidden hover:scale-[1.03] hover:z-10 hover:shadow-lg hover:shadow-black/50"
						on:mouseenter={(e) => showCardHover(card, e)}
						on:mousemove={(e) => updateHoverPosition(e)}
						on:mouseleave={hideCardHover}
					>
						<!-- Card image -->
						<div class="aspect-[3/4] overflow-hidden">
							{#if card.image_url}
								<img src={getImageUrl(card.image_url, 400)} alt={displayName} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" />
							{:else}
								<div class="w-full h-full bg-gray-900/50 flex items-center justify-center">
									<span class="text-gray-700 text-[8px] uppercase">{card.type}</span>
								</div>
							{/if}
						</div>
						<!-- Cost badge -->
						<div class="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg backdrop-blur-sm {upg && upg.cost !== card.cost ? 'ring-1 ring-green-400/50' : ''}" style="background: {typeColor.bg}; color: {upg && upg.cost !== card.cost ? '#4ade80' : typeColor.text}; border: 1px solid {typeColor.border}">
							{displayCost}
						</div>
						{#if upg && !card.upgrade}
							<!-- No upgrade available indicator -->
						{:else if upg}
							<div class="absolute top-1 right-1 px-1 py-0.5 bg-green-500/20 border border-green-500/30 text-[7px] font-bold text-green-400 backdrop-blur-sm">+</div>
						{/if}
						<!-- Name strip -->
						<div class="px-1.5 py-1.5 bg-gradient-to-t from-black via-black/95 to-black/80">
							<p class="text-[9px] font-bold {upg ? 'text-green-300' : 'text-white'} truncate group-hover:text-[#c8aa6e] transition-colors">{displayName}</p>
							<div class="flex items-center gap-1">
								<span class="text-[7px] uppercase tracking-wider {rarityStyle.text}">{card.rarity}</span>
								{#if theme}
									<span class="text-[7px]" style="color: {theme.color}">{card.character}</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- List View -->
			<div class="rounded-xl border border-[rgba(200,170,110,0.10)] bg-[#14141c] overflow-hidden">
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#c8aa6e]/5">
					{#each filteredCards as card (card.id)}
						{@const typeColor = CARD_TYPE_COLORS[card.type] || CARD_TYPE_COLORS.Skill}
						{@const rarityStyle = RARITY_COLORS[card.rarity] || RARITY_COLORS.Common}
						{@const charId = card.character?.toLowerCase() || ''}
						{@const theme = CHARACTER_THEMES[charId]}
						{@const upg = $showUpgradedCards && card.upgrade ? applyUpgrade(card) : null}
						{@const displayName = upg ? upg.name : card.name}
						{@const displayCostVal = upg ? costDisplay(upg) : costDisplay(card)}
						{@const displayDesc = upg ? upg.description : card.description}
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
						<div
							class="group flex items-center gap-3 p-3 bg-[#161620] hover:bg-[#1d1d29] transition-colors cursor-pointer"
							on:mouseenter={(e) => showCardHover(card, e)}
							on:mousemove={(e) => updateHoverPosition(e)}
							on:mouseleave={hideCardHover}
						>
							<div class="w-10 h-10 overflow-hidden shrink-0 border {upg ? 'border-green-500/25' : 'border-[#c8aa6e]/15'}">
								{#if card.image_url}
									<img src={getImageUrl(card.image_url, 120)} alt={displayName} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
								{:else}
									<div class="w-full h-full bg-gray-900"></div>
								{/if}
							</div>
							<div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style="background: {typeColor.bg}; color: {upg && upg.cost !== card.cost ? '#4ade80' : typeColor.text}; border: 1px solid {typeColor.border}">
								{displayCostVal}
							</div>
							<div class="flex-1 min-w-0">
								<h5 class="text-xs font-bold {upg ? 'text-green-300' : 'text-white'} group-hover:text-[#c8aa6e] transition-colors truncate">{displayName}</h5>
								<div class="flex items-center gap-1.5 mt-0.5 text-[10px]">
									<span class="{CARD_TYPE_COLORS[card.type]?.text || 'text-gray-400'} uppercase font-bold tracking-wider">{card.type}</span>
									<span class="text-gray-700">·</span>
									<span class="{rarityStyle.text}">{card.rarity}</span>
									{#if theme}
										<span class="text-gray-700">·</span>
										<span style="color: {theme.color}">{card.character}</span>
									{/if}
								</div>
							</div>
							<div class="text-[10px] text-gray-500 max-w-[250px] truncate hidden lg:block">
								{@html parseDescription(displayDesc)}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if allFilteredCards.length === 0}
			<div class="text-center py-20">
				<div class="text-gray-700 text-4xl mb-4">&#9825;</div>
				<p class="text-gray-500 text-sm mb-3">{$t('sts2.cardsPage.noCardsMatch')}</p>
				<button on:click={clearFilters} class="text-[#c8aa6e]/80 hover:text-[#c8aa6e] text-xs font-medium tracking-wider transition-colors">{$t('sts2.cardsPage.clearAllFilters')}</button>
			</div>
		{/if}

		{#if hasMore}
			<div class="flex justify-center mt-8">
				<button
					on:click={() => visibleCount += PAGE_SIZE}
					class="px-8 py-3 rounded-lg border border-[#c8aa6e]/30 hover:border-[#c8aa6e]/70 text-[#c8aa6e]/70 hover:text-[#c8aa6e] text-sm tracking-wider uppercase transition-all"
				>
					Load More ({allFilteredCards.length - visibleCount} remaining)
				</button>
			</div>
		{/if}
		{/if}

		<!-- Potions Tab -->
		{#if activeTab === 'potions'}
		<div class="mb-6">
			<div class="relative">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
				<input
					type="text"
					value={searchRaw}
					on:input={handleSearch}
					placeholder={$t('sts2.potionsPage.searchPlaceholder')}
					class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.14)] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors"
				/>
			</div>
		</div>
		<div class="flex items-center gap-3 mb-6">
			<p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{filteredPotions.length} / {potions.length} {$t('sts2.nav.potions')}</p>
			<div class="flex gap-2">
				{#each ['Common','Uncommon','Rare'] as r}
					<button
						on:click={() => filterRarity = filterRarity === r ? '' : r}
						class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all {filterRarity === r ? 'border-[#c8aa6e]/50 bg-[#c8aa6e]/10 text-[#c8aa6e]' : 'border-[#c8aa6e]/10 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
					>{$t('sts2.cardsPage.' + r.toLowerCase())}</button>
				{/each}
			</div>
			{#if filterRarity || search}
				<button on:click={clearFilters} class="text-[10px] text-gray-600 hover:text-red-400 transition-colors uppercase tracking-wider font-bold">{$t('sts2.cardsPage.clearAll')}</button>
			{/if}
		</div>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
			{#each filteredPotions as potion (potion.id)}
				{@const rarityStyle = RARITY_COLORS[potion.rarity] || RARITY_COLORS.Common}
				<div
					class="group relative rounded-lg border border-[rgba(200,170,110,0.07)] bg-[#14141c] hover:border-[#c8aa6e]/35 transition-all duration-200 cursor-pointer overflow-hidden hover:scale-[1.03] hover:z-10 hover:shadow-lg hover:shadow-black/50"
					on:mouseenter={(e) => showCardHover({...potion, _itemType: 'potion'}, e)}
					on:mousemove={(e) => updateHoverPosition(e)}
					on:mouseleave={hideCardHover}
				>
					<div class="aspect-square overflow-hidden bg-[#1d1d29] flex items-center justify-center p-3">
						{#if potion.image_url}
							<img src={getImageUrl(potion.image_url, 240)} alt={potion.name} class="max-h-full w-auto object-contain group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" />
						{:else}
							<span class="text-3xl opacity-40">🧪</span>
						{/if}
					</div>
					<div class="px-1.5 py-1.5 bg-gradient-to-t from-black via-black/95 to-black/80">
						<p class="text-[9px] font-bold text-white truncate group-hover:text-[#c8aa6e] transition-colors">{potion.name}</p>
						<span class="text-[7px] uppercase tracking-wider {rarityStyle.text}">{$t('sts2.cardsPage.' + (potion.rarity || 'common').toLowerCase())}</span>
					</div>
				</div>
			{/each}
		</div>
		{#if filteredPotions.length === 0}
			<div class="text-center py-20">
				<p class="text-gray-500 text-sm">{$t('sts2.cardsPage.noCardsMatch')}</p>
			</div>
		{/if}
		{/if}

		<!-- Relics Tab -->
		{#if activeTab === 'relics'}
		<div class="mb-6">
			<div class="relative">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
				<input
					type="text"
					value={searchRaw}
					on:input={handleSearch}
					placeholder={$t('sts2.relicsPage.searchPlaceholder')}
					class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.14)] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors"
				/>
			</div>
		</div>
		<div class="flex items-center gap-3 mb-6">
			<p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{filteredRelics.length} / {relics.length} {$t('sts2.nav.relics')}</p>
			<div class="flex gap-2">
				{#each ['Common','Uncommon','Rare','Boss','Shop'] as r}
					<button
						on:click={() => filterRarity = filterRarity === r ? '' : r}
						class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all {filterRarity === r ? 'border-[#c8aa6e]/50 bg-[#c8aa6e]/10 text-[#c8aa6e]' : 'border-[#c8aa6e]/10 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
					>{$t('sts2.cardsPage.' + r.toLowerCase())}</button>
				{/each}
			</div>
			{#if filterRarity || search}
				<button on:click={clearFilters} class="text-[10px] text-gray-600 hover:text-red-400 transition-colors uppercase tracking-wider font-bold">{$t('sts2.cardsPage.clearAll')}</button>
			{/if}
		</div>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
			{#each filteredRelics as relic (relic.id)}
				{@const rarityStyle = RARITY_COLORS[relic.rarity] || RARITY_COLORS.Common}
				<div
					class="group relative rounded-lg border border-[rgba(200,170,110,0.07)] bg-[#14141c] hover:border-[#c8aa6e]/35 transition-all duration-200 cursor-pointer overflow-hidden hover:scale-[1.03] hover:z-10 hover:shadow-lg hover:shadow-black/50"
					on:mouseenter={(e) => showCardHover({...relic, _itemType: 'relic'}, e)}
					on:mousemove={(e) => updateHoverPosition(e)}
					on:mouseleave={hideCardHover}
				>
					<div class="aspect-square overflow-hidden bg-[#1d1d29] flex items-center justify-center p-3">
						{#if relic.image_url}
							<img src={getImageUrl(relic.image_url, 240)} alt={relic.name} class="max-h-full w-auto object-contain group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" />
						{:else}
							<span class="text-3xl opacity-40">⚜️</span>
						{/if}
					</div>
					<div class="px-1.5 py-1.5 bg-gradient-to-t from-black via-black/95 to-black/80">
						<p class="text-[9px] font-bold text-white truncate group-hover:text-[#c8aa6e] transition-colors">{relic.name}</p>
						<span class="text-[7px] uppercase tracking-wider {rarityStyle.text}">{$t('sts2.cardsPage.' + (relic.rarity || 'common').toLowerCase())}</span>
					</div>
				</div>
			{/each}
		</div>
		{#if filteredRelics.length === 0}
			<div class="text-center py-20">
				<p class="text-gray-500 text-sm">{$t('sts2.cardsPage.noCardsMatch')}</p>
			</div>
		{/if}
		{/if}

		<!-- Monsters Tab -->
		{#if activeTab === 'monsters'}
		<div class="mb-6">
			<div class="relative">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
				<input
					type="text"
					value={searchRaw}
					on:input={handleSearch}
					placeholder={$t('sts2.bestiaryPage.searchPlaceholder')}
					class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.14)] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors"
				/>
			</div>
		</div>
		<div class="flex items-center gap-3 mb-6 flex-wrap">
			<p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{filteredMonsters.length} / {allMonsters.length} {$t('sts2.nav.monsters')}</p>
			<div class="flex gap-2">
				{#each ['Boss','Elite','Normal'] as mType}
					<button
						on:click={() => filterMonsterType = filterMonsterType === mType ? '' : mType}
						class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all {filterMonsterType === mType ? 'border-[#c8aa6e]/50 bg-[#c8aa6e]/10 text-[#c8aa6e]' : 'border-[#c8aa6e]/10 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
					>{mType} ({allMonsters.filter(m => m.type === mType).length})</button>
				{/each}
			</div>
			{#if filterMonsterType || search}
				<button on:click={() => { clearFilters(); filterMonsterType = ''; }} class="text-[10px] text-gray-600 hover:text-red-400 transition-colors uppercase tracking-wider font-bold">{$t('sts2.cardsPage.clearAll')}</button>
			{/if}
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
			{#each filteredMonsters as monster (monster.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<div
					on:click={() => expandedMonster = expandedMonster === monster.id ? null : monster.id}
					class="group rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.08)] hover:border-red-400/30 hover:bg-[#181822] transition-all cursor-pointer"
				>
					<div class="p-4">
						<div class="flex items-start justify-between gap-2 mb-2">
							<div class="flex items-center gap-2.5 min-w-0">
								{#if monster.image_url}
									<div class="w-10 h-10 shrink-0 border border-[#c8aa6e]/10 overflow-hidden bg-gray-900/50">
										<img src={getImageUrl(monster.image_url)} alt={monster.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
									</div>
								{:else}
									<div class="w-10 h-10 shrink-0 border border-[#c8aa6e]/10 bg-gray-900/50 flex items-center justify-center">
										<span class="text-gray-700 text-[8px]">?</span>
									</div>
								{/if}
								<div class="min-w-0">
									<h4 class="text-sm font-bold text-white group-hover:text-[#c8aa6e] transition-colors truncate">{monster.name}</h4>
									<span class="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 border {typeBadge(monster.type)}">{monster.type}</span>
								</div>
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
							<span class="text-red-400/80 font-bold">HP {hpDisplay(monster)}</span>
							{#if monster.min_hp_ascension}
								<span class="text-gray-600">A: {monster.min_hp_ascension}{monster.max_hp_ascension ? `–${monster.max_hp_ascension}` : ''}</span>
							{/if}
							{#if monsterActs[monster.id]}
								{#each monsterActs[monster.id] as act}
									<span class="text-gray-600 text-[9px]">{act.replace('Act 1 - ', '').replace('Act 2 - ', '').replace('Act 3 - ', '')}</span>
								{/each}
							{/if}
						</div>

						{#if monster.moves && monster.moves.length > 0}
							<div class="flex flex-wrap gap-1 mt-2">
								{#each monster.moves.slice(0, 5) as move}
									<span class="text-[9px] px-1.5 py-0.5 bg-white/[0.03] border border-white/5 text-gray-500">
										{move.name}
										{#if monster.damage_values?.[move.name]}
											<span class="text-red-400/70 ml-0.5">{monster.damage_values[move.name].normal}</span>
										{/if}
									</span>
								{/each}
								{#if monster.moves.length > 5}
									<span class="text-[9px] text-gray-700">+{monster.moves.length - 5}</span>
								{/if}
							</div>
						{/if}
					</div>

					{#if expandedMonster === monster.id}
						<div class="px-4 pb-4 border-t border-[#c8aa6e]/5">
							<div class="mt-3 space-y-1.5">
								<span class="text-[9px] text-gray-600 uppercase tracking-widest font-bold">{$t('sts2.bestiaryPage.moves')}</span>
								{#each monster.moves as move}
									<div class="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5">
										<span class="text-xs font-medium text-gray-300">{move.name}</span>
										<div class="flex items-center gap-3 text-[10px]">
											{#if monster.damage_values?.[move.name]}
												<span class="text-red-400">
													{monster.damage_values[move.name].normal} dmg
													{#if monster.damage_values[move.name].ascension}
														<span class="text-gray-600">(A: {monster.damage_values[move.name].ascension})</span>
													{/if}
												</span>
											{/if}
											{#if monster.block_values?.[move.name]}
												<span class="text-sky-400">{monster.block_values[move.name]} block</span>
											{/if}
										</div>
									</div>
								{/each}
							</div>
							{#if monsterActs[monster.id] && monsterActs[monster.id].length > 0}
								<div class="mt-3">
									<span class="text-[9px] text-gray-600 uppercase tracking-widest font-bold">{$t('sts2.bestiaryPage.appearsIn')}</span>
									<div class="flex flex-wrap gap-1 mt-1">
										{#each monsterActs[monster.id] as act}
											<span class="text-[10px] px-2 py-0.5 bg-white/[0.03] border border-white/5 text-gray-400">{act}</span>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
		{#if filteredMonsters.length === 0}
			<div class="text-center py-20">
				<p class="text-gray-500 text-sm">{$t('sts2.bestiaryPage.noMatch')}</p>
			</div>
		{/if}
		{/if}

		<!-- Events Tab -->
		{#if activeTab === 'events'}
		<div class="mb-6">
			<div class="relative">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
				<input
					type="text"
					value={searchRaw}
					on:input={handleSearch}
					placeholder={$t('sts2.eventsPage.searchPlaceholder')}
					class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.14)] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors"
				/>
			</div>
		</div>
		<div class="flex items-center gap-3 mb-6 flex-wrap">
			<p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{filteredEvents.length} / {allEvents.length} {$t('sts2.eventsPage.title')}</p>
			<div class="flex gap-2">
				{#each eventTypes as eType}
					<button
						on:click={() => filterEventType = filterEventType === eType ? '' : eType}
						class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all {filterEventType === eType ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-[#c8aa6e]/10 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
					>{eType}</button>
				{/each}
			</div>
			<select
				bind:value={filterEventAct}
				class="bg-[#161620] border border-[#c8aa6e]/15 px-3 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-[#c8aa6e]/40 transition-colors uppercase tracking-wider"
			>
				<option value="">{$t('sts2.eventsPage.allActs')}</option>
				{#each eventActs as act}
					<option value={act}>{act}</option>
				{/each}
			</select>
			{#if filterEventType || filterEventAct || search}
				<button on:click={() => { clearFilters(); filterEventType = ''; filterEventAct = ''; }} class="text-[10px] text-gray-600 hover:text-red-400 transition-colors uppercase tracking-wider font-bold">{$t('sts2.cardsPage.clearAll')}</button>
			{/if}
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
			{#each filteredEvents as event (event.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<div
					on:click={() => expandedEvent = expandedEvent === event.id ? null : event.id}
					class="group rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.08)] hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden"
				>
					<div class="p-4">
						<div class="flex items-start justify-between gap-3 mb-2">
							<div class="flex items-center gap-3 min-w-0">
								{#if event.image_url}
									<div class="w-10 h-10 shrink-0 border border-amber-500/20 overflow-hidden bg-gray-900/50 rounded-sm">
										<img src={getImageUrl(event.image_url)} alt={event.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
									</div>
								{/if}
								<div class="min-w-0">
									<h4 class="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{event.name}</h4>
									<div class="flex items-center gap-2 mt-1">
										<span class="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 border {event.type === 'Ancient' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : event.type === 'Shared' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}">{event.type || 'Event'}</span>
										{#if event.act}
											<span class="text-[9px] text-gray-600">{event.act}</span>
										{/if}
									</div>
								</div>
							</div>
							<div class="shrink-0 text-gray-600 group-hover:text-emerald-400/50 transition-colors">
								<svg class="w-4 h-4 transition-transform {expandedEvent === event.id ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
								</svg>
							</div>
						</div>
						{#if event.description}
							<p class="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{@html parseColoredText(event.description)}</p>
						{/if}
						{#if event.options && event.options.length > 0}
							<div class="flex flex-wrap gap-1 mt-2">
								{#each event.options as opt}
									<span class="text-[9px] px-1.5 py-0.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/70">{opt.title}</span>
								{/each}
							</div>
						{/if}
					</div>

					{#if expandedEvent === event.id}
						<div class="border-t border-[#c8aa6e]/5">
							{#if event.options && event.options.length > 0}
								<div class="p-4 space-y-3">
									<span class="text-[9px] text-emerald-400/60 uppercase tracking-widest font-bold">{$t('sts2.eventsPage.choices')}</span>
									{#each event.options as opt, i}
										<div class="p-3 bg-white/[0.02] border border-white/5">
											<div class="flex items-start gap-2">
												<span class="text-[10px] text-emerald-400 font-bold shrink-0">{i + 1}.</span>
												<div class="min-w-0">
													<p class="text-xs text-gray-200 font-medium">{opt.title}</p>
													{#if opt.description}
														<p class="text-[11px] text-gray-500 mt-1">{@html parseColoredText(opt.description)}</p>
													{/if}
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}
							{#if event.pages && event.pages.filter(p => p.description && p.id !== 'INITIAL').length > 0}
								<div class="px-4 pb-4 space-y-2">
									<span class="text-[9px] text-emerald-400/60 uppercase tracking-widest font-bold">{$t('sts2.eventsPage.outcomes')}</span>
									{#each event.pages.filter(p => p.description && p.id !== 'INITIAL') as page}
										<div class="p-3 bg-white/[0.02] border border-white/5">
											<span class="text-[9px] text-gray-600 uppercase tracking-wider font-bold">{page.id.replace(/_/g, ' ')}</span>
											<p class="text-[11px] text-gray-400 leading-relaxed mt-1">{@html parseColoredText(page.description)}</p>
											{#if page.options && page.options.length > 0}
												<div class="mt-2 space-y-1 pl-3 border-l border-[#c8aa6e]/10">
													{#each page.options as subOpt}
														<div>
															<span class="text-[10px] font-bold text-gray-300">{subOpt.title}</span>
															{#if subOpt.description}
																<span class="text-[10px] text-gray-500 ml-1">{@html parseColoredText(subOpt.description)}</span>
															{/if}
														</div>
													{/each}
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
		{#if filteredEvents.length === 0}
			<div class="text-center py-20">
				<p class="text-gray-500 text-sm">{$t('sts2.eventsPage.noMatch')}</p>
			</div>
		{/if}
		{/if}

		<!-- Enchantments Tab -->
		{#if activeTab === 'enchantments'}
		<div class="mb-6">
			<div class="relative">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
				<input
					type="text"
					value={searchRaw}
					on:input={handleSearch}
					placeholder={$t('sts2.enchantmentsPage.searchPlaceholder')}
					class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.14)] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors"
				/>
			</div>
		</div>
		<div class="flex items-center gap-3 mb-6 flex-wrap">
			<p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{filteredEnchantments.length} / {allEnchantments.length} {$t('sts2.enchantmentsPage.title')}</p>
			<div class="flex gap-2">
				<button
					on:click={() => filterEnchantType = ''}
					class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all {filterEnchantType === '' ? 'border-purple-500/50 bg-purple-500/10 text-purple-400' : 'border-[#c8aa6e]/10 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
				>{$t('sts2.common.all')}</button>
				{#each enchantTypes as eType}
					<button
						on:click={() => filterEnchantType = eType}
						class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all {filterEnchantType === eType ? 'border-purple-500/50 bg-purple-500/10 text-purple-400' : 'border-[#c8aa6e]/10 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
					>{eType}</button>
				{/each}
			</div>
			{#if filterEnchantType || search}
				<button on:click={() => { clearFilters(); filterEnchantType = ''; }} class="text-[10px] text-gray-600 hover:text-red-400 transition-colors uppercase tracking-wider font-bold">{$t('sts2.cardsPage.clearAll')}</button>
			{/if}
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{#each filteredEnchantments as ench (ench.id)}
				<div class="group rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.08)] hover:border-purple-500/30 transition-all overflow-hidden">
					<div class="p-4">
						<div class="flex items-start justify-between gap-2 mb-2">
							<h4 class="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{ench.name}</h4>
							<div class="flex items-center gap-1.5 shrink-0">
								{#if ench.is_stackable}
									<span class="text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{$t('sts2.enchantmentsPage.stackable')}</span>
								{/if}
								<span class="text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 border {ench.card_type === 'Universal' ? 'bg-[#c8aa6e]/10 border-[#c8aa6e]/20 text-[#c8aa6e]' : ench.card_type === 'Attack only' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}">{ench.card_type}</span>
							</div>
						</div>
						<p class="text-[11px] text-gray-400 leading-relaxed mb-2">{ench.description}</p>
						{#if ench.extra_card_text}
							<div class="p-2 bg-purple-500/5 border border-purple-500/10">
								<span class="text-[9px] text-purple-400/60 uppercase tracking-widest font-bold">{$t('sts2.enchantmentsPage.cardText')}</span>
								<p class="text-[11px] text-purple-300/80 mt-0.5">{ench.extra_card_text}</p>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		{#if filteredEnchantments.length === 0}
			<div class="text-center py-20">
				<p class="text-gray-500 text-sm">{$t('sts2.enchantmentsPage.noMatch')}</p>
			</div>
		{/if}
		{/if}

		<!-- Powers Tab -->
		{#if activeTab === 'powers'}
		<div class="mb-6">
			<div class="relative">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
				<input
					type="text"
					value={searchRaw}
					on:input={handleSearch}
					placeholder={$t('sts2.powersTab.searchPlaceholder')}
					class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.14)] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c8aa6e]/45 transition-colors"
				/>
			</div>
		</div>
		<div class="flex items-center gap-3 mb-6 flex-wrap">
			<p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{filteredPowers.length} / {allPowers.length} {$t('sts2.powersTab.powersCount')}</p>
			<div class="flex gap-2">
				<button
					on:click={() => filterPowerType = ''}
					class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all {filterPowerType === '' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-[#c8aa6e]/10 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
				>{$t('sts2.common.all')}</button>
				<button
					on:click={() => filterPowerType = 'Buff'}
					class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all {filterPowerType === 'Buff' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-[#c8aa6e]/10 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
				>{$t('sts2.powersTab.buff')}</button>
				<button
					on:click={() => filterPowerType = 'Debuff'}
					class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all {filterPowerType === 'Debuff' ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-[#c8aa6e]/10 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
				>{$t('sts2.powersTab.debuff')}</button>
				<button
					on:click={() => filterPowerType = 'Special'}
					class="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border transition-all {filterPowerType === 'Special' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-[#c8aa6e]/10 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/25'}"
				>{$t('sts2.powersTab.special')}</button>
			</div>
			{#if filterPowerType || search}
				<button on:click={() => { clearFilters(); filterPowerType = ''; }} class="text-[10px] text-gray-600 hover:text-red-400 transition-colors uppercase tracking-wider font-bold">{$t('sts2.cardsPage.clearAll')}</button>
			{/if}
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{#each filteredPowers as power (power.id)}
				<div class="group rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.08)] hover:border-amber-500/30 transition-all overflow-hidden">
					<div class="p-4 flex items-start gap-3">
						{#if power.image_url}
							<div class="w-10 h-10 shrink-0 bg-black/40 border border-[#c8aa6e]/10 overflow-hidden flex items-center justify-center">
								<img src={getImageUrl(power.image_url)} alt={power.name} class="w-8 h-8 object-contain" loading="lazy" decoding="async" />
							</div>
						{:else}
							<div class="w-10 h-10 shrink-0 bg-amber-500/5 border border-amber-500/10 flex items-center justify-center">
								<svg class="w-5 h-5 text-amber-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
								</svg>
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2 mb-1">
								<h4 class="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{power.name}</h4>
								<span class="text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 border shrink-0 {power.type === 'Buff' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : power.type === 'Debuff' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}">{power.type}</span>
							</div>
							<p class="text-[11px] text-gray-400 leading-relaxed">{@html parseDescription(power.description || '')}</p>
							{#if power.stack_type && power.stack_type !== 'Single'}
								<span class="mt-1.5 inline-block text-[9px] text-gray-600 uppercase tracking-wider">{power.stack_type}</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
		{#if filteredPowers.length === 0}
			<div class="text-center py-20">
				<p class="text-gray-500 text-sm">{$t('sts2.powersTab.noMatch')}</p>
			</div>
		{/if}
		{/if}
		</div>

		<!-- Bottom spacer for mobile nav -->
		<div class="h-20 sm:hidden"></div>
		<div class="hidden sm:block h-4"></div>
</div>

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
	.scrollbar-hide::-webkit-scrollbar { display: none; }
	.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
