<script>
	import { CHARACTER_THEMES, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { CHARACTER_GUIDES, TIER_LIST_DATA, GENERAL_TIPS } from '$lib/sts2/data/guides';
	import { BOSS_DATA, ACT_NAMES } from '$lib/sts2/data/bosses';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t } from 'svelte-i18n';
	import { getContext, onMount } from 'svelte';

	export let data;

	const localizedCards = getContext('localizedCards');

	// Scroll-reveal (same pattern as the STS2 hub page)
	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('in-view');
						io.unobserve(entry.target);
					}
				}
			},
			// Huge top margin: elements scrolled past still count as intersecting
			{ threshold: 0, rootMargin: '4000px 0px -40px 0px' }
		);
		document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
		return () => io.disconnect();
	});

	$: characters = data.characters || [];
	$: allCards = $localizedCards || data.cards || [];

	function findCard(id) {
		return allCards.find(c => c.id === id);
	}

	const CHAR_ORDER = ['ironclad','silent','defect','necrobinder','regent'];
	$: charEntries = CHAR_ORDER.map(id => {
		const char = characters.find(c => c.id.toLowerCase() === id);
		const guide = CHARACTER_GUIDES[id];
		const theme = CHARACTER_THEMES[id];
		const sTier = (TIER_LIST_DATA.cards[id]?.S || []).slice(0, 3);
		return { id, char, guide, theme, topCards: sTier.map(findCard).filter(Boolean) };
	}).filter(e => e.char && e.guide);
</script>

<svelte:head>
	<title>{$t('sts2.seo.guidesTitle')}</title>
	<meta name="description" content={$t('sts2.seo.guidesDesc')}>
	<meta name="keywords" content={$t('sts2.seo.guidesKeywords')}>
	<link rel="canonical" href="https://STS2_DOMAIN/guides">
	<meta property="og:title" content={$t('sts2.seo.guidesTitle')}>
	<meta property="og:description" content={$t('sts2.seo.guidesDesc')}>
	<meta property="og:type" content="website">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:url" content="https://STS2_DOMAIN/guides">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={$t('sts2.seo.guidesTitle')}>
	<meta name="twitter:description" content={$t('sts2.seo.guidesDesc')}>
	<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
</svelte:head>

