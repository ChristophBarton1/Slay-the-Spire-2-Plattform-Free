<script>
	import { deck, selectedRelics } from '$lib/sts2/stores/deckStore';
	import { detectSynergies } from '$lib/sts2/utils/synergies';
	import { t } from 'svelte-i18n';

	$: synergies = detectSynergies($deck, $selectedRelics);
	$: strongSynergies = synergies.filter(s => s.strength === 'strong');
	$: moderateSynergies = synergies.filter(s => s.strength === 'moderate');
	$: warnings = synergies.filter(s => s.strength === 'warning');
</script>

{#if synergies.length > 0}
	<div>
		<span class="text-[9px] uppercase tracking-widest text-gray-500 mb-2 block">{$t('sts2.buildPage.synergies')}</span>
		<div class="space-y-1.5">
			{#each strongSynergies as syn}
				<div class="flex items-start gap-2 px-2 py-1.5 rounded bg-green-500/5 border border-green-500/20">
					<span class="text-[8px] font-mono font-bold shrink-0 px-1 py-0.5 rounded bg-green-500/15 text-green-400">{syn.icon}</span>
					<div>
						<span class="text-[10px] font-bold text-green-400">{syn.name}</span>
						<p class="text-[9px] text-gray-400 leading-tight">{syn.description}</p>
					</div>
				</div>
			{/each}

			{#each moderateSynergies as syn}
				<div class="flex items-start gap-2 px-2 py-1.5 rounded bg-blue-500/5 border border-blue-500/10">
					<span class="text-[8px] font-mono font-bold shrink-0 px-1 py-0.5 rounded bg-blue-500/15 text-blue-400">{syn.icon}</span>
					<div>
						<span class="text-[10px] font-bold text-blue-400">{syn.name}</span>
						<p class="text-[9px] text-gray-400 leading-tight">{syn.description}</p>
					</div>
				</div>
			{/each}

			{#each warnings as syn}
				<div class="flex items-start gap-2 px-2 py-1.5 rounded bg-yellow-500/5 border border-yellow-500/15">
					<span class="text-[8px] font-mono font-bold shrink-0 px-1 py-0.5 rounded bg-yellow-500/15 text-yellow-400">{syn.icon}</span>
					<div>
						<span class="text-[10px] font-bold text-yellow-400">{syn.name}</span>
						<p class="text-[9px] text-gray-400 leading-tight">{syn.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
