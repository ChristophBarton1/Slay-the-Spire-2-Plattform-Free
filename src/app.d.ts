declare global {
	namespace App {
		interface Locals {
			// No account system in the standalone hub yet — deck saving / voting
			// endpoints treat every request as anonymous until auth is wired in.
			user: { id: string; username: string } | null;
			session: null;
		}
		interface PageData {
			user: { id: string; username: string } | null;
		}
		interface Platform {
			env?: {
				MATCH_CACHE?: KVNamespace;
				TURSO_DATABASE_URL?: string;
				TURSO_AUTH_TOKEN?: string;
			};
		}
	}
}
export {};
