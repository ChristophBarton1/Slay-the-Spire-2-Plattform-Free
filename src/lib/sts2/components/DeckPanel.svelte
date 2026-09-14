<script>
	import { CHARACTER_THEMES, CARD_TYPE_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { selectedCharacter, deck, removeCard, clearDeck, selectedRelics, selectedPotions } from '$lib/sts2/stores/deckStore';
	import { showCardHover, updateHoverPosition, hideCardHover } from '$lib/sts2/stores/cardHoverStore';
	import DeckStats from './DeckStats.svelte';
	import SynergyDisplay from './SynergyDisplay.svelte';
	import SocialShareModal from './SocialShareModal.svelte';
	import { t } from 'svelte-i18n';

	export let user = null;

	let showSocialShare = false;
	let compactView = false;
	let saveState = 'idle'; // idle | saving | saved | error
	let saveError = '';
	let showSaveDialog = false;
	let deckName = '';
	let deckDescription = '';

	async function saveDeck() {
		if (!user || !$selectedCharacter || $deck.length === 0) return;
		if (!deckName.trim()) { saveError = $t('sts2.buildPage.nameRequiredError'); return; }

		saveState = 'saving';
		saveError = '';

		try {
			const res = await fetch('/api/decks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					characterId: $selectedCharacter.id,
					name: deckName.trim(),
					cardIds: $deck.map(c => c.id),
					relicIds: $selectedRelics.map(r => r.id),
					potionIds: $selectedPotions.map(p => p.id),
					description: deckDescription.trim()
				})
			});

			const data = await res.json();
			if (!res.ok) {
				saveError = data.error || $t('sts2.buildPage.failedToSave');
				saveState = 'error';
				return;
			}

			saveState = 'saved';
			showSaveDialog = false;
			deckName = '';
			deckDescription = '';
			setTimeout(() => saveState = 'idle', 3000);
		} catch (e) {
			saveError = $t('sts2.buildPage.networkError');
			saveState = 'error';
		}
	}

	$: theme = $selectedCharacter ? CHARACTER_THEMES[$selectedCharacter.id.toLowerCase()] : null;
	$: grouped = groupByType($deck);

	function groupByType(cards) {
		const groups = { Attack: [], Skill: [], Power: [], Other: [] };
		for (const card of cards) {
			const key = groups[card.type] !== undefined ? card.type : 'Other';
			groups[key].push(card);
		}
		return Object.entries(groups).filter(([, cards]) => cards.length > 0);
	}

	$: costDisplay = (card) => card.is_x_cost ? 'X' : (card.star_cost != null ? `★${card.star_cost}` : card.cost);
</script>