<div class="sts2-shell relative z-10 min-h-screen">
	<!-- Breadcrumb -->
	<div class="sticky top-11 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[rgba(200,170,110,0.10)]">
		<div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
			<a href="/" class="text-sm font-extrabold text-[#c8aa6e] hover:text-[#e6c98a] transition-colors tracking-wide shrink-0 hidden sm:inline">GGEZ.GG</a>
			<span class="text-[#7c828f] shrink-0 hidden sm:inline">/</span>
			<a href="/" class="text-sm text-[#b9bcc6] hover:text-[#c8aa6e] transition-colors shrink-0">StS2</a>
			<span class="text-[#7c828f] shrink-0">/</span>
			<span class="text-sm font-bold text-[#f1ede3] shrink-0">{$t('sts2.guides')}</span>

			<div class="ml-auto flex items-center gap-2 shrink-0">
				<a href="/decks" class="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-xs text-[#b9bcc6] hover:text-[#f1ede3] transition-all font-medium">
					{$t('sts2.nav.decks')}
				</a>
				<a href="/synergies" class="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-xs text-[#b9bcc6] hover:text-[#f1ede3] transition-all font-medium">
					{$t('sts2.synergies')}
				</a>
				<a href="/tier-list" class="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-[rgba(200,170,110,0.15)] hover:border-[#c8aa6e]/45 text-xs text-[#b9bcc6] hover:text-[#f1ede3] transition-all font-medium">
					{$t('sts2.tierList')}
				</a>
			</div>
		</div>
	</div>

	<div class="max-w-7xl mx-auto px-4 py-12">
		<!-- Header -->
		<div class="mb-10">
			<h1 class="hero-in font-display text-4xl md:text-5xl font-bold text-[#f1ede3] tracking-tight mb-3" style="--d:0ms">
				{$t('sts2.characterGuides')}
			</h1>
			<p class="hero-in text-[#b9bcc6] text-base max-w-2xl leading-relaxed" style="--d:100ms">{$t('sts2.guidesDesc')}</p>
		</div>

		<!-- Character Guide Rows -->
		<div class="space-y-3 mb-16">
			{#each charEntries as { id, char, guide, theme, topCards }, ci}
				<a
					href="/guides/{guide.slug}"
					class="guide-card reveal group relative flex items-stretch overflow-hidden rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.08)]"
					style="--cc: {theme?.color}; --i: {ci}"
				>
					<!-- Character portrait -->
					<div class="relative w-24 sm:w-52 shrink-0 overflow-hidden">
						{#if char.image_url}
							<img
								src={getImageUrl(char.image_url, 200)}
								alt={char.name}
								class="w-full h-full object-cover object-top opacity-85 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700"
								loading={ci === 0 ? 'eager' : 'lazy'}
								fetchpriority={ci === 0 ? 'high' : 'auto'}
								decoding="async"
							/>
						{/if}
						<div class="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#14141c]"></div>
						<div class="absolute left-0 top-0 bottom-0 w-[2px]" style="background: linear-gradient(to bottom, {theme?.color}, transparent);"></div>
					</div>

					<!-- Content -->
					<div class="flex-1 py-4 px-4 sm:py-5 sm:px-6 flex flex-col justify-center min-w-0">
						<div class="flex items-center gap-3 mb-1.5">
							<h2 class="font-display text-lg sm:text-xl font-bold transition-colors" style="color: {theme?.colorLight || theme?.color}">{char.name}</h2>
							<div class="hidden sm:flex items-center gap-2 text-[10px] text-[#7c828f]">
								<span>{char.starting_hp} {$t('sts2.hp')}</span>
								<span>·</span>
								<span>{char.max_energy} {$t('sts2.energy')}</span>
								<span>·</span>
								<span>{guide.builds.length} {$t('sts2.builds')}</span>
							</div>
						</div>

						<p class="text-xs text-[#b9bcc6] leading-relaxed line-clamp-2 max-w-2xl mb-3">{$t(`sts2.guideData.${id}.overview`)}</p>

						<div class="flex items-center gap-4 flex-wrap">
							<!-- Build tags -->
							<div class="flex flex-wrap gap-1.5">
								{#each guide.builds as build, bi}
									<span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border" style="border-color: {theme?.color}30; color: {theme?.colorLight || theme?.color}; background: {theme?.color}0d">
										{$t(`sts2.guideData.${id}.builds.${bi}.name`)}
									</span>
								{/each}
							</div>
							<!-- S-tier card thumbnails -->
							{#if topCards.length > 0}
								<div class="hidden md:flex items-center gap-1.5">
									{#each topCards as card}
										{#if card.image_url}
											<div class="w-9 h-9 rounded-md overflow-hidden border border-[rgba(200,170,110,0.14)] shrink-0 group-hover:border-[#c8aa6e]/40 transition-colors">
												<img src={getImageUrl(card.image_url, 60)} alt={card.name} class="w-full h-full object-cover" loading="lazy" decoding="async" title={card.name} />
											</div>
										{/if}
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<!-- Arrow -->
					<div class="hidden sm:flex items-center px-5 text-[#7c828f] group-hover:text-[#c8aa6e] group-hover:translate-x-1 transition-all duration-300">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</div>
				</a>
			{/each}
		</div>

		<!-- Boss Guide Section -->
		<div class="mb-16">
			<div class="reveal flex items-center justify-between mb-5 pb-3 border-b border-[rgba(200,170,110,0.12)]">
				<h2 class="text-[10px] uppercase tracking-[3px] font-bold text-[#7c828f]">{$t('sts2.guidePage.bossGuide')}</h2>
				<a href="/guides/bosses" class="text-[10px] uppercase tracking-widest text-[#c8aa6e] hover:text-[#e6c98a] transition-colors font-bold">{$t('sts2.guidePage.allBosses')} →</a>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				{#each BOSS_DATA.slice(0, 6) as boss, bi}
					<a href="/guides/bosses/{boss.slug}" class="boss-card reveal group relative flex items-center gap-4 p-3.5 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.08)]" style="--i: {bi}">
						{#if boss.image}
							<div class="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0 border border-[rgba(200,170,110,0.14)]">
								<img src={getImageUrl(boss.image, 120)} alt={boss.name} class="w-full h-full object-cover object-top opacity-85 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" decoding="async" />
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							<h3 class="font-display text-sm font-bold text-[#f1ede3] group-hover:text-[#e6c98a] transition-colors truncate">{boss.name}</h3>
							<div class="flex items-center gap-2 text-[10px] text-[#7c828f] mt-0.5">
								<span class="text-red-400/90 font-bold">{boss.hp} HP</span>
								<span>·</span>
								<span>{ACT_NAMES[boss.act]}</span>
							</div>
						</div>
						<svg class="w-4 h-4 text-[#7c828f] group-hover:text-[#c8aa6e] group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</a>
				{/each}
			</div>
		</div>

		<!-- Tips & Strategy Section -->
		<div class="mb-16">
			<div class="reveal flex items-center justify-between mb-5 pb-3 border-b border-[rgba(200,170,110,0.12)]">
				<h2 class="text-[10px] uppercase tracking-[3px] font-bold text-[#7c828f]">{$t('sts2.guidePage.tipsAndStrategy')}</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
				{#each GENERAL_TIPS as section, si}
					<a href="/guides/tips/{section.slug}" class="tip-card reveal group relative p-5 rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.08)]" style="--i: {si}">
						<div class="flex items-center justify-between mb-2">
							<h3 class="font-display text-base font-bold text-[#f1ede3] group-hover:text-[#e6c98a] transition-colors">{$t(`sts2.tipsData.${section.slug}.title`)}</h3>
							<span class="text-[9px] text-[#7c828f] font-bold shrink-0">{section.tips.length} {$t('sts2.guidePage.tipsCount')}</span>
						</div>
						<p class="text-xs text-[#b9bcc6] leading-relaxed">{$t(`sts2.tipsData.${section.slug}.description`)}</p>
					</a>
				{/each}
			</div>
		</div>

		<!-- Navigation -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 border-t border-[rgba(200,170,110,0.12)]">
			<a href="/" class="text-sm text-[#7c828f] hover:text-[#c8aa6e] transition-colors font-medium">← {$t('sts2.hub')}</a>
			<div class="flex flex-wrap gap-2 sm:gap-3">
				<a href="/synergies" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#c8aa6e]/25 hover:border-[#c8aa6e]/55 text-xs text-[#b9bcc6] hover:text-[#f1ede3] font-bold transition-all">
					{$t('sts2.synergyExplorer')}
				</a>
				<a href="/tier-list" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c8aa6e] hover:bg-[#e6c98a] text-[#0a0a0f] text-xs font-bold transition-all">
					{$t('sts2.tierList')} →
				</a>
			</div>
		</div>
	</div>

	<!-- Bottom spacer for mobile nav -->
	<div class="h-16 sm:hidden"></div>
</div>

<MobileNav />

<style>
	.sts2-shell {
		background:
			radial-gradient(1100px 500px at 50% -180px, rgba(200, 170, 110, 0.07), transparent 65%),
			#0a0a0f;
		font-family: 'Inter', system-ui, sans-serif;
	}
	.font-display {
		font-family: var(--font-display, 'Cinzel', Georgia, serif);
	}

	.guide-card, .boss-card, .tip-card {
		transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
	}
	.guide-card:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--cc, #c8aa6e) 45%, transparent);
		box-shadow: 0 12px 40px -14px color-mix(in srgb, var(--cc, #c8aa6e) 40%, transparent);
	}
	.boss-card:hover, .tip-card:hover {
		transform: translateY(-2px);
		border-color: rgba(200, 170, 110, 0.30);
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-clamp: 2;
		overflow: hidden;
	}

	.hero-in {
		opacity: 0;
		transform: translateY(14px);
		animation: heroIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
		animation-delay: var(--d, 0ms);
	}
	@keyframes heroIn {
		from { opacity: 0; transform: translateY(14px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.reveal {
		opacity: 0;
		transform: translateY(18px);
		transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
		transition-delay: calc(var(--i, 0) * 60ms);
	}
	.reveal:global(.in-view) {
		opacity: 1;
		transform: none;
		/* Stagger only the entrance; hover border+shadow react instantly */
		transition-delay: calc(var(--i, 0) * 60ms), calc(var(--i, 0) * 60ms), 0ms, 0ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-in, .reveal {
			opacity: 1 !important;
			transform: none !important;
			animation: none !important;
			transition: none !important;
		}
		.guide-card:hover, .boss-card:hover, .tip-card:hover {
			transform: none !important;
		}
	}
</style>
