# sts2-hub

Slay the Spire 2 hub (deck builder, card database, tier list, guides), split out of ggez.gg.

- SvelteKit 2 + Svelte 5 (legacy mode) + Tailwind 3, Cloudflare Pages adapter.
- Game data is static JSON in `static/data/sts2/`.
- Deck gallery + tier votes use Turso/libsql (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`).
  Without an account system every request is anonymous (see `src/hooks.server.ts`).
- Replace `STS2_DOMAIN` (canonical URLs, robots.txt) with the real domain before launch.

```bash
npm install
npm run dev
npm run build
```
