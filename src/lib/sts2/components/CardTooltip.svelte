<script>
	import { CARD_TYPE_COLORS, RARITY_COLORS, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { parseDescription } from '$lib/sts2/utils/cardFilters';
	import { applyUpgrade } from '$lib/sts2/utils/cardUpgrade';
	import { t, locale } from 'svelte-i18n';
	import { getContext } from 'svelte';

	export let card;
	export let showUpgrade = false;
	export let isUpgraded = false;

	const { keywordTranslations } = getContext('sts2') || {};

	$: displayCard = (isUpgraded && card.upgrade) ? applyUpgrade(card) : card;
	$: baseCard = card;
	$: typeStyle = CARD_TYPE_COLORS[displayCard.type] || CARD_TYPE_COLORS.Attack;
	$: rarityStyle = RARITY_COLORS[displayCard.rarity] || RARITY_COLORS.Common;
	$: descHtml = parseDescription(displayCard.description);
	$: costDisplay = displayCard.is_x_cost ? 'X' : (displayCard.star_cost != null ? `★${displayCard.star_cost}` : displayCard.cost);

	// Track what changed for visual highlighting
	$: costChanged = isUpgraded && displayCard._isUpgraded && baseCard.cost !== displayCard.cost;
	$: damageChanged = isUpgraded && displayCard._isUpgraded && baseCard.damage !== displayCard.damage;
	$: blockChanged = isUpgraded && displayCard._isUpgraded && baseCard.block !== displayCard.block;

	function translateKeyword(kw) {
		if (!keywordTranslations || !$locale) return kw;
		const lang = $locale.split('-')[0];
		const translation = keywordTranslations[lang]?.[kw];
		return translation?.name || kw;
	}
</script>

<div class="w-72 bg-[#161620] border {isUpgraded && displayCard._isUpgraded ? 'border-green-500/40' : 'border-[#c8aa6e]/30'} overflow-hidden shadow-2xl shadow-black/90">
	<!-- Card Image -->
	{#if displayCard.image_url}
		<div class="relative h-44 overflow-hidden">
			<img
				src={getImageUrl(displayCard.image_url, 500)}
				alt={displayCard.name}
				class="w-full h-full object-cover object-center"
				decoding="async"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-[#161620] via-transparent to-transparent"></div>
			<!-- Cost badge -->
			<div class="absolute top-2 left-2 w-9 h-9 bg-black/85 border {costChanged ? 'border-green-400/60' : 'border-[#c8aa6e]/40'} flex items-center justify-center text-sm font-bold {costChanged ? 'text-green-400' : 'text-[#c8aa6e]'}">
				{costDisplay}
			</div>
			<!-- Upgraded badge -->
			{#if isUpgraded && displayCard._isUpgraded}
				<div class="absolute top-2 right-2 px-2 py-0.5 bg-green-500/20 border border-green-500/40 text-[9px] font-bold text-green-400 uppercase tracking-wider backdrop-blur-sm">
					{$t('sts2.buildPage.upgrade')}+
				</div>
			{/if}
		</div>
	{/if}

	<div class="p-3.5">
		<!-- Name + Type -->
		<div class="flex items-start justify-between gap-2 mb-2">
			<h4 class="text-sm font-bold {isUpgraded && displayCard._isUpgraded ? 'text-green-300' : 'text-white'} leading-tight tracking-wide">{displayCard.name}</h4>
			<span class="shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider {typeStyle.bg} {typeStyle.text}">
				{displayCard.type}
			</span>
		</div>

		<!-- Rarity + Keywords -->
		<div class="flex items-center gap-2 mb-2 flex-wrap">
			<span class="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider {rarityStyle.bg} {rarityStyle.text}">
				{displayCard.rarity}
			</span>
			{#if displayCard.keywords?.length}
				{#each displayCard.keywords as kw}
					<span class="px-1.5 py-0.5 text-[9px] bg-[#c8aa6e]/5 text-gray-400 uppercase tracking-wider border border-[#c8aa6e]/10">
						{translateKeyword(kw)}
					</span>
				{/each}
			{/if}
			{#if displayCard._addedKeywords?.length}
				{#each displayCard._addedKeywords as kw}
					<span class="px-1.5 py-0.5 text-[9px] bg-green-500/10 text-green-400 uppercase tracking-wider border border-green-500/20 font-bold">
						+{translateKeyword(kw)}
					</span>
				{/each}
			{/if}
			{#if displayCard._removedKeywords?.length}
				{#each displayCard._removedKeywords as kw}
					<span class="px-1.5 py-0.5 text-[9px] bg-red-500/10 text-red-400 uppercase tracking-wider border border-red-500/20 font-bold line-through">
						{translateKeyword(kw)}
					</span>
				{/each}
			{/if}
		</div>

		<!-- Description -->
		<div class="text-xs text-gray-300 leading-relaxed mb-2">
			{@html descHtml}
		</div>

		<!-- Stats -->
		<div class="flex flex-wrap gap-3 text-[10px] border-t border-[#c8aa6e]/10 pt-2">
			{#if displayCard.damage != null}
				<span class="{damageChanged ? 'text-green-400' : 'text-red-400'} font-medium">
					{$t('sts2.dmg')} {displayCard.damage}{displayCard.hit_count > 1 ? ` ×${displayCard.hit_count}` : ''}
					{#if damageChanged}<span class="text-[8px] text-gray-500">({baseCard.damage}→{displayCard.damage})</span>{/if}
				</span>
			{/if}
			{#if displayCard.block != null}
				<span class="{blockChanged ? 'text-green-400' : 'text-blue-400'} font-medium">
					{$t('sts2.blk')} {displayCard.block}
					{#if blockChanged}<span class="text-[8px] text-gray-500">({baseCard.block}→{displayCard.block})</span>{/if}
				</span>
			{/if}
			{#if displayCard.cards_draw}
				<span class="text-green-400 font-medium">+{displayCard.cards_draw} {$t('sts2.buildPage.draw')}</span>
			{/if}
			{#if displayCard.energy_gain}
				<span class="text-yellow-400 font-medium">+{displayCard.energy_gain} {$t('sts2.buildPage.cost')}</span>
			{/if}
		</div>

		<!-- Powers Applied -->
		{#if displayCard.powers_applied?.length}
			<div class="flex flex-wrap gap-1.5 mt-2">
				{#each displayCard.powers_applied as pa}
					<span class="px-1.5 py-0.5 text-[9px] bg-purple-500/15 text-purple-300 border border-purple-500/20 font-medium">
						{pa.power} +{pa.amount}
					</span>
				{/each}
			</div>
		{/if}

		<!-- Upgrade Info (raw diff badges) — only when not showing upgraded version -->
		{#if showUpgrade && !isUpgraded && card.upgrade && Object.keys(card.upgrade).length > 0}
			<div class="mt-2 pt-2 border-t border-[#c8aa6e]/10">
				<span class="text-[9px] font-bold text-green-400 uppercase tracking-wider">{$t('sts2.buildPage.upgrade')}</span>
				<div class="flex flex-wrap gap-1 mt-1">
					{#each Object.entries(card.upgrade) as [key, val]}
						<span class="px-1.5 py-0.5 text-[9px] bg-green-500/10 text-green-300 border border-green-500/15">
							{key}: {val}
						</span>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
