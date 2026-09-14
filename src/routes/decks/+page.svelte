<script>
	import { CHARACTER_THEMES, CARD_TYPE_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { showCardHover, updateHoverPosition, hideCardHover } from '$lib/sts2/stores/cardHoverStore';
	import { loadCardsByIds } from '$lib/sts2/stores/deckStore';
	import { goto } from '$app/navigation';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t } from 'svelte-i18n';

	export let data;

	$: characters = data.characters || [];
	$: allCards = data.cards || [];
	$: user = data.user;

	function findCard(id) {
		return allCards.find(c => c.id === id);
	}

	let decks = [];
	let loading = true;
	let selectedCharacter = '';
	let sortBy = 'votes';

	async function fetchDecks() {
		loading = true;
		const params = new URLSearchParams();
		if (selectedCharacter) params.set('character', selectedCharacter);
		params.set('sort', sortBy);

		try {
			const res = await fetch(`/api/decks?${params}`);
			const json = await res.json();
			decks = json.decks || [];
		} catch (e) {
			console.error('Failed to fetch decks:', e);
			decks = [];
		}
		loading = false;
	}

	// Fetch on mount and when filters change
	$: selectedCharacter, sortBy, fetchDecks();

	async function toggleVote(deck) {
		if (!user) return;
		try {
			const res = await fetch(`/api/decks/${deck.id}/vote`, { method: 'POST' });
			const json = await res.json();
			if (res.ok) {
				deck.votes = json.votes;
				deck.userVoted = json.voted;
				decks = [...decks]; // trigger reactivity
			}
		} catch (e) {
			console.error('Vote failed:', e);
		}
	}

	function openInBuilder(deck) {
		const charObj = characters.find(c => c.id.toLowerCase() === deck.characterId);
		loadCardsByIds(charObj, deck.cardIds, allCards);
		goto('/build');
	}

	function getCharName(id) {
		return CHARACTER_THEMES[id]?.name || id;
	}

	$: isAdmin = user?.username === 'admin2';

	let deleteConfirm = null;

	async function deleteDeck(deck) {
		if (deleteConfirm !== deck.id) {
			deleteConfirm = deck.id;
			setTimeout(() => { deleteConfirm = null; }, 3000);
			return;
		}
		try {
			const res = await fetch(`/api/decks/${deck.id}`, { method: 'DELETE' });
			if (res.ok) {
				decks = decks.filter(d => d.id !== deck.id);
			}
		} catch (e) {
			console.error('Delete failed:', e);
		}
		deleteConfirm = null;
	}

	let copiedId = null;

	function shareDeck(deck) {
		const url = `${window.location.origin}/sts2/decks?deck=${deck.id}`;
		navigator.clipboard.writeText(url).then(() => {
			copiedId = deck.id;
			setTimeout(() => { copiedId = null; }, 2000);
		});
	}
</script>

<svelte:head>
	<title>{$t('sts2.seo.decksTitle')}</title>
	<meta name="description" content={$t('sts2.seo.decksDesc')}>
	<meta name="keywords" content={$t('sts2.seo.decksKeywords')}>
	<link rel="canonical" href="https://STS2_DOMAIN/decks">
	<meta property="og:title" content={$t('sts2.seo.decksTitle')}>
	<meta property="og:description" content={$t('sts2.seo.decksDesc')}>
	<meta property="og:type" content="website">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:url" content="https://STS2_DOMAIN/decks">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={$t('sts2.seo.decksTitle')}>
	<meta name="twitter:description" content={$t('sts2.seo.decksDesc')}>
</svelte:head>

