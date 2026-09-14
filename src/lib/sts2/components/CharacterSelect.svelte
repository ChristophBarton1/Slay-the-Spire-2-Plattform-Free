<script>
	import { CHARACTER_THEMES, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { selectedCharacter, clearDeck, loadStartingDeck } from '$lib/sts2/stores/deckStore';
	import { t } from 'svelte-i18n';

	export let characters = [];
	export let allCards = [];

	function selectChar(char) {
		const currentId = $selectedCharacter?.id;
		if (currentId !== char.id) {
			clearDeck();
			selectedCharacter.set(char);
			loadStartingDeck(char, allCards);
		}
	}

	$: theme = $selectedCharacter ? CHARACTER_THEMES[$selectedCharacter.id.toLowerCase()] || CHARACTER_THEMES.ironclad : null;
</script>

<div class="w-full">
	<h2 class="text-xs uppercase tracking-[3px] text-gray-400 mb-4">{$t('sts2.buildPage.chooseCharacter')}</h2>
	<div class="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
		{#each characters as char}
			{@const charTheme = CHARACTER_THEMES[char.id.toLowerCase()]}
			{@const isSelected = $selectedCharacter?.id === char.id}
			<button
				on:click={() => selectChar(char)}
				class="group relative overflow-hidden rounded-lg border transition-all duration-300 {isSelected ? 'border-opacity-80 scale-[1.02] ring-1' : 'border-white/10 hover:border-white/30'}"
				style="{isSelected ? `border-color: ${charTheme?.color}; box-shadow: 0 0 20px ${charTheme?.bgGlow}; ring-color: ${charTheme?.color}` : ''}"
			>
				<!-- Character Image -->
				<div class="relative aspect-[3/4] overflow-hidden bg-black/50">
					{#if char.image_url}
						<img
							src={getImageUrl(char.image_url, 200)}
							alt={char.name}
							class="w-full h-full object-cover object-top transition-transform duration-500 {isSelected ? 'scale-105' : 'group-hover:scale-110 opacity-60 group-hover:opacity-90'}"
							loading="lazy"
							decoding="async"
						/>
					{/if}
					<!-- Gradient overlay -->
					<div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

					<!-- Selected indicator -->
					{#if isSelected}
						<div class="absolute top-2 right-2 w-3 h-3 rounded-full animate-pulse" style="background: {charTheme?.color}; box-shadow: 0 0 8px {charTheme?.color}"></div>
					{/if}
				</div>

				<!-- Info -->
				<div class="absolute bottom-0 left-0 right-0 p-2 md:p-3">
					<h3 class="text-[10px] md:text-sm font-bold tracking-wider text-white truncate"
						style="{isSelected ? `color: ${charTheme?.color}` : ''}"
					>
						{char.name}
					</h3>
					<div class="flex items-center gap-1.5 mt-0.5 text-[8px] md:text-[10px] text-gray-400">
						<span>{char.starting_hp || '?'} HP</span>
						<span class="text-gray-600">·</span>
						<span>{char.max_energy || '?'} {$t('sts2.buildPage.cost')}</span>
						{#if char.orb_slots}
							<span class="text-gray-600">·</span>
							<span>{char.orb_slots} {$t('sts2.buildPage.orbs')}</span>
						{/if}
					</div>
				</div>
			</button>
		{/each}
	</div>

	<!-- Character description -->
	{#if $selectedCharacter && theme}
		<div class="mt-3 px-3 py-2 rounded-lg border transition-all duration-300"
			style="background: {theme.bgGlow}; border-color: {theme.color}40"
		>
			<p class="text-xs text-gray-300">
				<span class="font-semibold" style="color: {theme.color}">{$selectedCharacter.name}</span>
				— {theme.description}
			</p>
			<div class="flex flex-wrap gap-2 mt-1.5 text-[10px] text-gray-400">
				<span>{$t('sts2.buildPage.startingDeck')}: {$selectedCharacter.starting_deck?.length || 0} {$t('sts2.buildPage.cards')}</span>
				<span class="text-gray-600">•</span>
				<span>{$t('sts2.buildPage.gold')}: {$selectedCharacter.starting_gold || '?'}g</span>
			</div>
		</div>
	{/if}
</div>
