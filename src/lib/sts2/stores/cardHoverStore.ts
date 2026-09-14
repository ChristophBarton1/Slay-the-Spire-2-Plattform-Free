import { writable } from 'svelte/store';

export interface HoverPosition {
	x: number;
	y: number;
}

export const hoveredCard = writable<Record<string, unknown> | null>(null);
export const hoverPosition = writable<HoverPosition>({ x: 0, y: 0 });
export const showUpgradedCards = writable<boolean>(false);

export function showCardHover(card: Record<string, unknown>, event: MouseEvent): void {
	hoveredCard.set(card);
	updateHoverPosition(event);
}

export function updateHoverPosition(event: MouseEvent): void {
	const x = event.clientX + 16;
	const y = event.clientY - 120;
	hoverPosition.set({
		x: Math.min(x, window.innerWidth - 290),
		y: Math.max(8, Math.min(y, window.innerHeight - 420))
	});
}

export function hideCardHover(): void {
	hoveredCard.set(null);
}
