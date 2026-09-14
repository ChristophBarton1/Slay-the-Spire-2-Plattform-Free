<script>
	import { deckStats } from '$lib/sts2/stores/deckStore';
	import { t } from 'svelte-i18n';

	export let theme = null;

	$: stats = $deckStats;
	$: maxCostCount = Math.max(...Object.values(stats.costs), 1);
	$: sortedCosts = Object.entries(stats.costs).sort((a, b) => {
		if (a[0] === 'X') return -1;
		if (b[0] === 'X') return 1;
		return Number(a[0]) - Number(b[0]);
	});
</script>

<div class="space-y-3">
	<!-- Type Distribution -->
	<div>
		<span class="text-[9px] uppercase tracking-widest text-gray-500 mb-1.5 block">{$t('sts2.buildPage.typeSplit')}</span>
		<div class="flex gap-1 h-4 rounded overflow-hidden bg-black/30">
			{#if stats.total > 0}
				{#if stats.attacks > 0}
					<div
						class="bg-red-500/60 flex items-center justify-center text-[8px] font-bold text-red-200 transition-all duration-300"
						style="width: {(stats.attacks / stats.total) * 100}%"
					>
						{stats.attacks}
					</div>
				{/if}
				{#if stats.skills > 0}
					<div
						class="bg-blue-500/60 flex items-center justify-center text-[8px] font-bold text-blue-200 transition-all duration-300"
						style="width: {(stats.skills / stats.total) * 100}%"
					>
						{stats.skills}
					</div>
				{/if}
				{#if stats.powers > 0}
					<div
						class="bg-yellow-500/60 flex items-center justify-center text-[8px] font-bold text-yellow-200 transition-all duration-300"
						style="width: {(stats.powers / stats.total) * 100}%"
					>
						{stats.powers}
					</div>
				{/if}
			{/if}
		</div>
		<div class="flex justify-between mt-1 text-[8px] text-gray-500">
			<span class="text-red-400">{$t('sts2.atk')} {stats.attacks}</span>
			<span class="text-blue-400">{$t('sts2.skl')} {stats.skills}</span>
			<span class="text-yellow-400">{$t('sts2.pwr')} {stats.powers}</span>
		</div>
	</div>

	<!-- Cost Distribution -->
	<div>
		<span class="text-[9px] uppercase tracking-widest text-gray-500 mb-1.5 block">{$t('sts2.buildPage.costCurve')}</span>
		<div class="flex items-end gap-1 h-12">
			{#each sortedCosts as [cost, count]}
				<div class="flex-1 flex flex-col items-center gap-0.5">
					<span class="text-[8px] text-gray-400">{count}</span>
					<div
						class="w-full rounded-t transition-all duration-300"
						style="height: {(count / maxCostCount) * 100}%; background: {theme?.color || '#c8aa6e'}40; min-height: 2px"
					></div>
					<span class="text-[8px] text-gray-500">{cost}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Quick Stats -->
	<div class="grid grid-cols-2 gap-2">
		<div class="bg-black/30 rounded px-2 py-1.5">
			<span class="text-[8px] uppercase tracking-wider text-gray-500 block">{$t('sts2.buildPage.avgCost')}</span>
			<span class="text-sm font-bold" style="color: {theme?.color || '#c8aa6e'}">{stats.avgCost}</span>
		</div>
		<div class="bg-black/30 rounded px-2 py-1.5">
			<span class="text-[8px] uppercase tracking-wider text-gray-500 block">{$t('sts2.buildPage.cards')}</span>
			<span class="text-sm font-bold text-white">{stats.total}</span>
		</div>
		<div class="bg-black/30 rounded px-2 py-1.5">
			<span class="text-[8px] uppercase tracking-wider text-gray-500 block">{$t('sts2.buildPage.damage')}</span>
			<span class="text-sm font-bold text-red-400">{stats.totalDamage}</span>
		</div>
		<div class="bg-black/30 rounded px-2 py-1.5">
			<span class="text-[8px] uppercase tracking-wider text-gray-500 block">{$t('sts2.buildPage.block')}</span>
			<span class="text-sm font-bold text-blue-400">{stats.totalBlock}</span>
		</div>
	</div>
</div>
