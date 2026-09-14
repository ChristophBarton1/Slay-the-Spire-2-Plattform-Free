<script>
	import { GENERAL_TIPS } from '$lib/sts2/data/guides';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t as tr } from 'svelte-i18n';

	export let data;

	$: section = data.section;
	$: otherSections = GENERAL_TIPS.filter(t => t.slug !== section.slug);
</script>

<svelte:head>
	<title>{$tr('sts2.guidePage.seoTitle', { values: { title: $tr(`sts2.tipsData.${section.slug}.title`) }})}</title>
	<meta name="description" content="{$tr(`sts2.tipsData.${section.slug}.description`)}">
	<link rel="canonical" href="https://STS2_DOMAIN/guides/tips/{section.slug}">
	<meta property="og:title" content="{$tr(`sts2.tipsData.${section.slug}.title`)} — STS2 Guide">
	<meta property="og:description" content="{$tr(`sts2.tipsData.${section.slug}.description`)}">
	<meta property="og:type" content="article">
	<meta property="og:url" content="https://STS2_DOMAIN/guides/tips/{section.slug}">
	<meta property="og:site_name" content="ggez.gg">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="{$tr(`sts2.tipsData.${section.slug}.title`)} — STS2 Guide">
	<meta name="twitter:description" content="{$tr(`sts2.tipsData.${section.slug}.description`)}">
	<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
</svelte:head>

<div class="relative z-10 min-h-screen bg-[#0a0a0f]">
	<!-- Top Bar -->
	<div class="sticky top-11 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[#c8aa6e]/10">
		<div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 sm:gap-3">
			<a href="/" class="text-sm text-[#c8aa6e]/80 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0 hidden sm:inline">GGEZ.GG</a>
			<span class="text-[#c8aa6e]/20 shrink-0 hidden sm:inline">/</span>
			<a href="/" class="text-sm text-gray-400 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0">StS2</a>
			<span class="text-[#c8aa6e]/20 shrink-0">/</span>
			<a href="/guides" class="text-sm text-gray-400 hover:text-[#c8aa6e] transition-colors tracking-wider shrink-0">{$tr('sts2.guides')}</a>
			<span class="text-[#c8aa6e]/20 shrink-0">/</span>
			<span class="text-sm font-bold truncate text-transparent bg-clip-text bg-gradient-to-r from-[#c8aa6e] to-[#f1ede3]">{$tr(`sts2.tipsData.${section.slug}.title`)}</span>
		</div>
	</div>

	<div class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
		<!-- Header -->
		<div class="mb-10 pb-6 border-b border-[#c8aa6e]/10">
			<div class="flex items-center gap-3 mb-3">
				<span class="px-2 py-0.5 bg-[#c8aa6e]/15 border border-[#c8aa6e]/30 text-[#c8aa6e] text-[9px] font-bold uppercase tracking-[2px]">Guide</span>
			</div>
			<h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide mb-2">{$tr(`sts2.tipsData.${section.slug}.title`)}</h1>
			<p class="text-sm text-gray-400 leading-relaxed">{$tr(`sts2.tipsData.${section.slug}.description`)}</p>
		</div>

		<!-- Tips -->
		<div class="grid grid-cols-1 gap-px bg-[#c8aa6e]/5 mb-14">
			{#each section.tips as tip, i}
				<div class="flex items-start gap-4 p-4 sm:p-5 bg-[#161620] hover:bg-[#0d0d12] transition-colors">
					<span class="w-7 h-7 shrink-0 flex items-center justify-center text-[10px] font-bold text-[#c8aa6e]/80 bg-[#c8aa6e]/5 border border-[#c8aa6e]/15">{i + 1}</span>
					<div class="flex-1 min-w-0">
						<h3 class="text-sm sm:text-base font-bold text-white mb-1.5">{$tr(`sts2.tipsData.${section.slug}.tips.${i}.heading`)}</h3>
						<p class="text-xs sm:text-sm text-gray-400 leading-relaxed">{$tr(`sts2.tipsData.${section.slug}.tips.${i}.text`)}</p>
					</div>
				</div>
			{/each}
		</div>

		<!-- Other sections -->
		<div class="mb-14">
			<div class="flex items-center gap-3 mb-6 pb-3 border-b border-[#c8aa6e]/10">
				<svg class="w-5 h-5 text-[#c8aa6e]/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
				<h3 class="text-[10px] uppercase tracking-[3px] font-bold text-gray-400">{$tr('sts2.moreGuides')}</h3>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
				{#each otherSections as other}
					<a href="/guides/tips/{other.slug}" class="group relative p-5 bg-[#161620] border border-[#c8aa6e]/10 hover:border-[#c8aa6e]/30 transition-all duration-300 overflow-hidden">
						<div class="flex items-center justify-between mb-2">
							<h4 class="text-sm font-bold text-white group-hover:text-[#c8aa6e] transition-colors">{$tr(`sts2.tipsData.${other.slug}.title`)}</h4>
							<span class="text-[9px] text-gray-600 shrink-0">{other.tips.length} {$tr('sts2.tips')}</span>
						</div>
						<p class="text-xs text-gray-500 leading-relaxed">{$tr(`sts2.tipsData.${other.slug}.description`)}</p>
						<div class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#c8aa6e] to-[#c8aa6e]/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
					</a>
				{/each}
			</div>
		</div>

		<!-- Back -->
		<div class="flex items-center justify-between pt-8 border-t border-[#c8aa6e]/10">
			<a href="/guides" class="text-sm text-gray-500 hover:text-[#c8aa6e] transition-colors font-medium tracking-wider">← {$tr('sts2.allGuides')}</a>
			<a href="/guides/bosses" class="inline-flex items-center gap-2 px-5 py-2.5 border border-[#c8aa6e]/20 hover:border-[#c8aa6e]/50 text-xs text-gray-400 hover:text-[#c8aa6e] font-bold tracking-wider transition-all">
				Boss Guide →
			</a>
		</div>
	</div>

	<!-- Bottom spacer for mobile nav -->
	<div class="h-16 sm:hidden"></div>
</div>

<MobileNav />
