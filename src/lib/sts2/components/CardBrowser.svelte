<script>
	import { CHARACTER_THEMES, CARD_TYPE_COLORS, RARITY_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { selectedCharacter, addCard } from '$lib/sts2/stores/deckStore';
	import { filterCards, sortCards, parseDescription } from '$lib/sts2/utils/cardFilters';
	import { showCardHover, updateHoverPosition, hideCardHover } from '$lib/sts2/stores/cardHoverStore';
	import { t } from 'svelte-i18n';

	export let cards = [];
	export let deckCardIds = [];
	export let showOnlyDeck = false;

	let search = '';
	let searchRaw = '';
	let searchDebounceTimer;
	let filterType = '';
	let filterRarity = '';
	let filterCost = '';
	let filterKeyword = '';
	let sortBy = 'cost';
	let searchInput;
	let showFilters = false;

	$: activeFilterCount = [filterType, filterRarity, filterCost, filterKeyword].filter(Boolean).length;

	function handleKeydown(e) {
		if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT') {
			e.preventDefault();
			searchInput?.focus();
		}
		if (e.key === 'Escape' && document.activeElement === searchInput) {
			searchInput?.blur();
		}
	}

	$: charId = $selectedCharacter?.id?.toLowerCase() || '';
	$: theme = charId ? CHARACTER_THEMES[charId] : null;
	$: deckIdSet = new Set(deckCardIds);
	$: deckCountMap = deckCardIds.reduce((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {});
	$: baseCards = showOnlyDeck ? cards.filter(c => deckIdSet.has(c.id)) : cards;
	$: filteredCards = sortCards(
		filterCards(baseCards, {
			character: charId,
			type: filterType,
			rarity: filterRarity,
			cost: filterCost,
			keyword: filterKeyword,
			search
		}),
		sortBy
	);

	$: allKeywords = [...new Set(cards.flatMap(c => c.keywords || []))].sort();
	$: uniqueCosts = [...new Set(cards.filter(c => !c.is_x_cost).map(c => c.cost))].sort((a, b) => a - b);


	function handleAddCard(card) {
		addCard(card);
	}

	$: costDisplay = (card) => card.is_x_cost ? 'X' : (card.star_cost != null ? `★${card.star_cost}` : card.cost);
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="w-full">
	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-2 mb-4">
		<!-- Search + Mobile filter toggle -->
		<div class="relative w-full sm:w-auto sm:flex-1 sm:min-w-[180px] flex gap-2">
			<button
				on:click={() => showFilters = !showFilters}
				class="sm:hidden shrink-0 flex items-center gap-1.5 px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-xs text-gray-400 {showFilters || activeFilterCount > 0 ? 'border-[#c8aa6e]/30 text-[#c8aa6e]' : ''}"
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
				{#if activeFilterCount > 0}
					<span class="w-4 h-4 text-[9px] font-bold flex items-center justify-center bg-[#c8aa6e]/20 text-[#c8aa6e] border border-[#c8aa6e]/30 rounded-full">{activeFilterCount}</span>
				{/if}
			</button>
			<div class="relative flex-1">
				<input
					bind:this={searchInput}
					bind:value={searchRaw}
					on:input={() => {
						clearTimeout(searchDebounceTimer);
						searchDebounceTimer = setTimeout(() => { search = searchRaw; }, 280);
					}}
					type="text"
					placeholder={$t('sts2.buildPage.searchCards')}
					class="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
				/>
				{#if searchRaw}
					<button on:click={() => { searchRaw = ''; search = ''; }} class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-sm">✕</button>
				{/if}
			</div>
		</div>

		<!-- Filter dropdowns: always visible on sm+, toggled on mobile -->
		<div class="{showFilters ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-2 w-full sm:w-auto">
			<!-- Type Filter -->
			<select bind:value={filterType} aria-label="Filter by card type" class="flex-1 sm:flex-none shrink-0 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-gray-300 focus:outline-none">
				<option value="">{$t('sts2.buildPage.allTypes')}</option>
				<option value="Attack">{$t('sts2.buildPage.attack')}</option>
				<option value="Skill">{$t('sts2.buildPage.skill')}</option>
				<option value="Power">{$t('sts2.buildPage.power')}</option>
			</select>

			<!-- Rarity Filter -->
			<select bind:value={filterRarity} aria-label="Filter by rarity" class="flex-1 sm:flex-none shrink-0 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-gray-300 focus:outline-none">
				<option value="">{$t('sts2.buildPage.allRarities')}</option>
				<option value="Basic">{$t('sts2.buildPage.basic')}</option>
				<option value="Common">{$t('sts2.buildPage.common')}</option>
				<option value="Uncommon">{$t('sts2.buildPage.uncommon')}</option>
				<option value="Rare">{$t('sts2.buildPage.rare')}</option>
				<option value="Ancient">{$t('sts2.buildPage.ancient')}</option>
			</select>

			<!-- Cost Filter -->
			<select bind:value={filterCost} aria-label="Filter by cost" class="flex-1 sm:flex-none shrink-0 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-gray-300 focus:outline-none">
				<option value="">{$t('sts2.buildPage.allCosts')}</option>
				<option value="X">X</option>
				{#each uniqueCosts as cost}
					<option value={String(cost)}>{cost}</option>
				{/each}
			</select>

			<!-- Keyword Filter -->
			{#if allKeywords.length > 0}
				<select bind:value={filterKeyword} aria-label="Filter by keyword" class="flex-1 sm:flex-none shrink-0 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-gray-300 focus:outline-none">
					<option value="">{$t('sts2.buildPage.allKeywords')}</option>
					{#each allKeywords as kw}
						<option value={kw}>{kw}</option>
					{/each}
				</select>
			{/if}

			<!-- Sort -->
			<select bind:value={sortBy} aria-label="Sort cards" class="flex-1 sm:flex-none shrink-0 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-gray-300 focus:outline-none">
				<option value="cost">{$t('sts2.buildPage.sortCost')}</option>
				<option value="name">{$t('sts2.buildPage.sortName')}</option>
				<option value="type">{$t('sts2.buildPage.sortType')}</option>
				<option value="rarity">{$t('sts2.buildPage.sortRarity')}</option>
			</select>
		</div>
	</div>

	<!-- Card Count -->
	<div class="flex items-center justify-between mb-3">
		<span class="text-[10px] uppercase tracking-widest text-gray-500">{filteredCards.length} {$t('sts2.buildPage.cards')}</span>
		{#if filterType || filterRarity || filterCost || filterKeyword || searchRaw}
			<button
				on:click={() => { filterType = ''; filterRarity = ''; filterCost = ''; filterKeyword = ''; search = ''; searchRaw = ''; }}
				class="text-[10px] uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
			>
				{$t('sts2.buildPage.clearFilters')}
			</button>
		{/if}
	</div>

	<!-- Card Grid -->
	<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2">
		{#each filteredCards as card (card.id)}
			{@const typeStyle = CARD_TYPE_COLORS[card.type] || CARD_TYPE_COLORS.Attack}
			{@const rarityStyle = RARITY_COLORS[card.rarity] || RARITY_COLORS.Common}
			<button
				on:click={() => handleAddCard(card)}
					on:mouseenter={(e) => showCardHover(card, e)}
				on:mousemove={(e) => updateHoverPosition(e)}
				on:mouseleave={hideCardHover}
				class="group relative bg-[#0a0a10] border rounded-lg overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:z-10 {typeStyle.border} hover:border-opacity-60 text-left"
			>
				<!-- Card Image -->
				<div class="relative aspect-[3/4] overflow-hidden">
					{#if card.image_url}
						<img
							src={getImageUrl(card.image_url, 400)}
							alt={card.name}
							class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
							loading="lazy"
							decoding="async"
						/>
					{:else}
						<div class="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
							<span class="text-xs text-gray-600 ">{card.type}</span>
						</div>
					{/if}
					<div class="absolute inset-0 bg-gradient-to-t from-[#0a0a10] via-transparent to-transparent"></div>

					<!-- Cost Badge -->
					<div class="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">
						{costDisplay(card)}
					</div>

					<!-- Rarity dot -->
					<div class="absolute top-1 right-1 w-2 h-2 rounded-full {rarityStyle.bg}"></div>

					<!-- Deck count badge -->
					{#if (deckCountMap[card.id] || 0) > 0}
						<div class="absolute bottom-1 right-1 min-w-[18px] h-[18px] rounded-full bg-[#c8aa6e] border border-[#c8aa6e]/60 flex items-center justify-center text-[9px] font-bold text-black px-1 shadow-lg">
							×{deckCountMap[card.id]}
						</div>
					{/if}

					<!-- Add overlay -->
					<div class="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
						<span class="text-xl text-green-400 drop-shadow-lg">+</span>
					</div>
				</div>

				<!-- Card Name -->
				<div class="p-1 sm:p-1.5">
					<h4 class="text-[8px] sm:text-[10px] text-white leading-tight truncate">{card.name}</h4>
					<span class="text-[7px] sm:text-[8px] {typeStyle.text} uppercase tracking-wider">{card.type}</span>
				</div>
			</button>
		{/each}
	</div>

	<!-- Empty State -->
	{#if filteredCards.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-500 text-sm">{$t('sts2.buildPage.noCardsMatch')}</p>
		</div>
	{/if}
</div>


<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