<div class="h-full flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between mb-3 pb-3 border-b border-[#c8aa6e]/15">
		<div>
			<h2 class="text-sm font-bold tracking-[2px] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#c8aa6e] to-[#f1ede3]">
				{$t('sts2.buildPage.yourDeck')}
			</h2>
			<span class="text-[10px] text-gray-500 tracking-wider">{$deck.length} {$t('sts2.buildPage.cards')}</span>
		</div>
		<div class="flex items-center gap-2">
			{#if $deck.length > 0}
				<button
					on:click={() => compactView = !compactView}
					class="p-1 border border-[#c8aa6e]/15 hover:border-[#c8aa6e]/40 transition-colors"
					title={compactView ? $t('sts2.buildPage.detailedView') : $t('sts2.buildPage.compactView')}
				>
					{#if compactView}
						<svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
					{:else}
						<svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" /></svg>
					{/if}
				</button>
				<button
					on:click={clearDeck}
					class="text-[10px] uppercase tracking-wider text-red-400/60 hover:text-red-400 transition-colors font-bold"
				>
					{$t('sts2.buildPage.clear')}
				</button>
			{/if}
		</div>
	</div>

	<!-- Card List -->
	<div class="space-y-3">
		{#if $deck.length === 0}
			<div class="text-center py-8">
				<p class="text-gray-500 text-xs tracking-wide">{$t('sts2.buildPage.clickToAdd')}</p>
			</div>
		{:else if compactView}
			{#each grouped as [type, cards]}
				{@const typeStyle = CARD_TYPE_COLORS[type] || CARD_TYPE_COLORS.Attack}
				<div>
					<div class="flex items-center gap-2 mb-1">
						<span class="text-[9px] uppercase tracking-widest {typeStyle.text} font-bold">{type}</span>
						<span class="text-[9px] text-gray-600">({cards.length})</span>
						<div class="flex-1 h-px bg-[#c8aa6e]/10"></div>
					</div>
					<div class="space-y-px">
						{#each cards as card (card._uid)}
							<button
								on:click={() => removeCard(card._uid)}
								on:mouseenter={(e) => showCardHover(card, e)}
								on:mousemove={(e) => updateHoverPosition(e)}
								on:mouseleave={hideCardHover}
								class="group w-full flex items-center gap-1.5 px-1.5 py-0.5 hover:bg-red-500/5 transition-all text-left"
							>
								<span class="w-4 text-center text-[9px] font-bold text-[#c8aa6e]/70 shrink-0">{costDisplay(card)}</span>
								<span class="text-[10px] text-gray-300 truncate flex-1">{card.name}</span>
								<span class="text-[9px] text-red-400/0 group-hover:text-red-400/80 transition-colors shrink-0">✕</span>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		{:else}
			{#each grouped as [type, cards]}
				{@const typeStyle = CARD_TYPE_COLORS[type] || CARD_TYPE_COLORS.Attack}
				<div>
					<div class="flex items-center gap-2 mb-1.5">
						<span class="text-[9px] uppercase tracking-widest {typeStyle.text} font-bold">{type}</span>
						<span class="text-[9px] text-gray-600">({cards.length})</span>
						<div class="flex-1 h-px bg-[#c8aa6e]/10"></div>
					</div>
					<div class="space-y-0.5">
						{#each cards as card (card._uid)}
							<button
								on:click={() => removeCard(card._uid)}
								on:mouseenter={(e) => showCardHover(card, e)}
								on:mousemove={(e) => updateHoverPosition(e)}
								on:mouseleave={hideCardHover}
								class="group w-full flex items-center gap-2.5 px-2 py-1.5 bg-[#08080c] border border-[#c8aa6e]/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-left"
							>
								{#if card.image_url}
									<div class="w-9 h-9 overflow-hidden shrink-0 border border-[#c8aa6e]/15">
										<img
											src={getImageUrl(card.image_url, 60)}
										 alt="Image"
											class="w-full h-full object-cover"
											loading="lazy"
											decoding="async"
										/>
									</div>
								{/if}
								<span class="w-5 text-center text-[10px] font-bold text-[#c8aa6e] shrink-0">{costDisplay(card)}</span>
								<div class="flex-1 min-w-0">
									<span class="text-[11px] text-gray-200 truncate block font-medium">{card.name}</span>
									<span class="text-[8px] {typeStyle.text} uppercase tracking-wider">{card.type}</span>
								</div>
								<span class="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">✕</span>
							</button>
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Relics Preview -->
	{#if $selectedRelics.length > 0}
		<div class="mt-3 pt-3 border-t border-[#c8aa6e]/10">
			<span class="text-[9px] uppercase tracking-widest text-gray-500 mb-1.5 block font-bold">{$t('sts2.buildPage.relics')} ({$selectedRelics.length})</span>
			<div class="flex flex-wrap gap-1.5">
				{#each $selectedRelics as relic}
					<div class="w-8 h-8 border border-[#c8aa6e]/20 overflow-hidden" title={relic.name}>
						{#if relic.image_url}
							<img src={getImageUrl(relic.image_url, 60)} alt={relic.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Potions Preview -->
	{#if $selectedPotions.length > 0}
		<div class="mt-2">
			<span class="text-[9px] uppercase tracking-widest text-gray-500 mb-1.5 block font-bold">{$t('sts2.buildPage.potions')} ({$selectedPotions.length}/3)</span>
			<div class="flex flex-wrap gap-1.5">
				{#each $selectedPotions as potion}
					<div class="w-8 h-8 border border-[#c8aa6e]/20 overflow-hidden" title={potion.name}>
						{#if potion.image_url}
							<img src={getImageUrl(potion.image_url, 60)} alt={potion.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Stats -->
	{#if $deck.length > 0}
		<div class="mt-3 pt-3 border-t border-[#c8aa6e]/10">
			<DeckStats {theme} />
		</div>

		<!-- Synergies -->
		<div class="mt-3 pt-3 border-t border-[#c8aa6e]/10">
			<SynergyDisplay />
		</div>
	{/if}

	<!-- Action Buttons -->
	{#if $deck.length > 0}
		<div class="mt-3 pt-3 border-t border-[#c8aa6e]/15 space-y-2">
			<!-- Save Deck -->
			{#if user}
				{#if showSaveDialog}
					<div class="space-y-2 p-3 border border-[#c8aa6e]/20 bg-[#08080c]">
						<input
							bind:value={deckName}
							placeholder={$t('sts2.buildPage.deckName')}
							maxlength="50"
							class="w-full px-3 py-2 bg-[#161620] border border-[#c8aa6e]/20 text-white text-xs tracking-wider focus:border-[#c8aa6e]/50 focus:outline-none placeholder-gray-600"
						/>
						<input
							bind:value={deckDescription}
							placeholder={$t('sts2.buildPage.shortDesc')}
							maxlength="200"
							class="w-full px-3 py-2 bg-[#161620] border border-[#c8aa6e]/20 text-white text-xs tracking-wider focus:border-[#c8aa6e]/50 focus:outline-none placeholder-gray-600"
						/>
						{#if saveError}
							<p class="text-[10px] text-red-400">{saveError}</p>
						{/if}
						<div class="flex gap-2">
							<button
								on:click={saveDeck}
								disabled={saveState === 'saving'}
								class="flex-1 py-2 text-xs font-bold tracking-wider uppercase border border-green-500/40 hover:border-green-500 bg-green-500/10 hover:bg-green-500/15 text-green-400 transition-all disabled:opacity-50"
							>
								{saveState === 'saving' ? $t('sts2.buildPage.saving') : $t('sts2.buildPage.save')}
							</button>
							<button
								on:click={() => { showSaveDialog = false; saveError = ''; }}
								class="px-3 py-2 text-xs font-bold tracking-wider uppercase border border-[#c8aa6e]/20 text-gray-500 hover:text-white transition-all"
							>
								{$t('sts2.buildPage.cancel')}
							</button>
						</div>
					</div>
				{:else}
					<button
						on:click={() => { showSaveDialog = true; saveState = 'idle'; saveError = ''; }}
						class="w-full py-2 text-xs font-bold tracking-wider uppercase transition-all border border-green-500/30 hover:border-green-500/60 text-green-400/70 hover:text-green-400 {saveState === 'saved' ? 'border-green-500/60 text-green-400' : ''}"
					>
						{saveState === 'saved' ? $t('sts2.buildPage.deckSaved') : $t('sts2.buildPage.saveDeck')}
					</button>
				{/if}
			{:else}
				<a href="/login" class="block w-full py-2 text-center text-xs font-bold tracking-wider uppercase border border-[#c8aa6e]/15 text-gray-600 hover:text-gray-400 hover:border-[#c8aa6e]/30 transition-all">
					{$t('sts2.buildPage.loginToSave')}
				</a>
			{/if}

			<!-- Share -->
			<button
				on:click={() => showSocialShare = true}
				class="w-full py-2 text-xs font-bold tracking-wider uppercase transition-all border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-gray-400 hover:text-[#c8aa6e] flex items-center justify-center gap-2"
			>
				<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
				</svg>
				{$t('sts2.buildPage.shareDeck')}
			</button>

			<!-- Analyze Synergies -->
			<a
				href="/synergies"
				class="w-full py-2 text-[10px] font-bold tracking-wider uppercase transition-all border border-purple-500/20 hover:border-purple-500/50 text-purple-400/70 hover:text-purple-400 flex items-center justify-center gap-1.5"
			>
				<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
				{$t('sts2.buildPage.analyzeSynergies')}
			</a>
		</div>
	{/if}
</div>

<SocialShareModal bind:show={showSocialShare} selectedPotions={$selectedPotions} />

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
