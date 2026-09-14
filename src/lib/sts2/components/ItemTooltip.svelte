<script>
	import { RARITY_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { parseDescription } from '$lib/sts2/utils/cardFilters';
	import { t } from 'svelte-i18n';

	export let item;

	$: rarityStyle = RARITY_COLORS[item.rarity] || RARITY_COLORS.Common;
	$: descHtml = parseDescription(item.description);
	$: isPotion = item._itemType === 'potion';
</script>

<div class="w-72 bg-[#161620] border border-[#c8aa6e]/30 overflow-hidden shadow-2xl shadow-black/90">
	{#if item.image_url}
		<div class="relative flex items-center justify-center bg-[#1d1d29] p-6" style="height:160px">
			<img
				src={getImageUrl(item.image_url, 180)}
				alt={item.name}
				class="max-h-full w-auto object-contain"
				decoding="async"
			/>
		</div>
	{/if}

	<div class="p-3.5">
		<div class="flex items-start justify-between gap-2 mb-2">
			<h4 class="text-sm font-bold text-white leading-tight tracking-wide">{item.name}</h4>
			<span class="shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider {isPotion ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}">
				{isPotion ? $t('sts2.buildPage.potion') : $t('sts2.buildPage.relic')}
			</span>
		</div>

		<div class="mb-2">
			<span class="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider {rarityStyle.bg} {rarityStyle.text}">
				{$t('sts2.cardsPage.' + (item.rarity || 'common').toLowerCase())}
			</span>
		</div>

		<div class="text-xs text-gray-300 leading-relaxed">
			{@html descHtml}
		</div>
	</div>
</div>
