<script>
	import { CHARACTER_THEMES, CARD_TYPE_COLORS, RARITY_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { TIER_LIST_DATA, POTION_TIER_DATA, RELIC_TIER_DATA } from '$lib/sts2/data/guides';
	import { parseDescription } from '$lib/sts2/utils/cardFilters';
	import { showCardHover, updateHoverPosition, hideCardHover } from '$lib/sts2/stores/cardHoverStore';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t } from 'svelte-i18n';
	import { addCard } from '$lib/sts2/stores/deckStore';
	import { getContext, onMount } from 'svelte';
	import { nanoid } from 'nanoid';

	export let data;

	const localizedCards = getContext('localizedCards');

	const TIER_COLORS = {
		S: { bg: 'bg-red-500/10', border: 'border-red-500/25', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
		A: { bg: 'bg-orange-500/8', border: 'border-orange-500/20', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
		B: { bg: 'bg-yellow-500/8', border: 'border-yellow-500/15', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
		C: { bg: 'bg-blue-500/8', border: 'border-blue-500/15', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
		D: { bg: 'bg-gray-500/8', border: 'border-gray-500/10', text: 'text-gray-400', badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
	};

	$: TIER_DESCRIPTIONS = {
		S: $t('sts2.tierListPage.mustPick'),
		A: $t('sts2.tierListPage.excellent'),
		B: $t('sts2.tierListPage.good'),
		C: $t('sts2.tierListPage.situational'),
		D: $t('sts2.tierListPage.weak')
	};

	// Tab state
	let activeTab = 'cards'; // 'cards' | 'potions' | 'relics'
	let search = '';

	// Cards tab state
	let selectedChar = 'ironclad';
	let addedCards = new Set();

	// Relics tab filter
	let relicPool = ''; // '' = all, 'shared', or character name

	// Vote state
	let sessionId = '';
	let votes = {};   // { ITEM_ID: { S, A, B, C, D, total, community_tier } }
	let myVotes = {}; // { ITEM_ID: tier }
	let votingItem = null;
	let votingInFlight = new Set();
	let votesLoaded = false;

	$: theme = CHARACTER_THEMES[selectedChar];
	$: allCards = $localizedCards || data.cards || [];
	$: characters = data.characters || [];
	$: allPotions = data.potions || [];
	$: allRelics = data.relics || [];

	// Voting namespace per tab
	$: voteNamespace = activeTab === 'cards' ? selectedChar : activeTab === 'potions' ? 'potion' : 'relic';

	function findCard(id) { return allCards.find(c => c.id === id); }
	function findPotion(id) { return allPotions.find(p => p.id === id); }
	function findRelic(id) { return allRelics.find(r => r.id === id); }
	$: costDisplay = (card) => card?.is_x_cost ? 'X' : (card?.star_cost != null ? `★${card.star_cost}` : card?.cost ?? '?');

	// ---- CARD TIER IDS ----
	$: cardTierData = TIER_LIST_DATA.cards[selectedChar] || {};
	$: filteredCardIds = (tier) => {
		const ids = cardTierData[tier] || [];
		if (!search.trim()) return ids;
		const q = search.toLowerCase();
		return ids.filter(id => findCard(id)?.name.toLowerCase().includes(q));
	};

	// ---- POTION TIER IDS ----
	$: filteredPotionIds = (tier) => {
		const ids = POTION_TIER_DATA[tier] || [];
		if (!search.trim()) return ids;
		const q = search.toLowerCase();
		return ids.filter(id => findPotion(id)?.name.toLowerCase().includes(q));
	};

	// ---- RELIC TIER IDS ----
	$: filteredRelicIds = (tier) => {
		let ids = RELIC_TIER_DATA[tier] || [];
		if (relicPool) ids = ids.filter(id => {
			const r = findRelic(id);
			return relicPool === 'shared' ? r?.pool === 'shared' || !r?.pool : r?.pool === relicPool;
		});
		if (!search.trim()) return ids;
		const q = search.toLowerCase();
		return ids.filter(id => findRelic(id)?.name.toLowerCase().includes(q));
	};

	// ---- COMMUNITY BLEND ALGORITHM ----
	// Editor opinion = EDITOR_WEIGHT virtual votes. Cards need MIN_VOTES to start moving.
	const TIER_VALUES = { S: 5, A: 4, B: 3, C: 2, D: 1 };
	const EDITOR_WEIGHT = 15;
	const MIN_VOTES_TO_MOVE = 5;

	function computeEffectiveTier(itemId, editorTier) {
		const v = votes[itemId];
		if (!v || v.total < MIN_VOTES_TO_MOVE) return editorTier;
		const es = TIER_VALUES[editorTier];
		const cs = ['S','A','B','C','D'].reduce((s, t) => s + TIER_VALUES[t] * (v[t] || 0), 0) / v.total;
		const score = (es * EDITOR_WEIGHT + cs * v.total) / (EDITOR_WEIGHT + v.total);
		if (score >= 4.5) return 'S';
		if (score >= 3.5) return 'A';
		if (score >= 2.5) return 'B';
		if (score >= 1.5) return 'C';
		return 'D';
	}

	// itemId -> editor tier for current tab/char (no search filter)
	$: editorTierMap = (() => {
		const map = {};
		const tiers = ['S','A','B','C','D'];
		if (activeTab === 'cards') {
			for (const t of tiers) for (const id of (cardTierData[t] || [])) map[id] = t;
		} else if (activeTab === 'potions') {
			for (const t of tiers) for (const id of (POTION_TIER_DATA[t] || [])) map[id] = t;
		} else {
			for (const t of tiers) for (const id of (RELIC_TIER_DATA[t] || [])) map[id] = t;
		}
		return map;
	})();

	// Group items by effective tier (blended editor + community votes)
	$: activeTiers = (() => {
		const _votes = votes; // ensure Svelte tracks votes as dependency
		const groups = { S: [], A: [], B: [], C: [], D: [] };
		for (const t of ['S','A','B','C','D']) {
			const ids = activeTab === 'cards' ? filteredCardIds(t)
				: activeTab === 'potions' ? filteredPotionIds(t)
				: filteredRelicIds(t);
			for (const id of ids) {
				groups[computeEffectiveTier(id, t)].push(id);
			}
		}
		return (tier) => groups[tier] || [];
	})();

	onMount(() => {
		let sid = localStorage.getItem('sts2_vote_session');
		if (!sid) { sid = nanoid(); localStorage.setItem('sts2_vote_session', sid); }
		sessionId = sid;
		loadVotes();
	});

	async function loadVotes() {
		if (!sessionId || !voteNamespace) return;
		votesLoaded = false;
		try {
			const res = await fetch(`/api/tier-votes?character=${voteNamespace}&session=${sessionId}`);
			const d = await res.json();
			votes = d.votes || {};
			myVotes = d.myVotes || {};
		} catch (e) {}
		votesLoaded = true;
	}

	$: if (voteNamespace && sessionId) loadVotes();

	function switchTab(tab) {
		activeTab = tab;
		search = '';
		votes = {};
		myVotes = {};
		votesLoaded = false;
		votingItem = null;
	}

	function handleCharChange(charId) {
		selectedChar = charId;
		votingItem = null;
		votes = {};
		myVotes = {};
		votesLoaded = false;
	}

	async function submitVote(itemId, tier) {
		if (votingInFlight.has(itemId)) return;
		votingInFlight = new Set([...votingInFlight, itemId]);
		votingItem = null;

		const prev = myVotes[itemId];
		myVotes = { ...myVotes, [itemId]: tier };
		const pv = votes[itemId] ? { ...votes[itemId] } : { S:0,A:0,B:0,C:0,D:0,total:0 };
		if (prev) { pv[prev] = Math.max(0,(pv[prev]||0)-1); pv.total = Math.max(0,pv.total-1); }
		pv[tier] = (pv[tier]||0)+1; pv.total = (pv.total||0)+1;
		pv.community_tier = ['S','A','B','C','D'].reduce((b,t) => pv[t]>pv[b]?t:b,'S');
		votes = { ...votes, [itemId]: pv };

		try {
			const res = await fetch('/api/tier-votes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ card_id: itemId, character: voteNamespace, tier, session_id: sessionId })
			});
			const result = await res.json();
			console.log('[vote] POST status:', res.status, 'result:', result, 'session:', sessionId);
			if (!res.ok) {
				console.error('[vote] POST failed:', result);
				myVotes = { ...myVotes, [itemId]: prev };
				votes = { ...votes, [itemId]: votes[itemId] || null };
			} else if (result.counts) {
				votes = { ...votes, [itemId]: result.counts };
			}
		} catch (e) {
			console.error('[vote] fetch error:', e);
			myVotes = { ...myVotes, [itemId]: prev };
		}

		votingInFlight.delete(itemId);
		votingInFlight = new Set(votingInFlight);
	}

	function handleAddCard(card) {
		addCard(card);
		addedCards = new Set([...addedCards, card.id]);
		setTimeout(() => { addedCards.delete(card.id); addedCards = new Set(addedCards); }, 1500);
	}

	function handleOutsideClick(e) {
		if (votingItem && !e.target.closest('.vote-popover') && !e.target.closest('.vote-btn')) votingItem = null;
	}

	$: totalVotes = Object.values(votes).reduce((sum, v) => sum + (v.total||0), 0);

	const RARITY_COLORS_LOCAL = {
		Common: 'text-gray-400', Uncommon: 'text-blue-400', Rare: 'text-yellow-400',
		Shop: 'text-green-400', Event: 'text-purple-400', Ancient: 'text-red-400',
		Starter: 'text-gray-500', Token: 'text-gray-600'
	};
</script>

<svelte:head>
	<title>{$t('sts2.seo.tierListTitle')}</title>
	<meta name="description" content={$t('sts2.seo.tierListDesc')}>
	<meta name="keywords" content={$t('sts2.seo.tierListKeywords')}>
	<link rel="canonical" href="https://STS2_DOMAIN/tier-list">
	<meta property="og:title" content={$t('sts2.seo.tierListTitle')}>
	<meta property="og:description" content={$t('sts2.seo.tierListDesc')}>
	<meta property="og:type" content="website">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:url" content="https://STS2_DOMAIN/tier-list">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ggez.gg" },
			{ "@type": "ListItem", "position": 2, "name": "Slay the Spire 2", "item": "https://STS2_DOMAIN" },
			{ "@type": "ListItem", "position": 3, "name": "Tier List", "item": "https://STS2_DOMAIN/tier-list" }
		]
	})}</script>`}
</svelte:head>

<svelte:window on:click={handleOutsideClick} />

<div class="relative z-10 min-h-screen bg-[#0a0a0f]">
	<!-- Top Bar -->
	<div class="sticky top-11 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[#c8aa6e]/10">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
			<a href="/" class="text-sm text-[#c8aa6e]/80 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0 hidden sm:inline">GGEZ.GG</a>
			<span class="text-[#c8aa6e]/20 shrink-0 hidden sm:inline">/</span>
			<a href="/" class="text-sm text-gray-400 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0">StS2</a>
			<span class="text-[#c8aa6e]/20 shrink-0">/</span>
			<span class="text-sm font-bold tracking-[2px] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#c8aa6e] to-[#f1ede3] shrink-0">{$t('sts2.tierList')}</span>
			<div class="ml-auto flex items-center gap-2 shrink-0">
				<a href="/game-database" class="hidden sm:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">{$t('sts2.nav.cards')}</a>
				<a href="/guides" class="hidden sm:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">{$t('sts2.guides')}</a>
			</div>
		</div>
	</div>

	<div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
		<!-- Header -->
		<div class="mb-8 border-b border-[#c8aa6e]/10 pb-6">
			<div class="flex items-center gap-3 mb-3">
				<h1 class="text-3xl md:text-4xl font-bold text-white tracking-wider">{$t('sts2.tierList')}</h1>
				<span class="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border border-[#c8aa6e]/20 text-[#c8aa6e]/60">{$t('sts2.tierListPage.earlyAccess')}</span>
			</div>
			<p class="text-gray-400 text-sm tracking-wide max-w-2xl mb-4">{$t('sts2.tierListDesc')}</p>
			<div class="flex items-start gap-3 p-4 border border-[#c8aa6e]/[0.12] bg-[#c8aa6e]/[0.03]">
				<svg class="w-4 h-4 text-[#c8aa6e]/50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
				<p class="text-xs text-gray-500 leading-relaxed"><span class="text-gray-300">{$t('sts2.tierListPage.infoHandCurated')}</span> <span class="text-[#c8aa6e]/80 font-medium">{$t('sts2.tierListPage.infoCommunityVoting')}</span> {$t('sts2.tierListPage.infoVoteDesc')}</p>
			</div>
		</div>

		<!-- Tabs -->
		<div class="flex gap-0 mb-8 border-b border-[#c8aa6e]/10">
			{#each [['cards', $t('sts2.nav.cards')], ['potions', $t('sts2.nav.potions')], ['relics', $t('sts2.nav.relics')]] as [tab, label]}
				<button
					on:click={() => switchTab(tab)}
					class="px-5 py-2.5 text-sm font-bold tracking-wider uppercase transition-all border-b-2 -mb-px {activeTab === tab ? 'text-[#c8aa6e] border-[#c8aa6e]' : 'text-gray-500 border-transparent hover:text-gray-300'}"
				>{label}</button>
			{/each}
		</div>

		<!-- Vote Counter -->
		<div class="flex items-center gap-2 mb-6">
			<svg class="w-3.5 h-3.5 text-[#c8aa6e]/50" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
			<span class="text-[10px] text-[#c8aa6e]/60 uppercase tracking-widest font-bold">{$t('sts2.tierListPage.communityRating')}</span>
			{#if votesLoaded && totalVotes > 0}
				<span class="text-[10px] text-gray-600">·</span>
				<span class="text-[10px] text-gray-500">{totalVotes} {$t('sts2.tierListPage.votesCast')}</span>
			{/if}
		</div>

		<!-- Cards: Character Selector -->
		{#if activeTab === 'cards'}
			<div class="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center scrollbar-hide">
				{#each characters as char}
					{@const charTheme = CHARACTER_THEMES[char.id.toLowerCase()]}
					{@const isActive = selectedChar === char.id.toLowerCase()}
					<button
						on:click={() => handleCharChange(char.id.toLowerCase())}
						class="group flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 border transition-all duration-200 shrink-0 {isActive ? '' : 'border-[#c8aa6e]/10 hover:border-[#c8aa6e]/30 opacity-60 hover:opacity-90'}"
						style="{isActive ? `border-color: ${charTheme?.color}50; background: ${charTheme?.color}10; color: ${charTheme?.color}` : ''}"
					>
						{#if char.image_url}
							<img src={getImageUrl(char.image_url, 40)} alt={char.name} class="w-6 h-6 sm:w-7 sm:h-7 object-cover object-top" loading="lazy" decoding="async" />
						{/if}
						<span class="text-xs sm:text-sm font-bold tracking-wider {isActive ? '' : 'text-gray-400'}">{char.name}</span>
					</button>
				{/each}
			</div>
		{/if}

		<!-- Relics: Pool Filter -->
		{#if activeTab === 'relics'}
			<div class="flex gap-2 mb-6 flex-wrap">
				{#each [['', 'All'], ['shared', 'Shared'], ['ironclad', 'Ironclad'], ['silent', 'Silent'], ['defect', 'Defect'], ['necrobinder', 'Necrobinder'], ['regent', 'Regent']] as [pool, label]}
					{@const theme = pool && pool !== 'shared' ? CHARACTER_THEMES[pool] : null}
					<button
						on:click={() => relicPool = pool}
						class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all {relicPool === pool ? '' : 'border-[#c8aa6e]/10 text-gray-500 hover:border-[#c8aa6e]/25 hover:text-gray-300 opacity-70'}"
						style="{relicPool === pool ? `border-color: ${theme?.color || '#c8aa6e'}50; background: ${theme?.color || '#c8aa6e'}10; color: ${theme?.color || '#c8aa6e'}` : ''}"
					>{label}</button>
				{/each}
			</div>
		{/if}

		<!-- Search -->
		<div class="relative mb-6">
			<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
			<input type="text" bind:value={search} placeholder={$t('sts2.tierListPage.search')} class="w-full pl-10 pr-4 py-2.5 bg-[#161620] border border-[#c8aa6e]/15 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c8aa6e]/40 transition-colors" />
			{#if search}
				<button on:click={() => search = ''} class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs">✕</button>
			{/if}
		</div>

		<!-- Tier List -->
		<div class="space-y-6">
			{#each ['S', 'A', 'B', 'C', 'D'] as tier}
				{@const tierStyle = TIER_COLORS[tier]}
				{@const tierIds = activeTiers(tier)}
				{#if tierIds && tierIds.length > 0}
					<div class="border border-[#c8aa6e]/10 bg-[#161620]">
						<div class="flex items-center gap-4 px-5 py-3 border-b border-[#c8aa6e]/10">
							<span class="text-3xl md:text-4xl font-bold {tierStyle.text} w-10 text-center">{tier}</span>
							<span class="flex-1 text-xs text-gray-400 font-medium tracking-wide">{TIER_DESCRIPTIONS[tier]}</span>
							<span class="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{tierIds.length}</span>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#c8aa6e]/5">
							{#each tierIds as itemId}
								{@const card = activeTab === 'cards' ? findCard(itemId) : null}
								{@const potion = activeTab === 'potions' ? findPotion(itemId) : null}
								{@const relic = activeTab === 'relics' ? findRelic(itemId) : null}
								{@const item = card || potion || relic}
								{#if item}
									{@const cardVotes = votes[itemId]}
									{@const myVote = myVotes[itemId]}
									{@const communityTier = cardVotes?.community_tier}
									{@const totalItemVotes = cardVotes?.total || 0}
									{@const showingVoteUI = votingItem === itemId}
									{@const editorTier = editorTierMap[itemId]}
									{@const movedByVotes = editorTier && editorTier !== tier}
									{@const typeStyle = card ? (CARD_TYPE_COLORS[card.type] || CARD_TYPE_COLORS.Attack) : null}
									<div
										class="group relative flex items-center gap-3 p-3 bg-[#161620] hover:bg-[#1d1d29] transition-colors"
										on:mouseenter={(e) => card && showCardHover(card, e)}
										on:mousemove={(e) => card && updateHoverPosition(e)}
										on:mouseleave={() => card && hideCardHover()}
									>
										<!-- Item Image -->
										<div class="w-14 h-14 sm:w-16 sm:h-16 overflow-hidden shrink-0 border border-[#c8aa6e]/15 {activeTab === 'potions' ? 'rounded' : ''}">
											{#if item.image_url}
												<img src={getImageUrl(item.image_url, 120)} alt={item.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
											{:else}
												<div class="w-full h-full bg-gray-900 flex items-center justify-center">
													<span class="text-[9px] text-gray-600 uppercase">{activeTab === 'potions' ? 'Pot' : activeTab === 'relics' ? 'Relic' : item.type?.[0]}</span>
												</div>
											{/if}
										</div>

										<!-- Item Info -->
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2 flex-wrap">
												<h5 class="text-sm font-bold text-white group-hover:text-[#c8aa6e] transition-colors truncate">{item.name}</h5>
												{#if movedByVotes}
													<span class="px-1.5 py-0.5 text-[8px] font-bold border border-gray-500/25 text-gray-400" title={$t('sts2.tierListPage.editorTierTitle', { values: { tier: editorTier } })}>{$t('sts2.tierListPage.editorLabel', { values: { tier: editorTier } })}</span>
												{:else if communityTier && communityTier !== tier && totalItemVotes >= 5}
													<span class="px-1.5 py-0.5 text-[8px] font-bold border {TIER_COLORS[communityTier].badge}" title={$t('sts2.tierListPage.communityTrend', { values: { tier: communityTier } })}>→ {communityTier}</span>
												{/if}
											</div>

											{#if card}
												<div class="flex items-center gap-1.5 mt-0.5 text-[10px]">
													<span class="{typeStyle.text} uppercase font-bold tracking-wider">{card.type}</span>
													<span class="text-gray-700">·</span>
													<span class="text-gray-500">{card.rarity}</span>
													<span class="text-gray-700">·</span>
													<span class="text-gray-500">{costDisplay(card)}</span>
													{#if totalItemVotes > 0}<span class="text-gray-700">·</span><span class="text-[#c8aa6e]/50">★ {totalItemVotes}</span>{/if}
												</div>
											{:else if potion || relic}
												<div class="flex items-center gap-1.5 mt-0.5 text-[10px]">
													<span class="{RARITY_COLORS_LOCAL[item.rarity] || 'text-gray-500'} uppercase font-bold tracking-wider">{item.rarity}</span>
													{#if totalItemVotes > 0}<span class="text-gray-700">·</span><span class="text-[#c8aa6e]/50">★ {totalItemVotes}</span>{/if}
														{#if relic?.pool && relic.pool !== 'shared'}
														<span class="text-gray-700">·</span>
														<span class="text-gray-500 capitalize">{relic.pool}</span>
													{/if}
												</div>
												<p class="text-[10px] text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{@html item.description?.replace(/\[gold\](.*?)\[\/gold\]/g, '<span class="text-yellow-400/80">$1</span>').replace(/\[blue\](.*?)\[\/blue\]/g, '<span class="text-blue-400/80">$1</span>') || ''}</p>
											{/if}
										</div>

										<!-- Vote controls -->
										<div class="flex items-center gap-1 shrink-0 relative">
											<div class="relative vote-btn">
												<div class="flex flex-col items-center gap-0.5">
													<button
														on:click|stopPropagation={() => votingItem = showingVoteUI ? null : itemId}
														class="w-7 h-7 flex items-center justify-center border transition-all text-[10px] font-bold {myVote ? `${TIER_COLORS[myVote].badge} border-opacity-60` : 'border-[#c8aa6e]/30 hover:border-[#c8aa6e]/60 text-gray-400 hover:text-[#c8aa6e]'}"
														title={myVote ? `Your community rating: ${myVote} — click to change` : 'Rate for community'}
													>
														{#if myVote}{myVote}{:else}
															<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
														{/if}
													</button>
													
												</div>
												{#if showingVoteUI}
													<div class="vote-popover absolute right-0 bottom-full mb-1 z-50 flex gap-1 p-1.5 bg-[#0f0f18] border border-[#c8aa6e]/20 shadow-xl shadow-black/60">
														{#each ['S','A','B','C','D'] as t}
															<button
																on:click|stopPropagation={() => submitVote(itemId, t)}
																class="w-8 h-8 flex items-center justify-center font-bold text-sm border transition-all {myVote === t ? TIER_COLORS[t].badge : 'border-transparent text-gray-500 hover:' + TIER_COLORS[t].text + ' hover:border-white/10'}"
															>{t}</button>
														{/each}
													</div>
												{/if}
											</div>

											{#if card}
												<a href="/synergies?card={card.id}&char={selectedChar}" class="w-7 h-7 flex items-center justify-center border border-[#c8aa6e]/15 hover:border-[#c8aa6e]/40 text-gray-500 hover:text-[#c8aa6e] transition-all" title="Synergies" on:mouseenter={hideCardHover}>
													<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
												</a>
												<button on:click|stopPropagation={() => handleAddCard(card)} class="w-7 h-7 flex items-center justify-center border transition-all {addedCards.has(card.id) ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-[#c8aa6e]/15 hover:border-[#c8aa6e]/40 text-gray-500 hover:text-[#c8aa6e]'}" title={addedCards.has(card.id) ? 'Added!' : 'Add to deck'}>
													{#if addedCards.has(card.id)}
														<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
													{:else}
														<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
													{/if}
												</button>
											{/if}
										</div>

										<div class="absolute bottom-0 left-0 w-full h-px bg-[#c8aa6e] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>

		<!-- CTA -->
		{#if activeTab === 'cards'}
		<div class="flex items-center justify-center py-6">
			<a href="/build" class="flex items-center gap-2 px-6 py-3 border border-[#c8aa6e]/40 hover:border-[#c8aa6e] bg-[#c8aa6e]/10 hover:bg-[#c8aa6e]/15 text-[#c8aa6e] text-xs font-bold tracking-wider uppercase transition-all">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
				Open Deck Builder →
			</a>
		</div>
		{/if}

		<!-- Navigation -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-10 mt-6 border-t border-[#c8aa6e]/10">
			<a href="/guides" class="text-sm text-gray-500 hover:text-[#c8aa6e] transition-colors font-medium tracking-wider">← {$t('sts2.guides')}</a>
			<a href="/synergies" class="inline-flex items-center gap-2 px-5 py-2.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] font-bold tracking-wider transition-all">{$t('sts2.synergyExplorer')}</a>
		</div>
	</div>

	<div class="h-16 sm:hidden"></div>
</div>

<MobileNav />

<style>
	.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
	.scrollbar-hide::-webkit-scrollbar { display: none; }
	.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
