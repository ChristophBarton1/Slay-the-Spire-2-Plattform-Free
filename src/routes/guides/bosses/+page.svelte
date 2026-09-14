<script>
	import { BOSS_ACT_ORDER, ACT_NAMES, BOSS_DATA } from '$lib/sts2/data/bosses';
	import { getImageUrl } from '$lib/sts2/data/characterThemes';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';

	export let data;

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

	// Roman numeral + zone name per act key ('Act 1 — Overgrowth' → I / Overgrowth)
	const ACT_NUMERALS = { '1a': 'I', '1b': 'I', '2': 'II', '3': 'III' };
	function zoneName(act) {
		const full = ACT_NAMES[act] || '';
		return full.includes('—') ? full.split('—')[1].trim() : full;
	}

	$: bossByAct = BOSS_ACT_ORDER.map(act => ({
		act,
		name: ACT_NAMES[act],
		numeral: ACT_NUMERALS[act] || act,
		zone: zoneName(act),
		bosses: data.bosses.filter(b => b.act === act)
	}));

	$: totalBosses = data.bosses.length;

	// Featured bosses for the hero collage
	const HERO_BOSSES = BOSS_DATA.filter(b => b.image).slice(0, 4);
</script>

<svelte:head>
	<title>Boss Guide — All Bosses, Mechanics & Strategies — ggez.gg</title>
	<meta name="description" content="Complete Slay the Spire 2 boss guide. HP values, attack patterns, turn rotations, and strategies for all 11 bosses across Acts 1-3.">
	<meta name="keywords" content="StS2 boss guide, Slay the Spire 2 bosses, StS2 boss strategies, how to beat bosses StS2, StS2 boss HP, StS2 act bosses, StS2 boss patterns">
	<link rel="canonical" href="https://STS2_DOMAIN/guides/bosses">
	<meta property="og:title" content="STS2 Boss Guide — All Bosses & Strategies">
	<meta property="og:description" content="Complete boss guide with HP, attack patterns, and strategies for all 11 bosses in Slay the Spire 2.">
	<meta property="og:type" content="article">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:url" content="https://STS2_DOMAIN/guides/bosses">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="STS2 Boss Guide — All Bosses & Strategies">
	<meta name="twitter:description" content="Complete boss guide with HP, attack patterns, and strategies for all 11 bosses in Slay the Spire 2.">
	<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
</svelte:head>

