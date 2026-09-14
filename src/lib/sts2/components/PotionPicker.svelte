<script>
	import { CHARACTER_THEMES, RARITY_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { selectedCharacter, selectedPotions, togglePotion } from '$lib/sts2/stores/deckStore';
	import { parseDescription } from '$lib/sts2/utils/cardFilters';
	import { localizeItems } from '$lib/sts2/utils/itemLocale';
	import { t, locale } from 'svelte-i18n';

	export let potions = [];
	export let potionTranslations = {};
	export let show = false;

	$: localizedPotions = localizeItems(potions, potionTranslations, $locale);

	let search = '';

	$: charId = $selectedCharacter?.id?.toLowerCase() || '';
	$: theme = charId ? CHARACTER_THEMES[charId] : null;

	$: filtered = localizedPotions.filter(p => {
		if (charId) {
			if (p.pool && p.pool !== charId && p.pool !== 'shared' && p.pool !== null) return false;
		}
		if (search) {
			const q = search.toLowerCase();
			if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
		}
		return true;
	});

	$: isSelected = (potion) => $selectedPotions.some(p => p.id === potion.id);
</script>

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" on:click|self={() => show = false}>
		<div class="bg-[#0a0a10] border border-white/10 rounded-xl w-[90vw] max-w-3xl max-h-[70vh] flex flex-col overflow-hidden shadow-2xl">
			<!-- Header -->
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
				<div>
					<h3 class="text-lg font-bold" style="color: {theme?.color || '#c8aa6e'}">{$t('sts2.buildPage.selectPotions')}</h3>
					<span class="text-[10px] text-gray-500">{$selectedPotions.length}/3 {$t('sts2.buildPage.selected')}</span>
				</div>
				<button on:click={() => show = false} class="text-gray-500 hover:text-white text-xl transition-colors">&times;</button>
			</div>

			<!-- Search -->
			<div class="px-5 py-3 border-b border-white/5">
				<input
					bind:value={search}
					type="text"
					placeholder={$t('sts2.buildPage.searchPotions')}
					class="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
				/>
			</div>

			<!-- Grid -->
			<div class="flex-1 overflow-y-auto p-5">
				<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
					{#each filtered as potion (potion.id)}
						{@const selected = isSelected(potion)}
						{@const rarityStyle = RARITY_COLORS[potion.rarity] || RARITY_COLORS.Common}
						<button
							on:click={() => togglePotion(potion)}
							class="group relative flex flex-col items-center text-center p-2 rounded-lg border transition-all duration-200 {selected ? 'border-green-500/50 bg-green-500/10' : 'border-white/5 hover:border-white/20 bg-black/30'} {$selectedPotions.length >= 3 && !selected ? 'opacity-40 pointer-events-none' : ''}"
						>
							{#if selected}
								<div class="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-white font-bold">✓</div>
							{/if}
							<div class="w-10 h-10 rounded-lg overflow-hidden border border-white/10 mb-1.5">
								{#if potion.image_url}
									<img src={getImageUrl(potion.image_url, 60)} alt={potion.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
								{:else}
									<div class="w-full h-full bg-gray-800 flex items-center justify-center text-[9px] text-gray-500 ">{$t('sts2.buildPage.potion')}</div>
								{/if}
							</div>
							<span class="text-[9px] font-bold text-white leading-tight">{potion.name}</span>
							<span class="text-[8px] {rarityStyle.text} uppercase tracking-wider">{potion.rarity}</span>
							<!-- Tooltip -->
							<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2 bg-[#0c0c12] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
								<p class="text-[9px] text-gray-300 leading-relaxed">{@html parseDescription(potion.description)}</p>
							</div>
						</button>
					{/each}
				</div>
				{#if filtered.length === 0}
					<p class="text-center text-gray-500 text-sm py-8">{$t('sts2.buildPage.noPotionsMatch')}</p>
				{/if}
			</div>

			<!-- Footer -->
			<div class="px-5 py-3 border-t border-white/10 flex justify-end">
				<button on:click={() => show = false} class="px-6 py-2 rounded-lg text-xs font-bold tracking-wider border transition-all" style="border-color: {theme?.color || '#c8aa6e'}40; color: {theme?.color || '#c8aa6e'}">
					{$t('sts2.buildPage.done')}
				</button>
			</div>
		</div>
	</div>
{/if}
