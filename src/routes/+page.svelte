<script>
	import { CHARACTER_THEMES, getImageUrl } from '$lib/sts2/data/characterThemes';
	import { CHARACTER_GUIDES, TIER_LIST_DATA } from '$lib/sts2/data/guides';
	import MobileNav from '$lib/sts2/components/MobileNav.svelte';
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';

	export let data;

	// Scroll-reveal: fade+rise elements marked `.reveal` into view once, staggered
	// by their CSS-defined transition-delay. No-op (elements stay visible) when the
	// user prefers reduced motion.
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
			// Huge top margin: elements the user scrolled PAST (above viewport) still count
			// as intersecting, so fast scrolling never leaves sections stuck invisible.
			{ threshold: 0, rootMargin: '4000px 0px -40px 0px' }
		);
		document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
		return () => io.disconnect();
	});

	$: characters = data.characters || [];
	$: allCards = data.cards || [];

	function findCard(id) {
		return allCards.find(c => c.id === id);
	}

	// Hero card fan — five visually distinct S-tier arts from the database
	const FAN_IDS = ['CORRUPTION', 'GLACIER', 'DEMON_FORM', 'ENVENOM', 'BIASED_COGNITION'];
	$: fanCards = FAN_IDS.map(findCard).filter(Boolean);

	// Bento tile art
	$: bgDeckBuilder = [findCard('DEMON_FORM'), findCard('BARRICADE'), findCard('REAPER_FORM')].filter(Boolean);
	$: synergyPair = [findCard('NOXIOUS_FUMES'), findCard('CORRUPTION')].filter(Boolean);
	$: tierThumbs = ['ADRENALINE', 'SEVEN_STARS', 'VOID_FORM'].map(findCard).filter(Boolean);

	// Per-character showcase: portrait + top S-tier cards
	const CHAR_ORDER = ['ironclad', 'silent', 'defect', 'necrobinder', 'regent'];
	$: charShowcase = CHAR_ORDER.map(id => {
		const sTier = (TIER_LIST_DATA.cards[id]?.S || []).slice(0, 3);
		return {
			id,
			theme: CHARACTER_THEMES[id],
			guide: CHARACTER_GUIDES[id],
			char: characters.find(c => c.id.toLowerCase() === id),
			topCards: sTier.map(findCard).filter(Boolean)
		};
	}).filter(c => c.char);

	// Stat strip — counts match the curated i18n values used across STS2 pages
	$: stats = [
		{ value: '5', label: $t('sts2.characters'), href: '/guides' },
		{ value: '500+', label: $t('sts2.nav.cards'), href: '/cards' },
		{ value: '288', label: $t('sts2.nav.relics'), href: '/game-database?tab=relics' },
		{ value: '11', label: $t('sts2.bosses'), href: '/guides/bosses' }
	];
</script>

