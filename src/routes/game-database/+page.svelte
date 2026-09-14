<script>
	import DatabasePage from '../cards/+page.svelte';
	import { t } from 'svelte-i18n';
	export let data;
</script>

<svelte:head>
	<title>{$t('sts2.seo.cardsTitle')}</title>
	<meta name="description" content={$t('sts2.seo.cardsDesc')}>
	<meta name="keywords" content={$t('sts2.seo.cardsKeywords')}>
	<link rel="canonical" href="https://STS2_DOMAIN/game-database">
	<meta property="og:title" content={$t('sts2.seo.cardsTitle')}>
	<meta property="og:description" content={$t('sts2.seo.cardsDesc')}>
	<meta property="og:type" content="website">
	<meta property="og:image" content="https://ggez.gg/og-sts2.jpg">
	<meta property="og:url" content="https://STS2_DOMAIN/game-database">
	<meta property="og:site_name" content="ggez.gg">
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={$t('sts2.seo.cardsTitle')}>
	<meta name="twitter:description" content={$t('sts2.seo.cardsDesc')}>
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": [
			{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://ggez.gg" },
			{ "@type": "ListItem", "position": 2, "name": "Slay the Spire 2", "item": "https://STS2_DOMAIN" },
			{ "@type": "ListItem", "position": 3, "name": "Game Database", "item": "https://STS2_DOMAIN/game-database" }
		]
	})}<\/script>`}
</svelte:head>

<DatabasePage {data} />
