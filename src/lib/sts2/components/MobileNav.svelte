<script>
	import { page } from '$app/stores';
	import { t } from 'svelte-i18n';

	$: path = $page.url.pathname;

	$: links = [
		{ href: '/', label: $t('sts2.nav.home'), icon: 'home', match: (p) => p === '/' },
		{ href: '/build', label: $t('sts2.nav.build'), icon: 'build', match: (p) => p === '/build' },
		{ href: '/game-database', label: $t('sts2.nav.cards'), icon: 'cards', match: (p) => p.startsWith('/game-database') || p.startsWith('/cards') },
		{ href: '/guides', label: $t('sts2.guides'), icon: 'guide', match: (p) => p.startsWith('/guides') },
		{ href: '/tier-list', label: $t('sts2.tierList'), icon: 'tier', match: (p) => p.startsWith('/tier-list') },
		{ href: '/synergies', label: $t('sts2.synergies'), icon: 'synergy', match: (p) => p.startsWith('/synergies') },
		{ href: '/decks', label: $t('sts2.nav.decks'), icon: 'decks', match: (p) => p.startsWith('/decks') },
	];
</script>

<!-- Mobile bottom nav - only visible on small screens -->
<nav class="sm:hidden fixed bottom-0 left-0 right-0 z-[9998] bg-[#161620]/98 backdrop-blur-lg border-t border-[#c8aa6e]/10 safe-bottom">
	<div class="flex items-stretch h-14 overflow-x-auto no-scrollbar">
		{#each links as link}
			{@const active = link.match(path)}
			<a
				href={link.href}
				class="flex flex-col items-center justify-center min-w-[3.5rem] flex-1 gap-0.5 px-1 transition-colors {active ? 'text-[#c8aa6e]' : 'text-gray-500 active:text-gray-300'}"
			>
				{#if link.icon === 'home'}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={active ? 2.5 : 1.5}>
						<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
					</svg>
				{:else if link.icon === 'build'}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={active ? 2.5 : 1.5}>
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
					</svg>
				{:else if link.icon === 'cards'}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={active ? 2.5 : 1.5}>
						<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
					</svg>
				{:else if link.icon === 'guide'}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={active ? 2.5 : 1.5}>
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
					</svg>
				{:else if link.icon === 'tier'}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={active ? 2.5 : 1.5}>
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
					</svg>
				{:else if link.icon === 'synergy'}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={active ? 2.5 : 1.5}>
						<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
					</svg>
				{:else if link.icon === 'decks'}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={active ? 2.5 : 1.5}>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
					</svg>
				{/if}
				<span class="text-[9px] font-semibold tracking-wider">{link.label}</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	.safe-bottom {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