<svelte:head>
	<title>{$t('sts2.seo.homeTitle')}</title>
	<meta name="description" content={$t('sts2.seo.homeDesc')}>
	<meta name="keywords" content={$t('sts2.seo.homeKeywords')}>
	<link rel="canonical" href="https://STS2_DOMAIN">
	<meta property="og:title" content={$t('sts2.seo.homeTitle')}>
	<meta property="og:description" content={$t('sts2.seo.homeDesc')}>
	<meta property="og:type" content="website">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta name="twitter:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:url" content="https://STS2_DOMAIN">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={$t('sts2.seo.homeTitle')}>
	<meta name="twitter:description" content={$t('sts2.seo.homeDesc')}>
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "VideoGame",
		"name": "Slay the Spire 2",
		"description": "Slay the Spire 2 is a roguelike deckbuilding game by Mega Crit. Build a unique deck, encounter bizarre creatures, and discover powerful relics.",
		"genre": ["Roguelike", "Deck Building Game", "Strategy"],
		"gamePlatform": "PC",
		"operatingSystem": "Windows",
		"publisher": { "@type": "Organization", "name": "Mega Crit" },
		"url": "https://STS2_DOMAIN",
		"image": "https://ggez.gg/og-sts2.jpg",
		"sameAs": "https://store.steampowered.com/app/2868840/Slay_the_Spire_2/"
	})}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ggez.gg" },
			{ "@type": "ListItem", "position": 2, "name": "Slay the Spire 2", "item": "https://STS2_DOMAIN" }
		]
	})}</script>`}
</svelte:head>

<div class="sts2-shell relative z-10 min-h-screen">
	<!-- Grain overlay -->
	<div class="noise pointer-events-none fixed inset-0 z-0" aria-hidden="true"></div>

	<!-- Breadcrumb -->
	<div class="sticky top-14 z-40 bg-[#111118]/95 backdrop-blur-md border-b border-[rgba(200,170,110,0.10)]">
		<div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
			<a href="/" class="text-sm font-extrabold text-[#c8aa6e] hover:text-[#e6c98a] transition-colors tracking-wide">GGEZ.GG</a>
			<span class="text-[#7c828f]">/</span>
			<span class="text-sm font-bold tracking-wide text-[#f1ede3]">{$t('sts2.title')}</span>
		</div>
	</div>

	<!-- ============ HERO — split: copy left, card fan right ============ -->
	<section class="relative overflow-hidden">
		<div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8aa6e]/40 to-transparent"></div>

		<div class="relative max-w-7xl mx-auto px-4 pt-10 pb-8 sm:pt-14 sm:pb-10 lg:pt-16 lg:pb-12">
			<div class="grid lg:grid-cols-[minmax(0,1fr)_460px] gap-10 items-center">
				<!-- Copy -->
				<div>
					<h1 class="hero-in font-display text-[2.6rem] sm:text-6xl lg:text-[4.2rem] font-bold text-[#f1ede3] mb-5 leading-[1.05] tracking-tight" style="--d:0ms">
						{$t('sts2.hero.headline')}
					</h1>

					<p class="hero-in text-[#b9bcc6] text-base md:text-lg max-w-xl mb-8 leading-relaxed" style="--d:100ms">
						{$t('sts2.hero.sub')}
					</p>

					<div class="hero-in flex items-center gap-3 flex-wrap mb-10" style="--d:180ms">
						<a href="/build" class="px-7 py-3 rounded-lg bg-[#c8aa6e] hover:bg-[#e6c98a] text-[#0a0a0f] text-sm font-bold transition-all active:scale-[0.97]">
							{$t('sts2.hero.ctaPrimary')}
						</a>
						<a href="/synergies" class="px-7 py-3 rounded-lg border border-[#c8aa6e]/25 hover:border-[#c8aa6e]/50 text-[#b9bcc6] hover:text-[#f1ede3] text-sm font-bold transition-all active:scale-[0.97]">
							{$t('sts2.hero.ctaSecondary')}
						</a>
					</div>
					<!-- Stat strip — real navigation, not decoration -->
					<div class="hero-in grid grid-cols-4 max-w-xl border-t border-[rgba(200,170,110,0.12)]" style="--d:260ms">
						{#each stats as s}
							<a href={s.href} class="stat-link group pt-4 pr-4">
								<div class="text-xl sm:text-2xl font-bold text-[#f1ede3] group-hover:text-[#c8aa6e] transition-colors tabular-nums">{s.value}</div>
								<div class="text-[10px] uppercase tracking-[2px] text-[#7c828f] group-hover:text-[#b9bcc6] transition-colors font-bold mt-0.5">{s.label}</div>
							</a>
						{/each}
					</div>
				</div>

				<!-- Card fan — real art from the database (desktop only) -->
				<div class="hero-in relative hidden lg:block h-[380px]" style="--d:200ms" aria-hidden="true">
					{#if fanCards.length >= 5}
						<div class="fan absolute inset-0 flex items-center justify-center">
							{#each fanCards as card, i}
								<div
									class="fan-card absolute w-[180px] aspect-[3/4] rounded-xl overflow-hidden border border-[rgba(200,170,110,0.22)]"
									class:fan-center={i === 2}
									style="--r:{(i - 2) * 8}deg; --x:{(i - 2) * 78}px; --y:{Math.abs(i - 2) * 16}px; z-index:{10 - Math.abs(i - 2)};"
								>
									<img src={getImageUrl(card.image_url, 300)} alt="" class="w-full h-full object-cover" loading="eager" fetchpriority={i === 2 ? 'high' : 'auto'} decoding="async" />
									<div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/70 via-transparent to-transparent"></div>
								</div>
							{/each}
						</div>
						<!-- bottom fade into page -->
						<div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<div class="max-w-7xl mx-auto px-4 pt-10">
		<!-- ============ BENTO GRID — all tools, weighted by priority ============ -->
		<section class="mb-16">
			<div class="bento reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:auto-rows-[150px]">

				<!-- Deck Builder — hero tile 6x2 -->
				<a href="/build" class="tile group relative overflow-hidden rounded-xl sm:col-span-2 lg:col-span-6 lg:row-span-2 flex flex-col justify-end min-h-[220px]">
					{#if bgDeckBuilder.length}
						<div class="absolute -right-6 -top-8 flex" aria-hidden="true">
							{#each bgDeckBuilder as card, i}
								<div class="tile-art w-36 lg:w-44 aspect-[3/4] rounded-lg overflow-hidden -ml-14 border border-[rgba(200,170,110,0.14)]" style="transform: rotate({6 + i * 7}deg) translateY({i * 14}px);">
									<img src={getImageUrl(card.image_url, 300)} alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
								</div>
							{/each}
						</div>
					{/if}
					<div class="absolute inset-0 bg-gradient-to-tr from-[#14141c] via-[#14141c]/85 to-transparent"></div>
					<div class="relative p-6 lg:p-8">
						<span class="text-[10px] text-[#c8aa6e]/70 uppercase tracking-[3px] font-bold">{$t('sts2.allCardsRelics')}</span>
						<h3 class="font-display text-2xl lg:text-3xl font-bold text-[#f1ede3] mt-2 mb-2 group-hover:text-[#e6c98a] transition-colors">{$t('sts2.deckBuilder')}</h3>
						<p class="text-sm text-[#b9bcc6] max-w-md mb-4">{$t('sts2.bento.deckBuilder')}</p>
						<span class="inline-flex items-center gap-2 text-xs font-bold text-[#c8aa6e] group-hover:gap-3 transition-all">
							{$t('sts2.hero.ctaPrimary')}
							<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" /></svg>
						</span>
					</div>
				</a>

				<!-- Synergy Explorer — 3x2 -->
				<a href="/synergies" class="tile group relative overflow-hidden rounded-xl lg:col-span-3 lg:row-span-2 flex flex-col min-h-[220px]">
					<div class="relative flex-1 flex items-center justify-center py-6" aria-hidden="true">
						{#if synergyPair.length === 2}
							<div class="relative flex items-center gap-8">
								<div class="tile-art w-20 aspect-[3/4] rounded-lg overflow-hidden border border-[rgba(200,170,110,0.18)] rotate-[-6deg]">
									<img src={getImageUrl(synergyPair[0].image_url, 160)} alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
								</div>
								<!-- combo link line -->
								<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-px bg-gradient-to-r from-[#c8aa6e]/20 via-[#c8aa6e] to-[#c8aa6e]/20"></div>
								<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#c8aa6e] combo-dot"></div>
								<div class="tile-art w-20 aspect-[3/4] rounded-lg overflow-hidden border border-[rgba(200,170,110,0.18)] rotate-[6deg]">
									<img src={getImageUrl(synergyPair[1].image_url, 160)} alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
								</div>
							</div>
						{/if}
					</div>
					<div class="relative p-6 pt-0">
						<span class="text-[10px] text-[#c8aa6e]/70 uppercase tracking-[3px] font-bold">{$t('sts2.cardCombos')}</span>
						<h3 class="font-display text-xl font-bold text-[#f1ede3] mt-1.5 mb-1 group-hover:text-[#e6c98a] transition-colors">{$t('sts2.synergyExplorer')}</h3>
						<p class="text-xs text-[#b9bcc6]">{$t('sts2.bento.synergy')}</p>
					</div>
				</a>

				<!-- Tier List — 3x1 -->
				<a href="/tier-list" class="tile group relative overflow-hidden rounded-xl lg:col-span-3 p-5 flex flex-col justify-between min-h-[130px]">
					<div class="flex items-center gap-1.5" aria-hidden="true">
						<span class="tier-chip text-red-400 border-red-400/30 bg-red-400/10">S</span>
						<span class="tier-chip text-[#e6c98a] border-[#c8aa6e]/30 bg-[#c8aa6e]/10">A</span>
						<span class="tier-chip text-[#6ab7ff] border-blue-400/25 bg-blue-400/10">B</span>
						{#if tierThumbs.length}
							<div class="flex ml-2">
								{#each tierThumbs as card}
									<div class="w-7 h-7 rounded-md overflow-hidden border border-[rgba(200,170,110,0.18)] -ml-1.5 first:ml-0">
										<img src={getImageUrl(card.image_url, 60)} alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<div>
						<h3 class="font-display text-lg font-bold text-[#f1ede3] group-hover:text-[#e6c98a] transition-colors">{$t('sts2.tierList')}</h3>
						<p class="text-xs text-[#b9bcc6] mt-0.5">{$t('sts2.bento.tierList')}</p>
					</div>
				</a>

				<!-- Community Decks — 3x1 -->
				<a href="/decks" class="tile group relative overflow-hidden rounded-xl lg:col-span-3 p-5 flex flex-col justify-between min-h-[130px]">
					<span class="text-[10px] text-[#c8aa6e]/70 uppercase tracking-[3px] font-bold">{$t('sts2.communityDecksLabel')}</span>
					<div>
						<h3 class="font-display text-lg font-bold text-[#f1ede3] group-hover:text-[#e6c98a] transition-colors">{$t('sts2.communityDecks')}</h3>
						<p class="text-xs text-[#b9bcc6] mt-0.5">{$t('sts2.bento.decks')}</p>
					</div>
				</a>

				<!-- Character Guides — 3x1 -->
				<a href="/guides" class="tile group relative overflow-hidden rounded-xl lg:col-span-3 p-5 flex flex-col justify-between min-h-[130px]">
					<div class="flex" aria-hidden="true">
						{#each charShowcase as { char, theme }, i}
							{#if char.image_url}
								<div class="w-8 h-8 rounded-full overflow-hidden border-2 border-[#14141c] -ml-2 first:ml-0" style="box-shadow: 0 0 0 1px {theme?.color}50;">
									<img src={getImageUrl(char.image_url, 60)} alt="" class="w-full h-full object-cover object-top" loading="lazy" decoding="async" />
								</div>
							{/if}
						{/each}
					</div>
					<div>
						<h3 class="font-display text-lg font-bold text-[#f1ede3] group-hover:text-[#e6c98a] transition-colors">{$t('sts2.characterGuides')}</h3>
						<p class="text-xs text-[#b9bcc6] mt-0.5">{$t('sts2.bento.guides')}</p>
					</div>
				</a>

				<!-- Boss Guide — 3x1, only red accent on the page -->
				<a href="/guides/bosses" class="tile tile-boss group relative overflow-hidden rounded-xl lg:col-span-3 p-5 flex flex-col justify-between min-h-[130px]">
					<span class="text-[10px] text-red-400/80 uppercase tracking-[3px] font-bold">{$t('sts2.bossCount')}</span>
					<div>
						<h3 class="font-display text-lg font-bold text-[#f1ede3] group-hover:text-red-300 transition-colors">{$t('sts2.bossGuideTitle')}</h3>
						<p class="text-xs text-[#b9bcc6] mt-0.5">{$t('sts2.bento.boss')}</p>
					</div>
				</a>

				<!-- Game Database — quiet wide strip 6x1 -->
				<a href="/game-database" class="tile group relative overflow-hidden rounded-xl sm:col-span-2 lg:col-span-6 p-5 flex items-center justify-between gap-4 min-h-[100px]">
					<div class="min-w-0">
						<h3 class="font-display text-lg font-bold text-[#f1ede3] group-hover:text-[#e6c98a] transition-colors">{$t('sts2.databaseTitle')}</h3>
						<p class="text-xs text-[#b9bcc6] mt-0.5 truncate">{$t('sts2.bento.database')}</p>
					</div>
					<div class="hidden sm:flex items-center gap-4 shrink-0 text-[10px] uppercase tracking-[2px] font-bold text-[#7c828f]">
						<span>{$t('sts2.cardCount')}</span>
						<span class="w-1 h-1 rounded-full bg-[#c8aa6e]/40"></span>
						<span>{$t('sts2.relicCount')}</span>
					</div>
				</a>
			</div>
		</section>

		<!-- ============ CHARACTERS — 5 compact columns ============ -->
		<section class="mb-16">
			<div class="reveal flex items-center justify-between mb-5 pb-3 border-b border-[rgba(200,170,110,0.12)]">
				<h2 class="text-[10px] uppercase tracking-[3px] font-bold text-[#7c828f]">{$t('sts2.characters')}</h2>
				<a href="/guides" class="text-[10px] uppercase tracking-widest text-[#c8aa6e] hover:text-[#e6c98a] transition-colors font-bold">{$t('sts2.allGuides')} →</a>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
				{#each charShowcase as { id, theme, guide, char, topCards }, i}
					<a
						href={guide ? `/guides/${guide.slug}` : '/guides'}
						class="char-col reveal group relative overflow-hidden rounded-xl bg-[#14141c] border border-[rgba(200,170,110,0.08)] transition-all duration-300"
						style="--cc: {theme?.color}; --i: {i}"
					>
						<!-- Portrait -->
						<div class="relative aspect-[4/5] overflow-hidden">
							{#if char.image_url}
								<img
									src={getImageUrl(char.image_url, 240)}
									alt={char.name}
									class="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-700"
									loading={i === 0 ? 'eager' : 'lazy'}
									fetchpriority={i === 0 ? 'high' : 'auto'}
									decoding="async"
								/>
							{/if}
							<div class="absolute inset-0 bg-gradient-to-t from-[#14141c] via-transparent to-transparent"></div>
							<div class="absolute top-0 left-0 right-0 h-[2px]" style="background: linear-gradient(to right, {theme?.color}, transparent);"></div>
						</div>

						<!-- Info -->
						<div class="p-3.5 -mt-8 relative">
							<h3 class="font-display text-base font-bold mb-0.5" style="color: {theme?.colorLight || theme?.color}">{char.name}</h3>
							<div class="flex items-center gap-2 text-[10px] text-[#7c828f] mb-2.5">
								<span>{char.starting_hp} {$t('sts2.hp')}</span>
								<span>·</span>
								<span>{char.max_energy} {$t('sts2.energy')}</span>
							</div>
							{#if topCards.length > 0}
								<div class="flex items-center gap-1">
									{#each topCards as card}
										{#if card.image_url}
											<div class="w-9 h-9 rounded-md overflow-hidden border border-[rgba(200,170,110,0.14)] group-hover:border-[#c8aa6e]/40 transition-colors" title={card.name}>
												<img src={getImageUrl(card.image_url, 80)} alt={card.name} class="w-full h-full object-cover" loading="lazy" decoding="async" />
											</div>
										{/if}
									{/each}
								</div>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		</section>

		<!-- ============ BOTTOM CTA ============ -->
		<section class="reveal mb-16 text-center py-12 border-t border-[rgba(200,170,110,0.12)]">
			<h2 class="font-display text-2xl sm:text-3xl font-bold text-[#f1ede3] mb-6">{$t('sts2.readyToClimb')}</h2>
			<a href="/build" class="inline-block px-8 py-3 rounded-lg bg-[#c8aa6e] hover:bg-[#e6c98a] text-[#0a0a0f] text-sm font-bold transition-all active:scale-[0.97]">
				{$t('sts2.hero.ctaPrimary')}
			</a>
		</section>
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

	/* Film-grain: single SVG turbulence layer, kills the flat-digital look */
	.noise {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
		opacity: 0.022;
	}

	/* Bento tiles: one consistent surface + one consistent hover */
	.tile {
		background: #14141c;
		border: 1px solid rgba(200, 170, 110, 0.08);
		transition: transform 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
	}
	.tile:hover {
		background: #181822;
		border-color: rgba(200, 170, 110, 0.28);
		transform: translateY(-2px);
	}
	.tile-boss:hover {
		border-color: rgba(239, 68, 68, 0.35);
	}
	.tile-art {
		opacity: 0.55;
		transition: opacity 0.4s ease;
	}
	.tile:hover .tile-art {
		opacity: 0.85;
	}

	.tier-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 6px;
		border-width: 1px;
		font-size: 11px;
		font-weight: 700;
	}

	/* Hero card fan */
	.fan-card {
		transform: translateX(var(--x)) translateY(var(--y)) rotate(var(--r));
		transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
	}
	.fan-center {
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 44px rgba(200, 170, 110, 0.14);
	}
	.fan:hover .fan-card {
		transform: translateX(calc(var(--x) * 1.12)) translateY(var(--y)) rotate(var(--r));
	}

	/* Synergy combo dot: slow pulse along the link line */
	.combo-dot {
		animation: comboPulse 2.4s ease-in-out infinite;
	}
	@keyframes comboPulse {
		0%, 100% { box-shadow: 0 0 0 0 rgba(200, 170, 110, 0.45); }
		50% { box-shadow: 0 0 0 5px rgba(200, 170, 110, 0); }
	}

	.char-col:hover {
		border-color: color-mix(in srgb, var(--cc, #c8aa6e) 45%, transparent);
		transform: translateY(-2px);
	}
	.char-col {
		transition: transform 0.3s ease, border-color 0.3s ease;
	}

	.stat-link + .stat-link {
		border-left: 1px solid rgba(200, 170, 110, 0.1);
		padding-left: 1rem;
	}

	/* Hero entrance: fade + rise, staggered per element via --d */
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

	/* Scroll reveal: fade + rise into view once, staggered via --i on looped items */
	.reveal {
		opacity: 0;
		transform: translateY(18px);
		transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
		transition-delay: calc(var(--i, 0) * 60ms);
	}
	/* `in-view` is added at runtime by the IntersectionObserver — needs :global()
	   so Svelte doesn't prune the selector as unused CSS. */
	.reveal:global(.in-view) {
		opacity: 1;
		transform: none;
	}
	.bento.reveal :global(.tile) {
		opacity: 0;
		transform: translateY(18px);
		transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}
	.bento.reveal :global(.tile:nth-child(1)) { transition-delay: 0ms; }
	.bento.reveal :global(.tile:nth-child(2)) { transition-delay: 50ms; }
	.bento.reveal :global(.tile:nth-child(3)) { transition-delay: 100ms; }
	.bento.reveal :global(.tile:nth-child(4)) { transition-delay: 150ms; }
	.bento.reveal :global(.tile:nth-child(5)) { transition-delay: 200ms; }
	.bento.reveal :global(.tile:nth-child(6)) { transition-delay: 250ms; }
	.bento.reveal :global(.tile:nth-child(7)) { transition-delay: 300ms; }
	.bento.reveal:global(.in-view) :global(.tile) {
		opacity: 1;
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-in, .reveal, .bento.reveal :global(.tile) {
			opacity: 1 !important;
			transform: none !important;
			animation: none !important;
			transition: none !important;
		}
		.combo-dot {
			animation: none !important;
		}
		.fan-card, .tile, .char-col {
			transition: none !important;
		}
		.tile:hover, .char-col:hover {
			transform: none !important;
		}
	}
</style>
