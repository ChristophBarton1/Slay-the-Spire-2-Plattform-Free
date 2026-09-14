import { redirect } from '@sveltejs/kit';

export function load({ url }: { url: URL }) {
	const tab = url.searchParams.get('tab');
	const target = tab
		? `/game-database?tab=${tab}`
		: '/game-database';
	redirect(301, target);
}
