// Shared deck: immutable once created, cache 1 day + serve stale for 1 week
export async function load({ setHeaders }: { setHeaders: (headers: Record<string, string>) => void }) {
	setHeaders({ 'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800' });
}
