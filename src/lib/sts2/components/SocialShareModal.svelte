<script>
	import { CHARACTER_THEMES } from '$lib/sts2/data/characterThemes';
	import { selectedCharacter, deck, selectedRelics } from '$lib/sts2/stores/deckStore';
	import { encodeDeck } from '$lib/sts2/utils/deckCode';
	import { t } from 'svelte-i18n';

	export let show = false;
	export let selectedPotions = [];

	let copiedLink = false;
	let copiedDiscord = false;

	$: theme = $selectedCharacter ? CHARACTER_THEMES[$selectedCharacter.id.toLowerCase()] : null;
	$: themeColor = theme?.color || '#c8aa6e';

	$: shareUrl = getShareUrl();
	$: deckSummary = buildDeckSummary();

	function getShareUrl() {
		if (!$selectedCharacter || typeof window === 'undefined') return '';
		const code = encodeDeck(
			$selectedCharacter.id,
			$deck.map(c => c.id),
			$selectedRelics.map(r => r.id),
			(selectedPotions || []).map(p => p.id)
		);
		return `${window.location.origin}/shared/${code}`;
	}

	function buildDeckSummary() {
		if (!$selectedCharacter) return { title: '', text: '', cardList: '' };
		const char = $selectedCharacter.name;
		const count = $deck.length;
		const attacks = $deck.filter(c => c.type === 'Attack').length;
		const skills = $deck.filter(c => c.type === 'Skill').length;
		const powers = $deck.filter(c => c.type === 'Power').length;

		// Top 5 rare/uncommon cards for the summary
		const keyCards = [...$deck]
			.filter(c => c.rarity === 'Rare' || c.rarity === 'Uncommon')
			.slice(0, 5)
			.map(c => c.name);

		const title = $t('sts2.share.deckTitle', { values: { char, count } });

		const cardList = keyCards.length > 0
			? $t('sts2.share.keyCards', { values: { cards: keyCards.join(', ') } })
			: '';

		const text = `${char} deck · ${count} cards (${attacks}A / ${skills}S / ${powers}P)${keyCards.length > 0 ? '\n' + cardList : ''}`;

		return { title, text, cardList };
	}

	async function copyLink() {
		if (!shareUrl) return;
		try {
			await navigator.clipboard.writeText(shareUrl);
			copiedLink = true;
			setTimeout(() => copiedLink = false, 2000);
		} catch {}
	}

	async function copyDiscordText() {
		const text = `**${deckSummary.title}**\n${deckSummary.text}\n🔗 ${shareUrl}`;
		try {
			await navigator.clipboard.writeText(text);
			copiedDiscord = true;
			setTimeout(() => copiedDiscord = false, 2000);
		} catch {}
	}

	function shareTwitter() {
		const text = encodeURIComponent(`${deckSummary.title}\n${deckSummary.text}`);
		const url = encodeURIComponent(shareUrl);
		window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener');
	}

	function shareReddit() {
		const title = encodeURIComponent(deckSummary.title);
		const url = encodeURIComponent(shareUrl);
		window.open(`https://www.reddit.com/submit?url=${url}&title=${title}`, '_blank', 'noopener');
	}

	function close() {
		show = false;
	}
</script>

