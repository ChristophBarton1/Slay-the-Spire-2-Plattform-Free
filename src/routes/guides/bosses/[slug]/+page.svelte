<script>
	import { ACT_NAMES } from '$lib/sts2/data/bosses';
	import { getImageUrl } from '$lib/sts2/data/characterThemes';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t } from 'svelte-i18n';

	export let data;

	$: boss = data.boss;
	$: actName = ACT_NAMES[boss.act];
	$: prev = data.prev;
	$: next = data.next;
</script>

<svelte:head>
	<title>{boss.name} — Boss Guide & Strategy — ggez.gg</title>
	<meta name="description" content="How to beat {boss.name} in Slay the Spire 2. {boss.hp} HP ({boss.hpAsc || boss.hp + 10} A8+). Attack patterns, turn rotations, danger turns, and strategy tips.">
	<link rel="canonical" href="https://STS2_DOMAIN/guides/bosses/{boss.slug}">
	<meta property="og:title" content="{boss.name} — STS2 Boss Guide">
	<meta property="og:description" content="How to beat {boss.name}. {boss.hp} HP. {boss.dangerTurns}">
	<meta property="og:type" content="article">
	<meta property="og:url" content="https://STS2_DOMAIN/guides/bosses/{boss.slug}">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="{boss.name} — STS2 Boss Guide">
	<meta name="twitter:description" content="How to beat {boss.name}. {boss.hp} HP. {boss.dangerTurns}">
	{#if boss.image}
		<meta property="og:image" content="https://ggez.gg{getImageUrl(boss.image, 600)}">
		<meta name="twitter:image" content="https://ggez.gg{getImageUrl(boss.image, 600)}">
	{:else}
		<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
		<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "Article",
		"headline": `How to Beat ${boss.name} — Slay the Spire 2 Boss Guide`,
		"description": `${boss.hp} HP (${boss.hpAsc || boss.hp + 10} A8+). ${boss.dangerTurns}`,
		"url": `https://STS2_DOMAIN/guides/bosses/${boss.slug}`,
		"author": { "@type": "Organization", "name": "ggez.gg", "url": "https://ggez.gg" },
		"publisher": { "@type": "Organization", "name": "ggez.gg", "url": "https://ggez.gg" },
		"datePublished": "2024-01-01",
		"dateModified": new Date().toISOString().split('T')[0],
		"mainEntityOfPage": { "@type": "WebPage", "@id": `https://STS2_DOMAIN/guides/bosses/${boss.slug}` }
	})}</script>`}
</svelte:head>

<div class="relative z-10 min-h-screen bg-[#0a0a0f]">
	<!-- Breadcrumb -->
	<div class="sticky top-11 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[#c8aa6e]/10">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3 overflow-x-auto">
			<a href="/" class="text-sm text-[#c8aa6e]/80 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0 hidden sm:inline">GGEZ.GG</a>
			<span class="text-[#c8aa6e]/20 shrink-0 hidden sm:inline">/</span>
			<a href="/" class="text-sm text-gray-400 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0">StS2</a>
			<span class="text-[#c8aa6e]/20 shrink-0">/</span>
			<a href="/guides" class="text-sm text-gray-400 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0">{$t('sts2.guides')}</a>
			<span class="text-[#c8aa6e]/20 shrink-0">/</span>
			<a href="/guides/bosses" class="text-sm text-gray-400 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0">{$t('sts2.guidePage.bosses')}</a>
			<span class="text-[#c8aa6e]/20 shrink-0">/</span>
			<span class="text-sm font-bold truncate text-transparent bg-clip-text bg-gradient-to-r from-[#c8aa6e] to-[#f1ede3]">{boss.name}</span>
		</div>
	</div>

	<!-- Hero — Full-bleed boss art background (like character guide pages) -->
	<section class="relative overflow-hidden border-b border-[#c8aa6e]/10">
		{#if boss.image}
			<div class="absolute inset-0">
				<img src={getImageUrl(boss.image, 800)} alt="Image" class="w-full h-full object-cover object-top opacity-20 scale-110" decoding="async" />
			</div>
		{/if}
		<div class="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/85 to-[#0a0a0f]/60"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>

		<div class="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
			<div class="flex flex-col sm:flex-row items-start gap-6 sm:gap-10">
				<!-- Boss portrait -->
				{#if boss.image}
					<div class="w-28 h-28 sm:w-36 sm:h-36 overflow-hidden border-2 border-[#c8aa6e]/30 shrink-0 shadow-lg shadow-black/50">
						<img src={getImageUrl(boss.image, 400)} alt={boss.name} class="w-full h-full object-cover object-top" decoding="async" />
					</div>
				{/if}
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-3 mb-3">
						<span class="px-2 py-0.5 bg-[#c8aa6e]/15 border border-[#c8aa6e]/30 text-[#c8aa6e] text-[9px] font-bold uppercase tracking-[2px]">{$t('sts2.guidePage.bossGuide')}</span>
						<span class="text-[10px] text-gray-500 uppercase tracking-widest font-medium">{actName}</span>
					</div>
					<h1 class="text-2xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#c8aa6e] via-[#f1ede3] to-[#c8aa6e]">{boss.name}</h1>
					<p class="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl mb-4">{boss.dangerTurns}</p>
					<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
						<div class="flex items-center gap-2">
							<span class="text-gray-500">HP</span>
							<span class="font-bold text-base text-white">{boss.hp}</span>
						</div>
						<div class="w-px h-4 bg-[#c8aa6e]/15"></div>
						<div class="flex items-center gap-2">
							<span class="text-gray-500">A8+</span>
							<span class="font-bold text-base text-gray-400">{boss.hpAsc || boss.hp + 10}</span>
						</div>
						{#if boss.hpNote}
							<div class="w-px h-4 bg-[#c8aa6e]/15"></div>
							<span class="text-gray-500">{boss.hpNote}</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Content -->
	<div class="max-w-5xl mx-auto px-4 sm:px-6 py-10">

		<!-- Quick Info: Mechanics + Danger -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#c8aa6e]/10 border border-[#c8aa6e]/10 mb-10 sm:mb-14">
			<div class="relative p-4 sm:p-6 bg-[#161620] overflow-hidden">
				{#if boss.image}
					<div class="absolute right-0 top-0 w-32 sm:w-40 h-full pointer-events-none opacity-[0.05]">
						<img src={getImageUrl(boss.image, 200)} alt="Image" class="w-full h-full object-cover object-top" loading="lazy" decoding="async" />
						<div class="absolute inset-0 bg-gradient-to-r from-[#161620] via-transparent to-transparent"></div>
					</div>
				{/if}
				<h3 class="relative text-[10px] uppercase tracking-[3px] text-[#c8aa6e] font-bold mb-4 pb-2 border-b border-[#c8aa6e]/20">{$t('sts2.guidePage.mechanics')}</h3>
				<div class="relative flex flex-wrap gap-2">
					{#each boss.mechanics as mech}
						<span class="px-2.5 py-1 text-xs text-gray-300 bg-white/[0.03] border border-[#c8aa6e]/10">{mech}</span>
					{/each}
				</div>
			</div>
			<div class="p-4 sm:p-6 bg-[#161620]">
				<h3 class="text-[10px] uppercase tracking-[3px] text-[#c8aa6e] font-bold mb-4 pb-2 border-b border-[#c8aa6e]/20">{$t('sts2.guidePage.dangerTurns')}</h3>
				<p class="text-sm text-gray-300 leading-relaxed">{boss.dangerTurns}</p>
			</div>
		</div>

		<!-- Attack Patterns -->
		<section class="mb-10 sm:mb-14">
			<div class="flex items-center gap-3 mb-6 pb-3 border-b border-[#c8aa6e]/10">
				<svg class="w-5 h-5 text-[#c8aa6e]/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
				<h2 class="text-base sm:text-lg font-bold text-white tracking-wider uppercase">{$t('sts2.guidePage.attackPatterns')}</h2>
			</div>

			<div class="space-y-8">
				{#each boss.phases as phase, pi}
					<div>
						<div class="flex items-center gap-3 mb-3">
							<span class="text-4xl sm:text-5xl font-bold text-white/[0.04]">0{pi + 1}</span>
							<span class="text-xs font-bold uppercase tracking-[2px] text-gray-400">{phase.name}</span>
						</div>

						<div class="border border-[#c8aa6e]/8 overflow-hidden">
							{#each phase.moves as move, mi}
								<div class="flex items-start {mi > 0 ? 'border-t border-[#c8aa6e]/5' : ''} bg-[#161620] hover:bg-[#0d0d12] transition-colors">
									<div class="w-14 sm:w-16 shrink-0 flex flex-col items-center justify-center py-4 border-r border-[#c8aa6e]/5">
										<span class="text-[10px] font-bold text-[#c8aa6e]/50">T{move.turn}</span>
									</div>
									<div class="flex-1 px-4 py-3.5">
										<div class="flex items-center gap-2 mb-0.5">
											<span class="text-sm font-bold text-white">{move.name}</span>
										</div>
										<p class="text-xs text-gray-400 leading-relaxed">{move.effect}</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Strategy -->
		<section class="mb-10 sm:mb-14">
			<div class="flex items-center gap-3 mb-6 pb-3 border-b border-[#c8aa6e]/10">
				<svg class="w-5 h-5 text-[#c8aa6e]/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
				<h2 class="text-base sm:text-lg font-bold text-white tracking-wider uppercase">{$t('sts2.guidePage.strategy')}</h2>
			</div>

			<div class="grid grid-cols-1 gap-px bg-[#c8aa6e]/5">
				{#each boss.strategy as tip, si}
					<div class="flex items-start gap-4 p-4 bg-[#161620] hover:bg-[#0d0d12] transition-colors">
						<span class="w-7 h-7 shrink-0 flex items-center justify-center text-[10px] font-bold text-[#c8aa6e]/80 bg-[#c8aa6e]/5 border border-[#c8aa6e]/15">{si + 1}</span>
						<p class="text-sm text-gray-300 leading-relaxed flex-1 pt-1">{tip}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Best Counters -->
		<section class="mb-10 sm:mb-14">
			<div class="flex items-center gap-3 mb-6 pb-3 border-b border-[#c8aa6e]/10">
				<svg class="w-5 h-5 text-[#c8aa6e]/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
				<h2 class="text-base sm:text-lg font-bold text-white tracking-wider uppercase">{$t('sts2.guidePage.bestCounters')}</h2>
			</div>
			<div class="flex flex-wrap gap-2">
				{#each boss.counters as counter}
					<span class="px-3 py-1.5 text-xs text-gray-300 bg-[#c8aa6e]/[0.04] border border-[#c8aa6e]/15 leading-snug">{counter}</span>
				{/each}
			</div>
		</section>

		<!-- Prev / Next navigation -->
		<div class="flex items-center justify-between gap-3 pt-8 border-t border-[#c8aa6e]/10">
			{#if prev}
				<a href="/guides/bosses/{prev.slug}" class="group flex items-center gap-3 overflow-hidden">
					{#if prev.image}
						<div class="w-10 h-10 overflow-hidden border border-[#c8aa6e]/15 shrink-0 hidden sm:block">
							<img src={getImageUrl(prev.image, 80)} alt="Image" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" loading="lazy" decoding="async" />
						</div>
					{/if}
					<div>
						<div class="text-[9px] text-gray-600 uppercase tracking-widest">{$t('sts2.guidePage.previous')}</div>
						<span class="text-sm text-gray-400 group-hover:text-[#c8aa6e] transition-colors font-medium">{prev.name}</span>
					</div>
				</a>
			{:else}
				<a href="/guides/bosses" class="text-sm text-gray-500 hover:text-[#c8aa6e] transition-colors font-medium">← {$t('sts2.guidePage.allBosses')}</a>
			{/if}
			{#if next}
				<a href="/guides/bosses/{next.slug}" class="group flex items-center gap-3 overflow-hidden text-right">
					<div>
						<div class="text-[9px] text-gray-600 uppercase tracking-widest">{$t('sts2.guidePage.next')}</div>
						<span class="text-sm text-gray-400 group-hover:text-[#c8aa6e] transition-colors font-medium">{next.name}</span>
					</div>
					{#if next.image}
						<div class="w-10 h-10 overflow-hidden border border-[#c8aa6e]/15 shrink-0 hidden sm:block">
							<img src={getImageUrl(next.image, 80)} alt="Image" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" loading="lazy" decoding="async" />
						</div>
					{/if}
				</a>
			{:else}
				<a href="/guides" class="inline-flex items-center gap-2 px-5 py-2.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] font-bold tracking-wider transition-all">
					{$t('sts2.guidePage.allGuides')} →
				</a>
			{/if}
		</div>
	</div>

	<div class="h-16 sm:hidden"></div>
</div>

<MobileNav />
