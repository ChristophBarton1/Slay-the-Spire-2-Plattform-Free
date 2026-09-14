import { GENERAL_TIPS } from '$lib/sts2/data/guides';
import { error } from '@sveltejs/kit';

// Static — prerender at build.
export const prerender = true;
export const entries = () => GENERAL_TIPS.map((t: any) => ({ slug: t.slug }));

export async function load({ params }: { params: { slug: string } }) {
	const section = GENERAL_TIPS.find(t => t.slug === params.slug);
	if (!section) {
		throw error(404, 'Tips section not found');
	}
	return { section };
}