{#if show}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" on:click|self={close}>
		<div class="absolute inset-0 bg-black/85 backdrop-blur-sm"></div>

		<div class="relative bg-[#08080b] border border-white/[0.08] w-full max-w-md shadow-2xl overflow-hidden">

			<!-- Header -->
			<div class="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between" style="background: linear-gradient(180deg, {themeColor}08 0%, transparent 100%)">
				<div class="flex items-center gap-3">
					<div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: {themeColor}15; border: 1px solid {themeColor}30">
						<svg class="w-5 h-5" style="color: {themeColor}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
						</svg>
					</div>
					<h3 class="text-base font-bold tracking-wider text-white">{$t('sts2.share.title')}</h3>
				</div>
				<button on:click={close} aria-label="Close share modal" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>

			<!-- Deck Summary -->
			{#if $selectedCharacter}
				<div class="px-6 pt-4 pb-2">
					<div class="p-3 border rounded-lg" style="border-color: {themeColor}20; background: {themeColor}08">
						<p class="text-xs font-bold text-white tracking-wider">{deckSummary.title}</p>
						<p class="text-[11px] text-gray-400 mt-1">{deckSummary.text}</p>
					</div>
				</div>
			{/if}

			<!-- Share Link -->
			<div class="px-6 pt-3 pb-2">
				<p class="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">{$t('sts2.share.deckLink')}</p>
				<div class="flex gap-2">
					<div class="flex-1 px-3 py-2 bg-[#161620] border border-white/[0.06] text-[11px] text-gray-400 truncate font-mono">
						{shareUrl || $t('sts2.share.selectCharFirst')}
					</div>
					<button
						on:click={copyLink}
						disabled={!shareUrl}
						class="px-4 py-2 text-[11px] font-bold tracking-wider uppercase border transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
						style="border-color: {copiedLink ? '#22c55e80' : themeColor + '40'}; color: {copiedLink ? '#22c55e' : themeColor}; background: {copiedLink ? '#22c55e10' : themeColor + '10'}"
					>
						{copiedLink ? $t('sts2.share.copied') : $t('sts2.share.copy')}
					</button>
				</div>
			</div>

			<!-- Social Buttons -->
			<div class="px-6 pt-3 pb-6 space-y-2">
				<p class="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-bold">{$t('sts2.share.shareOn')}</p>

				<!-- Discord -->
				<button
					on:click={copyDiscordText}
					disabled={!shareUrl}
					class="w-full flex items-center gap-3 px-4 py-3 border border-white/[0.06] hover:border-[#5865F2]/40 bg-[#161620] hover:bg-[#5865F2]/08 text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<div class="w-8 h-8 rounded-lg bg-[#5865F2]/15 flex items-center justify-center shrink-0 border border-[#5865F2]/20 group-hover:border-[#5865F2]/40 transition-colors">
						<svg class="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
						</svg>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm text-white font-medium">Discord</p>
						<p class="text-[10px] text-gray-500">{copiedDiscord ? $t('sts2.share.discordCopied') : $t('sts2.share.discordDesc')}</p>
					</div>
					{#if copiedDiscord}
						<span class="text-[10px] text-green-400 font-bold shrink-0">✓</span>
					{/if}
				</button>

				<!-- Reddit -->
				<button
					on:click={shareReddit}
					disabled={!shareUrl}
					class="w-full flex items-center gap-3 px-4 py-3 border border-white/[0.06] hover:border-[#FF4500]/40 bg-[#161620] hover:bg-[#FF4500]/08 text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<div class="w-8 h-8 rounded-lg bg-[#FF4500]/15 flex items-center justify-center shrink-0 border border-[#FF4500]/20 group-hover:border-[#FF4500]/40 transition-colors">
						<svg class="w-4 h-4 text-[#FF4500]" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
						</svg>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm text-white font-medium">Reddit</p>
						<p class="text-[10px] text-gray-500">{$t('sts2.share.redditDesc')}</p>
					</div>
					<svg class="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
				</button>

				<!-- Twitter / X -->
				<button
					on:click={shareTwitter}
					disabled={!shareUrl}
					class="w-full flex items-center gap-3 px-4 py-3 border border-white/[0.06] hover:border-white/20 bg-[#161620] hover:bg-white/[0.04] text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<div class="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
						<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
							<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
						</svg>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm text-white font-medium">X / Twitter</p>
						<p class="text-[10px] text-gray-500">{$t('sts2.share.twitterDesc')}</p>
					</div>
					<svg class="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
				</button>
			</div>
		</div>
	</div>
{/if}