<div class="relative z-10 min-h-screen bg-[#0a0a0f]">
	<!-- Top Bar -->
	<div class="sticky top-11 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[#c8aa6e]/10">
		<div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
			<a href="/" class="text-sm text-[#c8aa6e]/80 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0 hidden sm:inline">GGEZ.GG</a>
			<span class="text-[#c8aa6e]/20 shrink-0 hidden sm:inline">/</span>
			<a href="/" class="text-sm text-gray-400 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0">StS2</a>
			<span class="text-[#c8aa6e]/20 shrink-0">/</span>
			<span class="text-sm font-bold tracking-[2px] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#c8aa6e] to-[#f1ede3] shrink-0">{$t('sts2.communityDecks')}</span>

			<div class="ml-auto flex items-center gap-2 shrink-0">
				<a href="/build" class="hidden sm:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.deckBuilder')}
				</a>
				<a href="/guides" class="hidden sm:inline-flex px-3 py-1.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] transition-all font-medium tracking-wider">
					{$t('sts2.guides')}
				</a>
			</div>
		</div>
	</div>

	<div class="max-w-6xl mx-auto px-4 py-10">
		<!-- Header -->
		<div class="mb-8 border-b border-[#c8aa6e]/10 pb-6">
			<h1 class="text-3xl md:text-4xl font-bold text-white tracking-wider mb-2">
				{$t('sts2.decksPage.title')}
			</h1>
			<p class="text-gray-400 text-sm tracking-wide">{$t('sts2.decksPage.subtitle')}</p>
		</div>

		<!-- Filters -->
		<div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 mb-8">
			<!-- Character filter -->
			<div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide">
				<button
					on:click={() => selectedCharacter = ''}
					class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all shrink-0 {selectedCharacter === '' ? 'border-[#c8aa6e]/60 text-[#c8aa6e] bg-[#c8aa6e]/10' : 'border-[#c8aa6e]/15 text-gray-500 hover:text-gray-300 hover:border-[#c8aa6e]/30'}"
				>
					{$t('sts2.decksPage.allCharacters')}
				</button>
				{#each ['ironclad','silent','defect','necrobinder','regent'] as charId}
					{@const theme = CHARACTER_THEMES[charId]}
					<button
						on:click={() => selectedCharacter = charId}
						class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all shrink-0"
						style={selectedCharacter === charId ? `border-color: ${theme.color}60; color: ${theme.color}; background: ${theme.color}15` : `border-color: ${theme.color}20; color: ${theme.color}60`}
					>
						{theme.name}
					</button>
				{/each}
			</div>

			<div class="flex items-center gap-2 sm:ml-auto">
				<button
					on:click={() => sortBy = 'votes'}
					class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all {sortBy === 'votes' ? 'border-[#c8aa6e]/50 text-[#c8aa6e]' : 'border-[#c8aa6e]/15 text-gray-500 hover:text-gray-300'}"
				>
					{$t('sts2.decksPage.topVoted')}
				</button>
				<button
					on:click={() => sortBy = 'newest'}
					class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all {sortBy === 'newest' ? 'border-[#c8aa6e]/50 text-[#c8aa6e]' : 'border-[#c8aa6e]/15 text-gray-500 hover:text-gray-300'}"
				>
					{$t('sts2.decksPage.newest')}
				</button>
			</div>
		</div>

		<!-- Deck List -->
		{#if loading}
			<div class="text-center py-20">
				<p class="text-gray-500 text-sm tracking-wider animate-pulse">{$t('sts2.decksPage.loading')}</p>
			</div>
		{:else if decks.length === 0}
			<div class="text-center py-20 border border-[#c8aa6e]/10 bg-[#161620]">
				<p class="text-gray-500 text-sm tracking-wider mb-3">{selectedCharacter ? $t('sts2.decksPage.noDecksFor', { values: { character: getCharName(selectedCharacter) }}) : $t('sts2.decksPage.noDecksYet')}</p>
				<a href="/build" class="inline-flex px-5 py-2.5 border border-[#c8aa6e]/30 hover:border-[#c8aa6e] text-[#c8aa6e] text-xs font-bold tracking-wider transition-all hover:bg-[#c8aa6e]/5">
					{$t('sts2.decksPage.beFirst')} →
				</a>
			</div>
		{:else}
			<div class="space-y-3">
				{#each decks as deck}
					{@const theme = CHARACTER_THEMES[deck.characterId]}
					{@const cards = deck.cardIds.map(findCard).filter(Boolean)}
					<div class="group bg-[#161620] border border-[#c8aa6e]/10 hover:border-[#c8aa6e]/25 transition-all">
						<div class="flex items-stretch">
							<!-- Left color stripe -->
							<div class="w-1 shrink-0" style="background: {theme?.color || '#c8aa6e'}40"></div>

							<!-- Main content -->
							<div class="flex-1 p-4 sm:p-5 min-w-0">
								<div class="flex items-start justify-between gap-3 mb-3">
									<div class="min-w-0">
										<div class="flex items-center gap-2 mb-1">
											<h3 class="text-base font-bold text-white tracking-wider truncate">{deck.name}</h3>
											<span class="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider shrink-0" style="color: {theme?.color}; background: {theme?.color}15; border: 1px solid {theme?.color}25">
												{getCharName(deck.characterId)}
											</span>
										</div>
										<div class="flex items-center gap-2 text-[10px] text-gray-500">
											<span>{$t('sts2.decksPage.by')} <span class="text-gray-400">{deck.username}</span></span>
											<span class="text-gray-700">·</span>
											<span>{cards.length} {$t('sts2.decksPage.cards')}</span>
											{#if deck.description}
												<span class="text-gray-700">·</span>
												<span class="text-gray-400 truncate max-w-xs">{deck.description}</span>
											{/if}
										</div>
									</div>

									<!-- Vote button -->
									<div class="flex items-center gap-2 shrink-0">
										<button
											on:click={() => toggleVote(deck)}
											disabled={!user}
											class="flex items-center gap-1.5 px-3 py-1.5 border transition-all {deck.userVoted ? 'border-[#c8aa6e]/50 bg-[#c8aa6e]/10 text-[#c8aa6e]' : 'border-[#c8aa6e]/15 text-gray-500 hover:text-[#c8aa6e] hover:border-[#c8aa6e]/40'} disabled:opacity-40 disabled:cursor-default"
											title={!user ? $t('sts2.decksPage.loginToVote') : deck.userVoted ? $t('sts2.decksPage.removeVote') : $t('sts2.decksPage.upvote')}
										>
											<svg class="w-3.5 h-3.5" fill={deck.userVoted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
												<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
											</svg>
											<span class="text-xs font-bold">{deck.votes}</span>
										</button>
									</div>
								</div>

								<!-- Card thumbnails -->
								<div class="flex flex-wrap gap-1">
									{#each cards.slice(0, 12) as card}
										{@const typeStyle = CARD_TYPE_COLORS[card.type] || CARD_TYPE_COLORS.Attack}
										<div
											class="w-8 h-8 sm:w-10 sm:h-10 overflow-hidden border shrink-0 {typeStyle.border} hover:border-[#c8aa6e]/40 transition-colors cursor-default"
											on:mouseenter={(e) => showCardHover(card, e)}
											on:mousemove={(e) => updateHoverPosition(e)}
											on:mouseleave={hideCardHover}
										>
											{#if card.image_url}
												<img src={getImageUrl(card.image_url, 60)} alt={card.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
											{/if}
										</div>
									{/each}
									{#if cards.length > 12}
										<div class="w-8 h-8 sm:w-10 sm:h-10 border border-[#c8aa6e]/10 flex items-center justify-center text-[9px] text-gray-500 font-bold">
											+{cards.length - 12}
										</div>
									{/if}
								</div>

								<!-- Actions -->
								<div class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
									<button
										on:click={() => openInBuilder(deck)}
										class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-gray-400 hover:text-[#c8aa6e] transition-all"
									>
										{$t('sts2.decksPage.openInBuilder')}
									</button>
									<button
										on:click={() => shareDeck(deck)}
										class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-gray-400 hover:text-[#c8aa6e] transition-all flex items-center gap-1.5"
									>
										<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.024a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
										{copiedId === deck.id ? $t('sts2.buildPage.copied') : $t('sts2.buildPage.shareDeck')}
									</button>
									{#if isAdmin}
										<button
											on:click={() => deleteDeck(deck)}
											class="ml-auto px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-all {deleteConfirm === deck.id ? 'border-red-500/60 bg-red-500/10 text-red-400' : 'border-red-500/20 text-red-500/50 hover:text-red-400 hover:border-red-500/40'}"
										>
											{deleteConfirm === deck.id ? $t('sts2.decksPage.confirm') : $t('sts2.decksPage.delete')}
										</button>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Navigation -->
		<div class="flex items-center justify-between pt-8 mt-8 border-t border-[#c8aa6e]/10">
			<a href="/" class="text-sm text-gray-500 hover:text-[#c8aa6e] transition-colors font-medium tracking-wider">← {$t('sts2.hub')}</a>
			<a href="/build" class="inline-flex items-center gap-2 px-5 py-2.5 border border-[#c8aa6e]/30 hover:border-[#c8aa6e] hover:bg-[#c8aa6e]/5 text-[#c8aa6e] text-xs font-bold tracking-wider transition-all">
				{$t('sts2.decksPage.createDeck')} →
			</a>
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
