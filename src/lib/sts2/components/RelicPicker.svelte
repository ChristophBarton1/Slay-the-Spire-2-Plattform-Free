<script>
	import { CHARACTER_THEMES, RARITY_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { selectedCharacter, selectedRelics, toggleRelic } from '$lib/sts2/stores/deckStore';
	import { parseDescription } from '$lib/sts2/utils/cardFilters';
	import { localizeItems } from '$lib/sts2/utils/itemLocale';
	import { t, locale } from 'svelte-i18n';

	export let relics = [];
	export let relicTranslations = {};
	export let show = false;

	$: localizedRelics = localizeItems(relics, relicTranslations, $locale);

	let search = '';
	let filterRarity = '';
	let filterPool = '';

	$: charId = $selectedCharacter?.id?.toLowerCase() || '';
	$: theme = charId ? CHARACTER_THEMES[charId] : null;

	$: filtered = localizedRelics.filter(r => {
		if (charId && filterPool === '') {
			if (r.pool !== charId && r.pool !== 'shared') return false;
		} else if (filterPool) {
			if (r.pool !== filterPool) return false;
		}
		if (filterRarity && r.rarity !== filterRarity) return false;
		if (search) {
			const q = search.toLowerCase();
			if (!r.name.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
		}
		return true;
	});

	$: isSelected = (relic) => $selectedRelics.some(r => r.id === relic.id);
</script>

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" on:click|self={() => show = false}>
		<div class="bg-[#0a0a10] border border-white/10 rounded-xl w-[90vw] max-w-4xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
			<!-- Header -->
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
				<div>
					<h3 class="text-lg font-bold" style="color: {theme?.color || '#c8aa6e'}">{$t('sts2.buildPage.selectRelics')}</h3>
					<span class="text-[10px] text-gray-500">{$selectedRelics.length} {$t('sts2.buildPage.selected')}</span>
				</div>
				<button on:click={() => show = false} class="text-gray-500 hover:text-white text-xl transition-colors">&times;</button>
			</div>

			<!-- Filters -->
			<div class="flex flex-wrap gap-2 px-5 py-3 border-b border-white/5">
				<input
					bind:value={search}
					type="text"
					placeholder={$t('sts2.buildPage.searchRelics')}
					class="flex-1 min-w-[150px] bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
				/>
				<select bind:value={filterRarity} aria-label="Filter by rarity" class="bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none">
					<option value="">{$t('sts2.buildPage.allRarities')}</option>
					<option value="Starter">{$t('sts2.buildPage.starter')}</option>
					<option value="Common">{$t('sts2.buildPage.common')}</option>
					<option value="Uncommon">{$t('sts2.buildPage.uncommon')}</option>
					<option value="Rare">{$t('sts2.buildPage.rare')}</option>
					<option value="Shop">{$t('sts2.buildPage.shop')}</option>
					<option value="Event">{$t('sts2.buildPage.event')}</option>
					<option value="Ancient">{$t('sts2.buildPage.ancient')}</option>
				</select>
				<select bind:value={filterPool} aria-label="Filter by character pool" class="bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none">
					<option value="">{$t('sts2.buildPage.characterShared')}</option>
					<option value="shared">{$t('sts2.buildPage.sharedOnly')}</option>
					<option value="ironclad">Ironclad</option>
					<option value="silent">Silent</option>
					<option value="defect">Defect</option>
					<option value="necrobinder">Necrobinder</option>
					<option value="regent">Regent</option>
				</select>
			</div>

			<!-- Grid -->
			<div class="flex-1 overflow-y-auto p-5">
				<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
					{#each filtered as relic (relic.id)}
						{@const selected = isSelected(relic)}
						{@const rarityStyle = RARITY_COLORS[relic.rarity] || RARITY_COLORS.Common}
						<button
							on:click={() => toggleRelic(relic)}
							class="group relative flex flex-col items-center text-center p-2 rounded-lg border transition-all duration-200 {selected ? 'border-green-500/50 bg-green-500/10' : 'border-white/5 hover:border-white/20 bg-black/30'}"
						>
							{#if selected}
								<div class="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-white font-bold">✓</div>
							{/if}
							<div class="w-12 h-12 rounded-lg overflow-hidden border border-white/10 mb-1.5">
								{#if relic.image_url}
									<img src={getImageUrl(relic.image_url, 60)} alt={relic.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
								{:else}
									<div class="w-full h-full bg-gray-800 flex items-center justify-center text-[9px] text-gray-500 ">{$t('sts2.buildPage.relic')}</div>
								{/if}
							</div>
							<span class="text-[9px] font-bold text-white leading-tight">{relic.name}</span>
							<span class="text-[8px] {rarityStyle.text} uppercase tracking-wider">{relic.rarity}</span>
							<!-- Tooltip on hover -->
							<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#0c0c12] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
								<p class="text-[9px] text-gray-300 leading-relaxed">{@html parseDescription(relic.description)}</p>
								{#if relic.flavor}
									<p class="text-[8px] text-gray-500 italic mt-1">{@html parseDescription(relic.flavor)}</p>
								{/if}
							</div>
						</button>
					{/each}
				</div>
				{#if filtered.length === 0}
					<p class="text-center text-gray-500 text-sm py-8">{$t('sts2.buildPage.noRelicsMatch')}</p>
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
