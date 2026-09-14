// characters + cards are already provided by the STS2 layout — no re-fetch needed.
// Removing them saves ~563KB from the serialized SSR HTML payload.
// data.characters and data.cards in the page come from the parent layout load.
export async function load() {
	return {};
}