<div class="sts2-shell relative z-10 min-h-screen">
	<!-- Breadcrumb -->
	<div class="sticky top-11 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[rgba(200,170,110,0.10)]">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
			<a href="/" class="text-sm font-extrabold text-[#c8aa6e] hover:text-[#e6c98a] transition-colors tracking-wide shrink-0 hidden sm:inline">GGEZ.GG</a>
			<span class="text-[#7c828f] shrink-0 hidden sm:inline">/</span>
			<a href="/" class="text-sm text-[#b9bcc6] hover:text-[#c8aa6e] transition-colors shrink-0">StS2</a>
			<span class="text-[#7c828f] shrink-0">/</span>
			<a href="/guides" class="text-sm text-[#b9bcc6] hover:text-[#c8aa6e] transition-colors shrink-0">{$t('sts2.guides')}</a>
			<span class="text-[#7c828f] shrink-0">/</span>
			<span class="text-sm font-bold text-[#f1ede3] shrink-0">{$t('sts2.guidePage.bosses')}</span>
		</div>
	</div>

	<!-- Hero — boss art collage -->
	<section class="relative overflow-hidden">
		<div class="absolute inset-0 flex" aria-hidden="true">
			{#each HERO_BOSSES as hb}
				<div class="flex-1 relative overflow-hidden">
					<img src={getImageUrl(hb.image, 400)} alt="" class="w-full h-full object-contain object-bottom opacity-35" loading="eager" decoding="async" />
				</div>
			{/each}
		</div>
		<div class="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/60 to-[#0a0a0f]"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-[#0a0a0f]/70"></div>
		<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ef4444]/40 to-transparent"></div>

		<div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
			<h1 class="hero-in font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#f1ede3] mb-4 tracking-tight" style="--d:0ms">{$t('sts2.guidePage.allBosses')}</h1>
			<p class="hero-in text-[#b9bcc6] text-base sm:text-lg max-w-2xl leading-relaxed mb-8" style="--d:100ms">HP values, attack patterns, turn rotations, and strategies for every boss in Slay the Spire 2.</p>

			<!-- Act quick-nav -->
			<div class="hero-in flex flex-wrap gap-2" style="--d:200ms">
				{#each bossByAct as { act, numeral, zone }}
					<a href="#act-{act}" class="act-pill group flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-lg bg-[#14141c]/80 backdrop-blur-sm border border-[rgba(200,170,110,0.14)] hover:border-[#c8aa6e]/45 transition-all">
						<span class="font-display text-base font-bold text-[#c8aa6e]">{numeral}</span>
						<span class="text-xs font-bold text-[#b9bcc6] group-hover:text-[#f1ede3] transition-colors">{zone}</span>
					</a>
				{/each}
				<span class="flex items-center px-3 py-2 text-[10px] uppercase tracking-[2px] font-bold text-[#7c828f]">{totalBosses} {$t('sts2.guidePage.bossesCount')}</span>
			</div>
		</div>
	</section>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
		{#each bossByAct as { act, numeral, zone, bosses }}
			<section id="act-{act}" class="mb-16 scroll-mt-24">
				<!-- Epic act header: oversized numeral + zone -->
				<div class="reveal flex items-end gap-4 mb-6">
					<span class="font-display text-5xl sm:text-6xl font-bold leading-none text-[#c8aa6e]/25 select-none" aria-hidden="true">{numeral}</span>
					<div class="pb-1">
						<h2 class="font-display text-xl sm:text-2xl font-bold text-[#f1ede3] leading-tight">{zone}</h2>
						<span class="text-[10px] uppercase tracking-[3px] font-bold text-[#7c828f]">{bosses.length} {bosses.length === 1 ? $t('sts2.guidePage.boss') : $t('sts2.guidePage.bossesCount')}</span>
					</div>
					<div class="flex-1 h-px mb-3 bg-gradient-to-r from-[rgba(200,170,110,0.25)] to-transparent"></div>
				</div>

				<!-- Boss cards: full-art, game-like -->
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{#each bosses as boss, bi}
						<a
							href="/guides/bosses/{boss.slug}"
							class="boss-card reveal group relative overflow-hidden rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.08)]"
							style="--i: {bi}"
						>
							<!-- Boss art: transparent monster PNGs → contain, centered, subtle danger glow -->
							<div class="relative h-52 sm:h-56 overflow-hidden boss-art-bg">
								{#if boss.image}
									<img
										src={getImageUrl(boss.image, 480)}
										alt={boss.name}
										class="w-full h-full object-contain object-center opacity-95 scale-[1.35] group-hover:scale-[1.45] transition-transform duration-700 drop-shadow-[0_16px_24px_rgba(0,0,0,0.6)]"
										loading={bi === 0 ? 'eager' : 'lazy'}
										decoding="async"
									/>
								{:else}
									<div class="w-full h-full bg-[#0e0e15] flex items-center justify-center">
										<span class="font-display text-4xl text-[#2a2a35]">?</span>
									</div>
								{/if}
								<div class="absolute inset-0 bg-gradient-to-t from-[#14141c] via-[#14141c]/25 to-transparent"></div>
								<!-- HP plate -->
								<div class="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0a0a0f]/80 backdrop-blur-sm border border-[rgba(239,68,68,0.25)]">
									<span class="text-xs font-bold text-red-400 tabular-nums">{boss.hp}</span>
									<span class="text-[9px] uppercase tracking-wider text-[#7c828f] font-bold">HP</span>
									<span class="text-[9px] text-[#7c828f]">·</span>
									<span class="text-[10px] font-bold text-[#b9bcc6] tabular-nums">{boss.hpAsc || boss.hp + 10}</span>
									<span class="text-[9px] uppercase tracking-wider text-[#7c828f] font-bold">A8+</span>
								</div>
							</div>

							<!-- Name + mechanics -->
							<div class="relative p-4 -mt-10">
								<h3 class="font-display text-xl font-bold text-[#f1ede3] group-hover:text-[#e6c98a] transition-colors mb-2">{boss.name}</h3>
								<div class="flex flex-wrap gap-1.5">
									{#each boss.mechanics.slice(0, 3) as mech}
										<span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-[#b9bcc6] bg-white/[0.04] border border-[rgba(200,170,110,0.10)]">{mech}</span>
									{/each}
									{#if boss.mechanics.length > 3}
										<span class="px-1.5 py-0.5 text-[9px] font-bold text-[#7c828f]">+{boss.mechanics.length - 3}</span>
									{/if}
								</div>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/each}

		<!-- Bottom navigation -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 border-t border-[rgba(200,170,110,0.12)]">
			<a href="/guides" class="text-sm text-[#7c828f] hover:text-[#c8aa6e] transition-colors font-medium">← {$t('sts2.guidePage.allGuides')}</a>
			<a href="/guides/tips/beginner-tips" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#c8aa6e]/25 hover:border-[#c8aa6e]/55 text-xs text-[#b9bcc6] hover:text-[#f1ede3] font-bold transition-all">
				{$t('sts2.guidePage.beginnerTips')} →
			</a>
		</div>
	</div>

	<div class="h-16 sm:hidden"></div>
</div>

<MobileNav />

<style>
	.sts2-shell {
		background:
			radial-gradient(1100px 500px at 50% -180px, rgba(239, 68, 68, 0.05), transparent 65%),
			#0a0a0f;
		font-family: 'Inter', system-ui, sans-serif;
	}
	.font-display {
		font-family: var(--font-display, 'Cinzel', Georgia, serif);
	}

	.boss-card {
		transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
	}
	/* Faint arena glow behind each monster so transparent art never sits on flat black */
	.boss-art-bg {
		background:
			radial-gradient(65% 55% at 50% 42%, rgba(239, 68, 68, 0.09), transparent 72%),
			radial-gradient(80% 45% at 50% 100%, rgba(200, 170, 110, 0.05), transparent 70%);
	}
	.boss-card:hover {
		transform: translateY(-3px);
		border-color: rgba(239, 68, 68, 0.35);
		box-shadow: 0 12px 40px -12px rgba(239, 68, 68, 0.25);
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
		/* Stagger only the entrance (opacity/transform); hover border+shadow react instantly */
		transition-delay: calc(var(--i, 0) * 60ms), calc(var(--i, 0) * 60ms), 0ms, 0ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-in, .reveal {
			opacity: 1 !important;
			transform: none !important;
			animation: none !important;
			transition: none !important;
		}
		.boss-card:hover {
			transform: none !important;
		}
	}
</style>
