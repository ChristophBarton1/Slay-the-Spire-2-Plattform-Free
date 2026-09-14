<script>
	import { hoveredCard, hoverPosition, showUpgradedCards } from '$lib/sts2/stores/cardHoverStore';
	import CardTooltip from './CardTooltip.svelte';
	import ItemTooltip from './ItemTooltip.svelte';
</script>

{#if $hoveredCard}
	<div
		class="fixed z-[200] pointer-events-none"
		style="left: {$hoverPosition.x}px; top: {$hoverPosition.y}px"
	>
		{#if $hoveredCard._itemType === 'potion' || $hoveredCard._itemType === 'relic'}
			<ItemTooltip item={$hoveredCard} />
		{:else}
			<CardTooltip card={$hoveredCard} showUpgrade={!$showUpgradedCards} isUpgraded={$showUpgradedCards} />
		{/if}
	</div>
{/if}
