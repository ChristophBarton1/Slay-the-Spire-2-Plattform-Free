export interface KeyCard {
	id: string;
	note: string;
	priority: 'core' | 'early' | 'payoff';
}

export interface KeyRelic {
	id: string;
	note: string;
}

export interface Build {
	name: string;
	description: string;
	fullDeck: string[];
	keyCards: KeyCard[];
	keyRelics: KeyRelic[];
	tips: string[];
}

export interface BossMatchup {
	boss: string;
	difficulty: 'easy' | 'medium' | 'hard';
	tip: string;
}

export interface AscensionTip {
	tip: string;
	cards: string[];
	relics: string[];
}

export interface DraftPriority {
	phase: string;
	cards: string;
	note: string;
}

export interface CharacterGuide {
	slug: string;
	name: string;
	title: string;
	overview: string;
	startingRelic: string;
	weaknessImage: string;
	strengths: string[];
	weaknesses: string[];
	builds: Build[];
	bossMatchups: BossMatchup[];
	ascensionTips: AscensionTip[];
	draftPriority: DraftPriority[];
}

export interface GeneralTipEntry {
	heading: string;
	text: string;
}

export interface GeneralTipSection {
	title: string;
	slug: string;
	description: string;
	tips: GeneralTipEntry[];
}

export interface TierListCharacterData {
	S: string[];
	A: string[];
	B: string[];
	C: string[];
	D: string[];
}

export interface TierListData {
	cards: Record<string, TierListCharacterData>;
}

export interface TierData {
	S: string[];
	A: string[];
	B: string[];
	C: string[];
	D: string[];
}

export const CHARACTER_GUIDES: Record<string, CharacterGuide> = {
	ironclad: {
		slug: 'ironclad',
		name: 'The Ironclad',
		title: 'Ironclad Guide — Decks, Playstyle & Strategy',
		overview: 'The Ironclad is the bruiser of Slay the Spire 2. His cards revolve around HP manipulation, Strength scaling, and Exhaust synergies. Burning Blood heals him after every combat, making him forgiving for newer players while still offering deep build variety.',
		startingRelic: 'Burning Blood — heals for a small amount at the end of each combat.',
		weaknessImage: '/static/images/monsters/lagavulin_matriarch.png',
		strengths: [
			'Easy to pilot and beginner friendly',
			'Heals after combat via Burning Blood',
			'Straightforward Strength scaling mechanics',
			'High damage ceiling with multi-hit attacks'
		],
		weaknesses: [
			'Exhaust can be awkward to manage',
			'Self-damage builds require careful HP management',
			'Relies on setup turns for scaling builds',
			'Vulnerable to enemies that remove buffs'
		],
		builds: [
			{
				name: 'Strength Build',
				description: 'Strength remains the Ironclad\'s primary scaling method. Buff Strength with cheap generators, then leverage multi-hit attacks where each hit benefits from the bonus. Simple to pilot and effective at all Ascension levels.',
				fullDeck: ['INFLAME','INFLAME','DEMON_FORM','WHIRLWIND','TWIN_STRIKE','TWIN_STRIKE','THRASH','BRAND','POMMEL_STRIKE','BATTLE_TRANCE','OFFERING','SHRUG_IT_OFF','SHRUG_IT_OFF','FLAME_BARRIER','UPPERCUT','HEADBUTT','BASH','DEFEND_IRONCLAD','DEFEND_IRONCLAD','DEFEND_IRONCLAD'],
				keyCards: [
					{ id: 'INFLAME', note: 'Cheap Strength generator — play early for immediate value', priority: 'core' },
					{ id: 'TWIN_STRIKE', note: 'Hits twice, each benefiting from Strength', priority: 'early' },
					{ id: 'WHIRLWIND', note: 'Best multi-hit card with AoE — scales with both Strength and Energy', priority: 'core' },
					{ id: 'DEMON_FORM', note: 'Best passive Strength generation, but requires setup turn', priority: 'payoff' },
					{ id: 'THRASH', note: 'Multi-hit attack that scales with Strength on each hit', priority: 'early' },
					{ id: 'BRAND', note: 'Thins your deck of Strikes/Defends and scales with Rupture', priority: 'payoff' }
				],
				keyRelics: [
					{ id: 'ANCHOR', note: 'Free Block on turn 1 — buys time to set up Demon Form' },
					{ id: 'BRIMSTONE', note: 'Risk/reward — huge Strength but enemies gain some too' },
					{ id: 'SWORD_OF_JADE', note: 'Free Strength with no downside' }
				],
				tips: [
					'Multi-hit cards benefit from Strength on each hit — prioritize them over single-hit attacks',
					'Vulnerable amplifies high-damage Strength attacks significantly — even one source helps',
					'Extra Energy allows you to set up Demon Form and still play cards the same turn',
					'In Act 1, take Inflame or any cheap Strength source over expensive scaling like Demon Form'
				]
			},
			{
				name: 'Block Build',
				description: 'Stack Block with Barricade, Stone Armor, and defensive powers, then convert your massive Block into damage with Body Slam. Very safe once online, but slow to set up — prioritize defensive cards early.',
				fullDeck: ['BARRICADE','BODY_SLAM','BODY_SLAM','IMPERVIOUS','STONE_ARMOR','SHRUG_IT_OFF','SHRUG_IT_OFF','FLAME_BARRIER','TRUE_GRIT','ARMAMENTS','BATTLE_TRANCE','OFFERING','IRON_WAVE','JUGGERNAUT','UNMOVABLE','POMMEL_STRIKE','HEADBUTT','BASH','DEFEND_IRONCLAD','DEFEND_IRONCLAD'],
				keyCards: [
					{ id: 'BARRICADE', note: 'Core power — Block no longer resets at start of turn', priority: 'core' },
					{ id: 'BODY_SLAM', note: 'Converts your entire Block stack into damage — the win condition', priority: 'core' },
					{ id: 'IMPERVIOUS', note: 'Massive single-turn Block — great for surviving big hits', priority: 'core' },
					{ id: 'STONE_ARMOR', note: 'Gives Plating for passive Block every turn', priority: 'early' },
					{ id: 'SHRUG_IT_OFF', note: 'Solid Block + card draw — always useful', priority: 'early' }
				],
				keyRelics: [
					{ id: 'ANCHOR', note: 'Free Block on turn 1 — stacks with Barricade' },
					{ id: 'HORN_CLEAT', note: 'Block on turn 1 — helps survive until setup is complete' },
					{ id: 'PERMAFROST', note: 'Adds passive Block generation each turn' }
				],
				tips: [
					'Barricade is the single most important card — without it, Block resets each turn and the build falls apart',
					'Body Slam is your only reliable damage source, so take it early when offered',
					'Look for Dexterity sources to scale Block passively alongside your powers',
					'This build struggles in Act 1 before you find Barricade — take strong early Attacks to survive'
				]
			},
			{
				name: 'Exhaust Build',
				description: 'Thin your deck mid-combat by Exhausting cards, triggering powerful on-exhaust effects. Corruption makes all Skills free but Exhausts them — pair with Feel No Pain for Block and Dark Embrace for draw. High skill ceiling but devastating when assembled.',
				fullDeck: ['CORRUPTION','DARK_EMBRACE','FEEL_NO_PAIN','FEEL_NO_PAIN','FIEND_FIRE','SECOND_WIND','OFFERING','BURNING_PACT','BATTLE_TRANCE','TRUE_GRIT','SHRUG_IT_OFF','SHRUG_IT_OFF','POMMEL_STRIKE','HEADBUTT','HAVOC','BASH','DEFEND_IRONCLAD','DEFEND_IRONCLAD','DEFEND_IRONCLAD','SETUP_STRIKE'],
				keyCards: [
					{ id: 'CORRUPTION', note: 'Makes all Skills cost 0 but Exhausts them — the engine', priority: 'core' },
					{ id: 'DARK_EMBRACE', note: 'Draw a card whenever you Exhaust — keeps your hand full', priority: 'core' },
					{ id: 'FEEL_NO_PAIN', note: 'Gain Block on every Exhaust — your defense while comboing', priority: 'core' },
					{ id: 'FIEND_FIRE', note: 'Exhausts entire hand for massive single-target damage', priority: 'payoff' },
					{ id: 'SECOND_WIND', note: 'Exhausts all non-Attack cards for Block — great with Corruption', priority: 'early' }
				],
				keyRelics: [
					{ id: 'CHARONS_ASHES', note: 'Deals damage to all enemies whenever you Exhaust a card' },
					{ id: 'BURNING_BLOOD', note: 'Post-combat heal offsets any chip damage from aggressive plays' }
				],
				tips: [
					'Corruption + Dark Embrace is the dream combo — play every Skill for free and draw replacements',
					'Feel No Pain is your defense — without it, Exhausting your Skills leaves you vulnerable',
					'Don\'t play Corruption until you have at least one on-exhaust payoff in play',
					'Be careful not to Exhaust cards you still need — plan your turn order before playing'
				]
			},
			{
				name: 'Bloodletting Build',
				description: 'Trade HP for power. Self-damage cards like Offering and Bloodletting trigger Rupture for permanent Strength gains. Burning Blood helps offset the HP cost. High risk, high reward — the most aggressive Ironclad archetype.',
				fullDeck: ['RUPTURE','RUPTURE','OFFERING','HEMOKINESIS','BLOODLETTING','RAGE','TWIN_STRIKE','INFLAME','POMMEL_STRIKE','BATTLE_TRANCE','WHIRLWIND','SHRUG_IT_OFF','FLAME_BARRIER','HEADBUTT','FEED','BASH','DEFEND_IRONCLAD','DEFEND_IRONCLAD','DEFEND_IRONCLAD','STRIKE_IRONCLAD'],
				keyCards: [
					{ id: 'RUPTURE', note: 'Gains Strength whenever you lose HP from a card — the payoff engine', priority: 'core' },
					{ id: 'OFFERING', note: 'Lose HP to draw 3 and gain Energy — one of the best cards in the game', priority: 'core' },
					{ id: 'HEMOKINESIS', note: 'Lose HP to deal high damage — triggers Rupture', priority: 'early' },
					{ id: 'BLOODLETTING', note: 'Lose HP to gain Energy — triggers Rupture and accelerates turns', priority: 'early' },
					{ id: 'RAGE', note: 'Gain Block whenever you play an Attack — sustain while going aggressive', priority: 'early' }
				],
				keyRelics: [
					{ id: 'BURNING_BLOOD', note: 'Post-combat heal offsets the self-damage — essential for consistency' },
					{ id: 'RED_SKULL', note: 'Bonus Strength when at low HP — synergizes naturally with self-damage' }
				],
				tips: [
					'Rupture is only worth taking if you have 2+ cards that make you lose HP',
					'Offering is always good, even outside this build — never skip it',
					'Burning Blood\'s heal is more valuable here than in any other build',
					'Watch your HP — don\'t play self-damage cards when you can\'t afford the cost'
				]
			}
		],
		bossMatchups: [
			{ boss: 'Ceremonial Beast', difficulty: 'medium', tip: 'Strength scaling races the Beast before it buffs. Burst during stun windows. Flame Barrier punishes multi-attacks. Watch for Ringing turns limiting you to 1 card.' },
			{ boss: 'Vantom', difficulty: 'easy', tip: 'Multi-hit attacks like Whirlwind strip Slippery stacks fast. Save Block for Turn 3 Dismember (27 dmg). Burst on Turn 4 safe window.' },
			{ boss: 'Lagavulin Matriarch', difficulty: 'medium', tip: 'Use her 3 sleep turns to set up Demon Form or Barricade. Front-load damage once she wakes. She debuffs Strength — Block builds are safer.' },
			{ boss: 'Soul Fysh', difficulty: 'easy', tip: 'Play Beckon cards immediately to avoid unblockable damage. Don\'t waste attacks during Intangible phases. Concentrate damage on turns 2-3.' },
			{ boss: 'Waterfall Giant', difficulty: 'easy', tip: 'Big HP pool but predictable. Stack Strength and burst with Whirlwind. Save Block for the explosion turn when he dies at 0 HP.' },
			{ boss: 'Crusher', difficulty: 'medium', tip: 'Always face the attacking claw. Kill Rocket first (higher damage), then burst Crusher. Flame Barrier and Shrug It Off are premium.' },
			{ boss: 'Knowledge Demon', difficulty: 'hard', tip: 'Play aggressively — Ponder heals 30 HP + Strength. Pick Disintegration if your build is fast. Save Offering for burst turns.' },
			{ boss: 'The Insatiable', difficulty: 'medium', tip: 'Pure DPS race — Sandpit counter kills you at 0. Always play Frantic Escape cards. Never use random Exhaust (may remove Escapes).' },
			{ boss: 'Queen', difficulty: 'hard', tip: 'Kill the Amalgam first (before turn 10). Whirlwind clears adds while Strength handles Queen. Plan around Chains locking 3 cards.' },
			{ boss: 'Doormaker', difficulty: 'medium', tip: 'Multiple phases — Doormaker HP persists between cycles. Barricade/Body Slam is safest. Burst during the stun turn after Door transforms.' }
		],
		ascensionTips: [
			{ tip: 'A1-4: Ironclad is forgiving. Take strong Attacks early, rely on Burning Blood healing. Fight Elites for relics.', cards: [], relics: ['BURNING_BLOOD'] },
			{ tip: 'A5: You start with Ascender\'s Bane curse. Remove it at the first shop — a dead card in your deck costs you turns.', cards: ['OFFERING'], relics: ['BURNING_BLOOD'] },
			{ tip: 'A6-7: Fewer Rest Sites and rarer upgrades. Strength + Block hybrid is the most consistent. Don\'t rely on finding specific Rares.', cards: ['INFLAME', 'SHRUG_IT_OFF'], relics: ['GIRYA', 'ANCHOR'] },
			{ tip: 'A8-9: Enemies have more HP and deal more damage. Draft defensively — Flame Barrier and Shrug It Off are premium picks.', cards: ['FLAME_BARRIER', 'SHRUG_IT_OFF'], relics: ['ANCHOR', 'CAPTAINS_WHEEL'] },
			{ tip: 'A10: Double boss at Act 3 end. Barricade/Body Slam is the safest boss-killer. Deck must handle two full fights back-to-back.', cards: ['BARRICADE', 'BODY_SLAM'], relics: ['CAPTAINS_WHEEL'] }
		],
		draftPriority: [
			{ phase: 'Act 1', cards: 'Inflame, Pommel Strike, Offering, Flame Barrier, Shrug It Off', note: 'Raw damage and basic defense. Need to kill Elites fast.' },
			{ phase: 'Act 2', cards: 'Demon Form, Corruption, Feel No Pain, Battle Trance, Impervious', note: 'Start building your archetype. Key Powers define the rest of the run.' },
			{ phase: 'Act 3+', cards: 'Barricade, Body Slam, Fiend Fire, Offering (if missing)', note: 'Win conditions and boss-killers. Skip anything that doesn\'t directly support your build.' }
		]
	},
	silent: {
		slug: 'silent',
		name: 'The Silent',
		title: 'Silent Guide — Decks, Playstyle & Strategy',
		overview: 'The Silent uses Poison, Shivs, and discard synergies to control fights. She has excellent card draw and deck cycling, but low base HP (70) makes her fragile. Rewards careful deck construction over raw power.',
		startingRelic: 'Ring of the Snake — draw 2 additional cards on the first turn of each combat.',
		weaknessImage: '/static/images/monsters/knowledge_demon.png',
		strengths: [
			'Excellent card draw and deck cycling',
			'Poison scales infinitely against high-HP enemies',
			'Shivs provide burst damage with low commitment',
			'Strong discard synergies for hand manipulation'
		],
		weaknesses: [
			'Low base HP (70) makes her fragile',
			'Poison is slow against multiple enemies',
			'Requires careful deck construction to avoid bloat',
			'Shiv builds need Strength scaling to stay relevant'
		],
		builds: [
			{
				name: 'Poison Build',
				description: 'Apply Poison and let it tick enemies down each turn. Noxious Fumes provides passive scaling while Envenom turns every Attack into a Poison applicator. Focus on survival — Poison does the killing for you.',
				fullDeck: ['NOXIOUS_FUMES','ENVENOM','DEADLY_POISON','DEADLY_POISON','BOUNCING_FLASK','SNAKEBITE','BLADE_DANCE','FOOTWORK','BACKFLIP','WELL_LAID_PLANS','ADRENALINE','LEG_SWEEP','ESCAPE_PLAN','PIERCING_WAIL','DEFLECT','NEUTRALIZE','SURVIVOR','DEFEND_SILENT','DEFEND_SILENT','DEFEND_SILENT'],
				keyCards: [
					{ id: 'NOXIOUS_FUMES', note: 'Applies Poison to all enemies every turn — set it up early and let it stack', priority: 'core' },
					{ id: 'ENVENOM', note: 'Every Attack hit applies Poison — turns Shivs and multi-hits into Poison engines', priority: 'core' },
					{ id: 'DEADLY_POISON', note: 'Cheap, reliable Poison application — solid early pick', priority: 'early' },
					{ id: 'BOUNCING_FLASK', note: 'Spreads Poison across multiple enemies — good for AoE fights', priority: 'early' },
					{ id: 'SNAKEBITE', note: 'Retains in hand and applies Poison — consistent value each turn', priority: 'early' }
				],
				keyRelics: [
					{ id: 'SNECKO_SKULL', note: 'Extra Poison on application — accelerates your Poison stacking' },
					{ id: 'TWISTED_FUNNEL', note: 'Applies Poison to all enemies at combat start — free head start' }
				],
				tips: [
					'Noxious Fumes is your highest priority card — it scales passively without costing cards or Energy',
					'Envenom + Blade Dance is a strong combo: 3 Shivs = 3 Poison applications',
					'In multi-enemy fights, focus on surviving — Poison ticks on all enemies simultaneously',
					'Don\'t over-draft Poison cards. 2-3 strong sources plus defense is better than 6 Poison cards and no Block'
				]
			},
			{
				name: 'Shiv Build',
				description: 'Generate 0-cost Shivs and boost them with Accuracy and Strength scaling. Each Shiv played triggers on-attack effects from relics, making quantity more valuable than individual damage.',
				fullDeck: ['ACCURACY','ACCURACY','BLADE_DANCE','BLADE_DANCE','CLOAK_AND_DAGGER','CLOAK_AND_DAGGER','INFINITE_BLADES','STORM_OF_STEEL','ADRENALINE','FOOTWORK','BACKFLIP','AFTERIMAGE','BURST','PIERCING_WAIL','NEUTRALIZE','SURVIVOR','DEFEND_SILENT','DEFEND_SILENT','DEFEND_SILENT','DEFLECT'],
				keyCards: [
					{ id: 'ACCURACY', note: 'Gives +4 damage to all Shivs — the build-defining card', priority: 'core' },
					{ id: 'BLADE_DANCE', note: 'Creates 3 Shivs for 1 Energy — your bread and butter', priority: 'core' },
					{ id: 'CLOAK_AND_DAGGER', note: 'Shivs + Block in one card — offense and defense', priority: 'early' },
					{ id: 'INFINITE_BLADES', note: 'Generates a free Shiv every turn — passive value', priority: 'early' },
					{ id: 'STORM_OF_STEEL', note: 'Replaces your hand with Shivs — huge burst with Accuracy up', priority: 'payoff' }
				],
				keyRelics: [
					{ id: 'SHURIKEN', note: 'Gain Strength every 3 Attacks played — Shivs trigger this fast' },
					{ id: 'KUNAI', note: 'Gain Dexterity every 3 Attacks played — free Block scaling' },
					{ id: 'ORNAMENTAL_FAN', note: 'Gain Block every 3 Attacks played — passive defense from playing Shivs' }
				],
				tips: [
					'Accuracy is the #1 priority — without it, Shivs deal too little damage to scale',
					'Shuriken and Kunai are what make this build viable in late game — seek them out',
					'Shivs are Attacks, so any "when you play an Attack" effect triggers on each one',
					'This build needs Strength or Accuracy to stay relevant past Act 2 — don\'t commit without a scaling source'
				]
			},
			{
				name: 'Discard Build',
				description: 'Discard cards to trigger powerful on-discard effects like Reflex and Tactician, generating free cards and Energy. Tools of the Trade filters your hand every turn. The most cycle-heavy Silent archetype.',
				fullDeck: ['TOOLS_OF_THE_TRADE','REFLEX','REFLEX','TACTICIAN','TACTICIAN','CALCULATED_GAMBLE','SURVIVOR','PREPARED','ADRENALINE','BLADE_DANCE','BACKFLIP','FOOTWORK','ACROBATICS','WELL_LAID_PLANS','DAGGER_SPRAY','NEUTRALIZE','DEFLECT','DEFEND_SILENT','DEFEND_SILENT','DEFEND_SILENT'],
				keyCards: [
					{ id: 'TOOLS_OF_THE_TRADE', note: 'Draw and discard each turn — consistent hand filtering forever', priority: 'core' },
					{ id: 'REFLEX', note: 'Draw 2 cards when discarded — free card advantage', priority: 'core' },
					{ id: 'TACTICIAN', note: 'Gain Energy when discarded — free resources every cycle', priority: 'core' },
					{ id: 'CALCULATED_GAMBLE', note: 'Discard entire hand and redraw — triggers all on-discard effects at once', priority: 'payoff' },
					{ id: 'SURVIVOR', note: 'Block + discard a card — triggers Reflex/Tactician while defending', priority: 'early' }
				],
				keyRelics: [
					{ id: 'TOUGH_BANDAGES', note: 'Gain Block whenever you discard — free defense from your engine' },
					{ id: 'TINGSHA', note: 'Deal damage for each card discarded — turns cycling into damage' }
				],
				tips: [
					'Reflex and Tactician are the engine — draft them before committing to this archetype',
					'Tools of the Trade is the best sustained value card for this build — take it whenever offered',
					'Calculated Gamble + multiple Reflex/Tactician = explosive turns with huge card and Energy generation',
					'This build needs a separate damage source — discard effects alone won\'t kill bosses'
				]
			}
		],
		bossMatchups: [
			{ boss: 'Ceremonial Beast', difficulty: 'medium', tip: 'Poison scales well against 252 HP. Use sleep-like stun windows for setup. Ringing (1 card/turn) is brutal — Wraith Form or Noxious Fumes carry through.' },
			{ boss: 'Vantom', difficulty: 'medium', tip: 'Shivs strip Slippery stacks fast. Save all Block for Turn 3 Dismember (27 dmg + Wounds). Silent\'s low HP makes Dismember lethal without Block.' },
			{ boss: 'Lagavulin Matriarch', difficulty: 'hard', tip: 'Sustained damage is dangerous with 70 HP. Use sleep turns to set up Noxious Fumes and Wraith Form. Poison ignores her Strength debuffs.' },
			{ boss: 'Soul Fysh', difficulty: 'easy', tip: 'Play Beckon cards immediately. Don\'t attack during Intangible phases. Poison ticks ignore Intangible — Noxious Fumes is perfect here.' },
			{ boss: 'Waterfall Giant', difficulty: 'medium', tip: 'Poison stacks tick reliably against 250 HP. Save Block for the explosion turn. Apply Weak before killing to reduce explosion damage.' },
			{ boss: 'Crusher', difficulty: 'hard', tip: 'Big hits devastate Silent\'s low HP. Footwork and Leg Sweep are must-haves. Face the attacking claw. Kill Rocket first.' },
			{ boss: 'Knowledge Demon', difficulty: 'medium', tip: 'Play aggressively — don\'t let Ponder heal 30 HP. Poison ignores enemy buffs. Malaise shuts down big attack turns. Pick Disintegration over Mind Rot.' },
			{ boss: 'The Insatiable', difficulty: 'easy', tip: 'Poison is perfect for this DPS race. Always play Frantic Escape cards. Catalyst doubles Poison for a quick kill before Sandpit reaches 0.' },
			{ boss: 'Queen', difficulty: 'easy', tip: 'Envenom + Blade Dance poisons everything. Noxious Fumes ticks on Queen + Amalgam. Kill Amalgam first — Silent excels in multi-target fights.' },
			{ boss: 'Doormaker', difficulty: 'medium', tip: 'Poison persists between Doormaker phases — ideal for Silent. Catalyst doubles Poison for lethal burst. After Image provides sustain across cycles.' }
		],
		ascensionTips: [
			{ tip: 'A1-4: Poison is reliable and forgiving. Take Deadly Poison and Noxious Fumes. Card draw is king — Backflip and Acrobatics.', cards: ['DEADLY_POISON', 'NOXIOUS_FUMES'], relics: ['ROYAL_POISON'] },
			{ tip: 'A5: Ascender\'s Bane hurts your thin deck. Remove it ASAP or draft more card draw to compensate for the dead card.', cards: ['ADRENALINE', 'ACROBATICS'], relics: ['ROYAL_POISON'] },
			{ tip: 'A6-7: Low HP with fewer Rest Sites is punishing. Footwork is now a must-draft card. Defensive picks > damage picks.', cards: ['FOOTWORK', 'LEG_SWEEP'], relics: ['BELT_BUCKLE', 'HELICAL_DART'] },
			{ tip: 'A8-9: Enemies have more HP and damage. Wraith Form becomes essential for boss fights. Poison is more consistent than Shivs here.', cards: ['WRAITH_FORM', 'NOXIOUS_FUMES'], relics: ['KUNAI', 'TWISTED_FUNNEL'] },
			{ tip: 'A10: Double boss demands a deck that can handle two full fights. Catalyst + Burst is the fastest boss kill. Keep decks to 15-17 cards.', cards: ['BURST', 'CATALYST'], relics: ['ROYAL_POISON', 'TWISTED_FUNNEL'] }
		],
		draftPriority: [
			{ phase: 'Act 1', cards: 'Backstab, Deadly Poison, Blade Dance, Footwork, Backflip', note: 'Cheap damage and early defense. Silent is fragile — don\'t take unnecessary damage.' },
			{ phase: 'Act 2', cards: 'Noxious Fumes, Envenom, Accuracy, Adrenaline, Wraith Form', note: 'Commit to Poison or Shivs. Take the scaling card that matches your current draft.' },
			{ phase: 'Act 3+', cards: 'Catalyst, After Image, Malaise, Tools of the Trade', note: 'Boss-killing finishers and sustain. Catalyst doubles Poison for lethal burst.' }
		]
	},
	defect: {
		slug: 'defect',
		name: 'The Defect',
		title: 'Defect Guide — Decks, Playstyle & Strategy',
		overview: 'The Defect channels Orbs — Lightning, Frost, Dark, and Plasma — that trigger passively each turn and on evoke. Focus increases all Orb output. Complex to learn but scales hard once you understand Orb management.',
		startingRelic: 'Cracked Core — channel 1 Lightning Orb at the start of each combat.',
		weaknessImage: '/static/images/monsters/rocket.png',
		strengths: [
			'Orbs provide passive damage and block every turn',
			'Focus scaling multiplies all Orb output',
			'Frost Orbs generate block passively each turn',
			'Multiple viable archetypes (Frost, Lightning, Dark)'
		],
		weaknesses: [
			'Complex mechanics have a steep learning curve',
			'Requires setup turns to get Orbs online',
			'Limited Orb slots can bottleneck scaling',
			'Mixing too many Orb types dilutes the strategy'
		],
		builds: [
			{
				name: 'Frost Focus Build',
				description: 'Channel Frost Orbs and stack Focus to generate massive passive Block every turn. Once online, most enemies simply can\'t break through your defense. The most consistent Defect archetype.',
				fullDeck: ['GLACIER','GLACIER','DEFRAGMENT','DEFRAGMENT','BIASED_COGNITION','COOLHEADED','COOLHEADED','HAILSTORM','COLD_SNAP','BUFFER','SKIM','CHARGE_BATTERY','CAPACITOR','LOOP','GENETIC_ALGORITHM','HOLOGRAM','ZAP','DEFEND_DEFECT','DEFEND_DEFECT','DEFEND_DEFECT'],
				keyCards: [
					{ id: 'GLACIER', note: 'Channels 2 Frost Orbs and gives Block — the build\'s best card', priority: 'core' },
					{ id: 'DEFRAGMENT', note: 'Permanent Focus — multiplies all Orb output for the rest of combat', priority: 'core' },
					{ id: 'BIASED_COGNITION', note: 'Huge Focus burst but loses 1 per turn — win fast or find Artifact', priority: 'payoff' },
					{ id: 'COOLHEADED', note: 'Channels Frost and draws a card — efficient early pick', priority: 'early' },
					{ id: 'HAILSTORM', note: 'Deals damage based on Frost Orbs channeled — your finisher', priority: 'payoff' }
				],
				keyRelics: [
					{ id: 'RUNIC_CAPACITOR', note: 'Extra Orb slots — more Orbs = more passive Block per turn' },
					{ id: 'DATA_DISK', note: 'Free Focus — directly multiplies your Frost Block generation' },
					{ id: 'CRACKED_CORE', note: 'Starting relic channels Lightning turn 1 — helps early before Frost is online' }
				],
				tips: [
					'Focus is multiplicative — 3 Focus with 4 Frost Orbs = 12 extra Block per turn passively',
					'Biased Cognition is best played when you can win within 3-4 turns or have Artifact to negate the Focus loss',
					'More Orb slots is critical — each additional Frost Orb is another source of passive Block',
					'This build is weak in Act 1 before you find Focus and Frost cards — draft some early damage'
				]
			},
			{
				name: 'Lightning Build',
				description: 'Channel Lightning Orbs for passive and evoke damage each turn. Storm channels Lightning whenever you play a Power, and Thunder adds passive damage. More aggressive than Frost but less defensive — requires balancing offense with survival.',
				fullDeck: ['STORM','THUNDER','BALL_LIGHTNING','BALL_LIGHTNING','TEMPEST','TESLA_COIL','DEFRAGMENT','FLAK_CANNON','CREATIVE_AI','GLACIER','COOLHEADED','CHARGE_BATTERY','BUFFER','CAPACITOR','SKIM','ZAP','DUALCAST','DEFEND_DEFECT','DEFEND_DEFECT','DEFEND_DEFECT'],
				keyCards: [
					{ id: 'STORM', note: 'Channels Lightning every time you play a Power — snowballs with more Powers', priority: 'core' },
					{ id: 'THUNDER', note: 'Adds passive Lightning damage each turn — scales with Focus', priority: 'core' },
					{ id: 'BALL_LIGHTNING', note: 'Cheap Attack that channels Lightning — good early pickup', priority: 'early' },
					{ id: 'TEMPEST', note: 'Channels Lightning equal to Energy spent — big turn with extra Energy', priority: 'payoff' },
					{ id: 'TESLA_COIL', note: 'Deals Lightning damage at start of each turn — consistent chip damage', priority: 'early' }
				],
				keyRelics: [
					{ id: 'GOLD_PLATED_CABLES', note: 'Boosts rightmost Orb passive — stronger Lightning ticks' },
					{ id: 'SYMBIOTIC_VIRUS', note: 'Free Focus at combat start — multiplies all Lightning damage' }
				],
				tips: [
					'Storm + any Power-heavy deck generates Lightning Orbs for free every turn',
					'Lightning damage is random — it hits a random enemy, which is great for AoE fights',
					'Don\'t neglect Block — Lightning builds deal good damage but can be fragile without Frost support',
					'Tempest is strongest with extra Energy sources — look for Energy relics and cards'
				]
			},
			{
				name: 'Dark Orb Build',
				description: 'Dark Orbs store damage each turn, growing stronger the longer they sit in your Orb slots. Evoke them at the right moment for devastating single-target burst. The highest damage ceiling of any Defect build.',
				fullDeck: ['CONSUMING_SHADOW','DARKNESS','DARKNESS','MULTI_CAST','LOOP','DEFRAGMENT','DEFRAGMENT','GLACIER','COOLHEADED','BUFFER','CAPACITOR','CHARGE_BATTERY','SKIM','HOLOGRAM','GENETIC_ALGORITHM','ZAP','DUALCAST','DEFEND_DEFECT','DEFEND_DEFECT','DEFEND_DEFECT'],
				keyCards: [
					{ id: 'CONSUMING_SHADOW', note: 'Channels Dark Orbs — your primary Dark Orb source', priority: 'core' },
					{ id: 'DARKNESS', note: 'Channels a Dark Orb and boosts existing Dark Orbs', priority: 'core' },
					{ id: 'MULTI_CAST', note: 'Evokes rightmost Orb multiple times — massive burst with a charged Dark Orb', priority: 'payoff' },
					{ id: 'LOOP', note: 'Triggers first Orb\'s passive twice per turn — doubles Dark Orb damage gain', priority: 'payoff' }
				],
				keyRelics: [
					{ id: 'SYMBIOTIC_VIRUS', note: 'Free Focus — directly increases Dark Orb damage gain per turn' },
					{ id: 'EMOTION_CHIP', note: 'Triggers Orb passives when you take damage — extra Dark Orb charging' }
				],
				tips: [
					'Dark Orbs deal damage equal to their stored value when evoked — patience is rewarded',
					'Multi Cast + a fully charged Dark Orb = hundreds of damage in one turn',
					'Focus boosts how much damage Dark Orbs gain passively each turn — prioritize it',
					'Mix in some Frost Orbs for defense while your Dark Orbs charge up'
				]
			}
		],
		bossMatchups: [
			{ boss: 'Ceremonial Beast', difficulty: 'easy', tip: 'Frost Orbs wall the Beast\'s Plow attacks. Burst during stun windows with Lightning. Ringing (1 card/turn) is manageable with Orb passives doing work for free.' },
			{ boss: 'Vantom', difficulty: 'medium', tip: 'Lightning Orbs help strip Slippery stacks passively. Stack Frost for Turn 3 Dismember block. Claw builds cycle fast enough to strip Slippery quickly.' },
			{ boss: 'Lagavulin Matriarch', difficulty: 'easy', tip: 'Use 3 sleep turns to set up Focus and Powers. Frost Orbs trivialize her sustained damage. Lightning races her down before debuffs matter.' },
			{ boss: 'Soul Fysh', difficulty: 'easy', tip: 'Orbs deal passive damage even during Intangible phases (each Orb triggers separately). Frost Focus walls the Scream + Vulnerable turns.' },
			{ boss: 'Waterfall Giant', difficulty: 'easy', tip: 'Lightning Orbs chip away at 250 HP passively. Frost Focus makes you nearly invincible. Save Block for the explosion turn at 0 HP.' },
			{ boss: 'Crusher', difficulty: 'medium', tip: 'Big hits bypass Frost partially. Stack high Focus. Kill Rocket first — Lightning Orbs randomly hit both targets. Buffer absorbs Laser attacks.' },
			{ boss: 'Knowledge Demon', difficulty: 'hard', tip: 'Debuffs reduce Focus effectiveness. Biased Cognition timing is critical — win fast. Play aggressively to stop Ponder healing 30 HP.' },
			{ boss: 'The Insatiable', difficulty: 'medium', tip: 'Lightning + Focus provides the DPS needed for this race. Always play Frantic Escape cards. Frost buys time as Sandpit ticks down.' },
			{ boss: 'Queen', difficulty: 'medium', tip: 'Lightning randomly hits Queen + Amalgam — good for chip damage. Kill Amalgam first. Frost Focus walls survive multi-target pressure. Echo Form is premium.' },
			{ boss: 'Doormaker', difficulty: 'medium', tip: 'Orbs scale across phases. Dark Orbs charge up massive damage between Door/Doormaker transitions. Creative AI generates infinite value in long fights.' }
		],
		ascensionTips: [
			{ tip: 'A1-4: Frost Focus is easy to pilot. Take Glacier and Defragment over everything else. Orbs scale passively.', cards: ['GLACIER', 'DEFRAGMENT'], relics: ['PERMAFROST', 'DATA_DISK'] },
			{ tip: 'A5: Ascender\'s Bane dilutes your deck. Defect needs consistency to draw Focus cards — remove the Bane early.', cards: ['DEFRAGMENT'], relics: ['DATA_DISK'] },
			{ tip: 'A6-7: Pure Lightning starts to struggle with fewer Rest Sites. Hybrid Frost+Lightning with Focus is safest.', cards: ['BALL_LIGHTNING', 'COOLHEADED'], relics: ['DATA_DISK', 'INFUSED_CORE'] },
			{ tip: 'A8-9: Enemies have more HP — Biased Cognition is riskier without Artifact. Echo Form doubles key plays to compensate.', cards: ['ECHO_FORM', 'BIASED_COGNITION'], relics: ['EMOTION_CHIP'] },
			{ tip: 'A10: Double boss needs sustainable scaling. Frost Focus + Capacitor for extra Orb slots handles two full fights consistently.', cards: ['CAPACITOR', 'GLACIER'], relics: ['RUNIC_CAPACITOR', 'DATA_DISK'] }
		],
		draftPriority: [
			{ phase: 'Act 1', cards: 'Ball Lightning, Coolheaded, Charge Battery, Cold Snap, Skim', note: 'Early Orb generators and card draw. You need to survive while Orbs ramp up.' },
			{ phase: 'Act 2', cards: 'Glacier, Defragment, Biased Cognition, Buffer, Storm', note: 'Core scaling cards. Defragment is the single most important card for any Orb build.' },
			{ phase: 'Act 3+', cards: 'Echo Form, Creative AI, Capacitor, Multi Cast', note: 'Power multipliers and Orb slot expansion. Echo Form doubles your best card each turn.' }
		]
	},
	necrobinder: {
		slug: 'necrobinder',
		name: 'The Necrobinder',
		title: 'Necrobinder Guide — Decks, Playstyle & Strategy',
		overview: 'The Necrobinder summons allies and binds souls for persistent effects. Summons attack and block on your behalf each turn. Managing your board state is key — AoE enemies and summon limits create real decision points.',
		startingRelic: 'Phylactery Unbound — summon 5 at the start of combat and 2 at the start of each turn.',
		weaknessImage: '/static/images/monsters/amalgam.png',
		strengths: [
			'Summons provide extra damage and block',
			'Soul Binding creates powerful persistent effects',
			'Good at managing multiple threats simultaneously',
			'Unique sacrifice mechanics offer strategic depth'
		],
		weaknesses: [
			'Summons can be killed by enemies',
			'Requires careful summon management',
			'Some builds are board-state dependent',
			'Can struggle without key summoning cards'
		],
		builds: [
			{
				name: 'Summon Swarm',
				description: 'Fill your board with summons that deal damage and block for you each turn. Every summon is a body that absorbs hits, deals chip damage, or provides Block. Prioritize cards that summon efficiently and protect your board.',
				fullDeck: ['UNLEASH','UNLEASH','SCULPTING_STRIKE','SCULPTING_STRIKE','LEGION_OF_BONE','SPIRIT_OF_ASH','BODYGUARD','BLIGHT_STRIKE','REANIMATE','SHARED_FATE','PROTECTOR','PULL_AGGRO','SHROUD','DEMESNE','DANSE_MACABRE','DEFY','DEFEND_NECROBINDER','DEFEND_NECROBINDER','DEFEND_NECROBINDER','STRIKE_NECROBINDER'],
				keyCards: [
					{ id: 'UNLEASH', note: 'Core summoning card — fills your board quickly', priority: 'core' },
					{ id: 'SCULPTING_STRIKE', note: 'Deals damage AND summons — two effects in one card', priority: 'core' },
					{ id: 'LEGION_OF_BONE', note: 'Summons for all players — massive board presence', priority: 'payoff' },
					{ id: 'SPIRIT_OF_ASH', note: 'Powerful summon with scaling potential', priority: 'payoff' },
					{ id: 'BODYGUARD', note: 'Basic summon — reliable early game board presence', priority: 'early' },
					{ id: 'BLIGHT_STRIKE', note: 'Attack that applies Doom and summons — flexible early pick', priority: 'early' }
				],
				keyRelics: [
					{ id: 'PHYLACTERY_UNBOUND', note: 'Starting relic — free summons every combat and every turn' },
					{ id: 'LANTERN', note: 'Extra Energy turn 1 — lets you summon and play cards immediately' }
				],
				tips: [
					'Summons provide value every single turn they survive — protecting them is more important than playing new ones',
					'AoE enemy attacks can wipe your board — scout enemy intents and save Block for those turns',
					'Cards that summon AND do something else (like Sculpting Strike) are the highest priority picks',
					'Don\'t over-commit to summoning without a way to defend your board or yourself'
				]
			},
			{
				name: 'Soul Binding',
				description: 'Bind souls for ongoing passive effects that stack up over time. Each bound soul adds persistent value that compounds across the fight. A control-oriented approach that excels in longer encounters.',
				fullDeck: ['CAPTURE_SPIRIT','CAPTURE_SPIRIT','HAUNT','SOUL_STORM','UNLEASH','BLIGHT_STRIKE','SCULPTING_STRIKE','SEANCE','NECRO_MASTERY','SHROUD','DEMESNE','SHARED_FATE','PROTECTOR','REANIMATE','DANSE_MACABRE','DEFY','DEFEND_NECROBINDER','DEFEND_NECROBINDER','DEFEND_NECROBINDER','STRIKE_NECROBINDER'],
				keyCards: [
					{ id: 'CAPTURE_SPIRIT', note: 'Binds a soul for a persistent passive effect — core mechanic', priority: 'core' },
					{ id: 'HAUNT', note: 'Power that applies soul-binding effects passively', priority: 'core' },
					{ id: 'SOUL_STORM', note: 'Deals damage based on bound souls — your scaling finisher', priority: 'payoff' },
					{ id: 'UNLEASH', note: 'Versatile card that helps set up your board state', priority: 'early' },
					{ id: 'BLIGHT_STRIKE', note: 'Early damage that also contributes to soul effects', priority: 'early' },
					{ id: 'SCULPTING_STRIKE', note: 'Damage + summon — supports your board while building souls', priority: 'early' }
				],
				keyRelics: [
					{ id: 'PHYLACTERY_UNBOUND', note: 'Free summons each turn — provides board presence while you invest in souls' },
					{ id: 'FORGOTTEN_SOUL', note: 'Soul-related relic that accelerates your passive scaling' }
				],
				tips: [
					'Bound souls stack — each additional soul adds another layer of passive value that compounds',
					'This build rewards patience — don\'t rush damage, let your passives accumulate',
					'Soul Storm scales with your bound soul count — it\'s your primary win condition in long fights',
					'Balance soul investment with board defense — dying with 10 bound souls still loses the fight'
				]
			},
			{
				name: 'Doom Build',
				description: 'Apply Doom stacks to enemies, then detonate with Time\'s Up for massive burst damage. Countdown and Reaper Form accelerate the ticking clock. A unique damage-over-time approach that excels against high-HP bosses.',
				fullDeck: ['COUNTDOWN','COUNTDOWN','REAPER_FORM','TIMES_UP','END_OF_DAYS','NEUROSURGE','SHROUD','BLIGHT_STRIKE','SCULPTING_STRIKE','UNLEASH','DEMESNE','SHARED_FATE','PROTECTOR','DEBILITATE','DANSE_MACABRE','DEFY','DEFEND_NECROBINDER','DEFEND_NECROBINDER','DEFEND_NECROBINDER','STRIKE_NECROBINDER'],
				keyCards: [
					{ id: 'COUNTDOWN', note: 'Applies Doom that ticks each turn — your primary Doom source', priority: 'core' },
					{ id: 'REAPER_FORM', note: 'Passively accelerates Doom application every turn — the engine', priority: 'core' },
					{ id: 'TIMES_UP', note: 'Deals damage equal to enemy\'s Doom — your burst finisher', priority: 'payoff' },
					{ id: 'END_OF_DAYS', note: 'Applies Doom to ALL enemies — devastating in multi-enemy fights', priority: 'payoff' },
					{ id: 'NEUROSURGE', note: 'Power that enhances Doom application and scaling', priority: 'early' },
					{ id: 'SHROUD', note: 'Provides defense while your Doom stacks tick down', priority: 'early' }
				],
				keyRelics: [
					{ id: 'PHYLACTERY_UNBOUND', note: 'Free summons provide board presence while you wait for Doom to resolve' },
					{ id: 'LANTERN', note: 'Extra Energy turn 1 — set up Countdown or Reaper Form faster' }
				],
				tips: [
					'Doom ticks down each turn — stack it high and survive until it resolves for lethal damage',
					'Time\'s Up is your burst finisher — save it for when Doom stacks are high for maximum impact',
					'Reaper Form is best played early — the sooner it\'s active, the more Doom it generates',
					'End of Days + Time\'s Up in multi-enemy fights can clear entire encounters in one combo'
				]
			}
		],
		bossMatchups: [
			{ boss: 'Ceremonial Beast', difficulty: 'medium', tip: 'Ringing (1 card/turn) is tough but summons still attack. Burst during stun windows. Re-summon aggressively — the Beast\'s Strength scaling kills boards over time.' },
			{ boss: 'Vantom', difficulty: 'medium', tip: 'Summons help strip Slippery stacks. Save Block and Shared Fate for Turn 3 Dismember (27 dmg). Your board absorbs hits between danger turns.' },
			{ boss: 'Lagavulin Matriarch', difficulty: 'medium', tip: 'Use sleep turns to set up summons and Soul Binding. She debuffs Strength — Soul/Doom builds ignore that. Shared Fate protects key summons.' },
			{ boss: 'Soul Fysh', difficulty: 'easy', tip: 'Summons attack during Intangible phases (each hit counts separately). Play Beckon cards immediately. Board presence makes this fight easy.' },
			{ boss: 'Waterfall Giant', difficulty: 'easy', tip: 'Summons chip away at 250 HP reliably. Doom ticks effectively against the big HP pool. Board presence wins this war of attrition.' },
			{ boss: 'Crusher', difficulty: 'hard', tip: 'Big single hits kill key summons. Protect with Shared Fate or accept losses. Kill Rocket first — its Laser deals 31 damage.' },
			{ boss: 'Knowledge Demon', difficulty: 'hard', tip: 'Play aggressively — Ponder heals 30 HP. Doom build sustains through debuffs. Pick Disintegration over Mind Rot (keep card draw for summons).' },
			{ boss: 'The Insatiable', difficulty: 'medium', tip: 'DPS race — summons provide extra damage each turn. Always play Frantic Escape cards. Never use random Exhaust effects. Doom ticks help the race.' },
			{ boss: 'Queen', difficulty: 'easy', tip: 'Your summons vs their Amalgam. Necrobinder wins the war of attrition. Kill Amalgam first. End of Days with Doom wipes everything.' },
			{ boss: 'Doormaker', difficulty: 'medium', tip: 'Re-summon between Door/Doormaker phases. Soul Storm is reliable across transitions. Burst the Doormaker during its stun turn each cycle.' }
		],
		ascensionTips: [
			{ tip: 'A1-4: Summon Swarm is strong and forgiving. Take any summoning card and let your board do the work.', cards: ['UNLEASH'], relics: ['FUNERARY_MASK'] },
			{ tip: 'A5: Ascender\'s Bane is an extra card that can\'t be played — it dilutes your hand. Remove it fast or draft more card draw.', cards: ['DREDGE'], relics: ['FUNERARY_MASK'] },
			{ tip: 'A6-7: Fewer Rest Sites and rarer cards. Enemies hit harder — summons die faster. Add Shared Fate and Protector for board protection.', cards: ['SHARED_FATE', 'BODYGUARD'], relics: ['ANCHOR', 'CAPTAINS_WHEEL'] },
			{ tip: 'A8-9: Enemies have more HP and damage. Soul Binding becomes more reliable than pure summoning — passive scaling survives AoE better.', cards: ['CAPTURE_SPIRIT', 'HAUNT'], relics: ['FUNERARY_MASK'] },
			{ tip: 'A10: Double boss at Act 3 end. Doom build with Reaper Form has the highest ceiling. Need tight decks (15-18 cards) to find Time\'s Up.', cards: ['REAPER_FORM', 'TIMES_UP'], relics: ['FUNERARY_MASK'] }
		],
		draftPriority: [
			{ phase: 'Act 1', cards: 'Sculpting Strike, Blight Strike, Unleash, Shroud, Bodyguard', note: 'Board presence and early damage. Every summon counts in Act 1 fights.' },
			{ phase: 'Act 2', cards: 'Reaper Form, Spirit of Ash, Haunt, Capture Spirit, Legion of Bone', note: 'Key archetype cards. Commit to Summon, Soul, or Doom based on offerings.' },
			{ phase: 'Act 3+', cards: 'Necro Mastery, Soul Storm, Time\'s Up, Sacrifice', note: 'Win conditions. These cards end boss fights. Skip everything else.' }
		]
	},
	regent: {
		slug: 'regent',
		name: 'The Regent',
		title: 'Regent Guide — Decks, Playstyle & Strategy',
		overview: 'The Regent uses a dual-resource system: Energy and Stars. Star-cost cards are powerful but require dedicated generation. The newest character in StS2, with a flexible playstyle that rewards good resource management.',
		startingRelic: 'Ring of the Drake — draw 2 additional cards at the start of your first 3 turns.',
		weaknessImage: '/static/images/monsters/queen.png',
		strengths: [
			'Dual energy system provides flexibility',
			'Star cards have high impact per play',
			'Strong command/buff themed cards',
			'Good balance of offense and defense'
		],
		weaknesses: [
			'Star generation can be unreliable',
			'Star cards are useless without Stars',
			'Complex resource management required',
			'Fewer community resources (newest character)'
		],
		builds: [
			{
				name: 'Star Engine',
				description: 'Build around Star generation and spend them on high-impact Star-cost cards. The core Regent playstyle. The key rule: always draft Star generators before Star consumers — a hand full of Star cards with no Stars is a dead hand.',
				fullDeck: ['VENERATE','VENERATE','FALLING_STAR','FALLING_STAR','SEVEN_STARS','STARDUST','SHINING_STRIKE','SOLAR_STRIKE','GENESIS','COMET','MONARCHS_GAZE','NEUTRON_AEGIS','BULWARK','HEAVENLY_DRILL','PARRY','GATHER_LIGHT','DEFEND_REGENT','DEFEND_REGENT','DEFEND_REGENT','STRIKE_REGENT'],
				keyCards: [
					{ id: 'VENERATE', note: 'Core Star generator — reliable income every time you play it', priority: 'core' },
					{ id: 'FALLING_STAR', note: 'Basic attack that generates Stars — your bread and butter', priority: 'core' },
					{ id: 'SEVEN_STARS', note: 'Powerful Star-cost payoff card — high damage for Star investment', priority: 'payoff' },
					{ id: 'STARDUST', note: 'Scaling damage that benefits from Star spending', priority: 'payoff' },
					{ id: 'SHINING_STRIKE', note: 'Star-enhanced attack — solid mid-game pickup', priority: 'early' },
					{ id: 'SOLAR_STRIKE', note: 'Cheap attack with Star synergy — good early game', priority: 'early' }
				],
				keyRelics: [
					{ id: 'RING_OF_THE_DRAKE', note: 'Starting relic — extra card draw helps find Star generators early' },
					{ id: 'REGALITE', note: 'Block whenever you create Colorless cards — passive defense' }
				],
				tips: [
					'Star generation is your #1 priority in Act 1 — take Venerate and Falling Star over flashy Star consumers',
					'A good ratio is roughly 2 Star generators for every 1 Star consumer in your deck',
					'Don\'t draft expensive Star cards without the income to support them — bricked hands lose runs',
					'Genesis (gain Stars each turn) is the best late-game Star engine if offered — always take it'
				]
			},
			{
				name: 'Command Build',
				description: 'Play a balanced midrange game using the Regent\'s buff and command cards. Less Star-dependent than Star Engine, making it more consistent when Star generation offerings are weak. Powers provide sustained value over multiple turns.',
				fullDeck: ['ARSENAL','SWORD_SAGE','FURNACE','VENERATE','FALLING_STAR','SHINING_STRIKE','SPECTRUM_SHIFT','HEAVENLY_DRILL','MONARCHS_GAZE','NEUTRON_AEGIS','BULWARK','COMET','HAMMER_TIME','CONVERGENCE','PARRY','GATHER_LIGHT','DEFEND_REGENT','DEFEND_REGENT','DEFEND_REGENT','STRIKE_REGENT'],
				keyCards: [
					{ id: 'ARSENAL', note: 'Gain Strength whenever you play a Colorless card — snowballs with card generation', priority: 'core' },
					{ id: 'SWORD_SAGE', note: 'Powers up Sovereign Blade permanently — sustained scaling', priority: 'core' },
					{ id: 'FURNACE', note: 'Passive Forge each turn — compounding value the longer the fight lasts', priority: 'core' },
					{ id: 'VENERATE', note: 'Star generation + general utility — always useful', priority: 'early' },
					{ id: 'FALLING_STAR', note: 'Basic attack with Star gen — solid in any Regent deck', priority: 'early' },
					{ id: 'SHINING_STRIKE', note: 'Reliable mid-range attack — works with or without Stars', priority: 'early' }
				],
				keyRelics: [
					{ id: 'RING_OF_THE_DRAKE', note: 'Extra draw helps find your Powers and setup cards faster' },
					{ id: 'MINI_REGENT', note: 'Summons a Mini Regent that provides ongoing value' }
				],
				tips: [
					'Play Powers early — Arsenal, Furnace, and Sword Sage all compound value over time',
					'Arsenal + Spectrum Shift (creates Colorless cards each turn) is a strong combo for Strength scaling',
					'This build is your fallback when Star offerings are poor — it works with mostly Energy-cost cards',
					'Keep some basic Block cards — the Regent lacks innate tankiness without dedicated defense'
				]
			},
			{
				name: 'Forge Build',
				description: 'Forge your Sovereign Blade into a devastating weapon. Stack Forge points to increase its damage, then use Seeking Edge to make it hit all enemies. The Regent\'s most unique build — all-in on a single powerful card.',
				fullDeck: ['SWORD_SAGE','SEEKING_EDGE','FURNACE','SUMMON_FORTH','REFINE_BLADE','CONQUEROR','VENERATE','FALLING_STAR','NEUTRON_AEGIS','BULWARK','MONARCHS_GAZE','HEAVENLY_DRILL','COMET','PARRY','GATHER_LIGHT','WROUGHT_IN_WAR','DEFEND_REGENT','DEFEND_REGENT','DEFEND_REGENT','STRIKE_REGENT'],
				keyCards: [
					{ id: 'SWORD_SAGE', note: 'Permanently increases Sovereign Blade cost and damage — core scaling', priority: 'core' },
					{ id: 'SEEKING_EDGE', note: 'Makes Sovereign Blade hit ALL enemies and adds Forge — build-defining', priority: 'core' },
					{ id: 'FURNACE', note: 'Passive Forge each turn — set up early for compounding Blade damage', priority: 'core' },
					{ id: 'SUMMON_FORTH', note: 'Pulls Sovereign Blade from anywhere in your deck — guarantees access', priority: 'payoff' },
					{ id: 'REFINE_BLADE', note: 'Cheap Forge + Energy next turn — efficient early forging', priority: 'early' },
					{ id: 'CONQUEROR', note: 'Forge + Sovereign Blade deals double damage this turn — burst combo', priority: 'payoff' }
				],
				keyRelics: [
					{ id: 'RING_OF_THE_DRAKE', note: 'Extra draw helps find Sovereign Blade and Forge cards faster' },
					{ id: 'REGALITE', note: 'Block on Colorless card creation — passive defense while forging' }
				],
				tips: [
					'Sovereign Blade is your entire win condition — use Summon Forth to guarantee you draw it each fight',
					'Seeking Edge is the most impactful card for this build — it turns Sovereign Blade into AoE',
					'Furnace is best played as early as possible — each turn it\'s active adds more Forge',
					'Conqueror + a heavily Forged Sovereign Blade = double damage burst that can one-shot most enemies'
				]
			}
		],
		bossMatchups: [
			{ boss: 'Ceremonial Beast', difficulty: 'medium', tip: 'Star Engine races the Beast before Strength scaling gets out of control. Burst during stun windows. Forge build with Furnace is safer for sustained fights.' },
			{ boss: 'Vantom', difficulty: 'easy', tip: 'Multi-hit Star cards strip Slippery fast. Save Block and Stars for Turn 3 Dismember. Burst on Turn 4 safe window with Sovereign Blade.' },
			{ boss: 'Lagavulin Matriarch', difficulty: 'medium', tip: 'Use sleep turns to set up Furnace and Powers. She debuffs Strength but Forge is permanent — Forge build ignores her debuffs.' },
			{ boss: 'Soul Fysh', difficulty: 'easy', tip: 'Play Beckon cards immediately. Don\'t attack during Intangible phases. Star Engine provides burst on safe turns.' },
			{ boss: 'Waterfall Giant', difficulty: 'easy', tip: 'Star Engine bursts through 250 HP. Sovereign Blade + Seeking Edge handles this cleanly. Save Block for explosion turn.' },
			{ boss: 'Crusher', difficulty: 'medium', tip: 'Big hits need solid defense. Neutron Aegis and Bulwark provide Block. Kill Rocket first. Forge build races Crusher with scaling.' },
			{ boss: 'Knowledge Demon', difficulty: 'hard', tip: 'Play aggressively — Ponder heals 30 HP + Strength. Arsenal + Powers scale through debuff choices. Pick Disintegration if your build is fast.' },
			{ boss: 'The Insatiable', difficulty: 'easy', tip: 'Star Engine\'s burst damage excels in this DPS race. Always play Frantic Escape cards. Conqueror + Forged Blade can one-shot the Insatiable.' },
			{ boss: 'Queen', difficulty: 'easy', tip: 'Seeking Edge turns Sovereign Blade into AoE that clears Amalgam + Queen. Kill Amalgam first. Seven Stars hits hard for adds.' },
			{ boss: 'Doormaker', difficulty: 'hard', tip: 'Long fight drains Star reserves. Forge build with Furnace + Arsenal scales across phases. Save Conqueror burst for Doormaker stun turns.' }
		],
		ascensionTips: [
			{ tip: 'A1-4: Star Engine is straightforward and effective. Take Venerate and Falling Star liberally. Fight Elites for relics.', cards: ['VENERATE', 'FALLING_STAR'], relics: ['AKABEKO'] },
			{ tip: 'A5: Ascender\'s Bane dilutes your hand. Regent needs to find Star generators consistently — remove the Bane early at shops.', cards: ['VENERATE'], relics: ['AKABEKO'] },
			{ tip: 'A6-7: Fewer Rest Sites and rarer cards. Don\'t over-draft expensive Star consumers without Star income to support them.', cards: ['VENERATE', 'GATHER_LIGHT'], relics: ['AKABEKO'] },
			{ tip: 'A8-9: Enemies have more HP and damage. Forge build with Furnace is the safest scaling — Forge persists and compounds. Bulwark provides reliable Block.', cards: ['FURNACE', 'BULWARK'], relics: ['AKABEKO'] },
			{ tip: 'A10: Double boss at Act 3 end. Forge build with Seeking Edge has the highest ceiling — one massive Blade handles both fights. Keep decks to 16-18 cards.', cards: ['SEEKING_EDGE', 'SUMMON_FORTH'], relics: ['AKABEKO'] }
		],
		draftPriority: [
			{ phase: 'Act 1', cards: 'Venerate, Falling Star, Shining Strike, Parry, Gather Light', note: 'Star generation and basic damage. Don\'t take Star consumers without income yet.' },
			{ phase: 'Act 2', cards: 'Sword Sage, Arsenal, Furnace, Seven Stars, Genesis', note: 'Commit to Star Engine, Command, or Forge. Take the archetype card that matches your draft.' },
			{ phase: 'Act 3+', cards: 'Seeking Edge, Conqueror, Void Form, Summon Forth', note: 'Build-defining finishers. Seeking Edge makes Forge build unbeatable. Void Form scales Star Engine.' }
		]
	}
};

export const GENERAL_TIPS: GeneralTipSection[] = [
	{
		title: 'Beginner Tips',
		slug: 'beginner-tips',
		description: 'Essential concepts every new player should know to win more runs',
		tips: [
			{ heading: 'Smaller Decks Win More', text: 'A 20-card deck draws key cards every fight. A 35-card deck might never see your best card. Skip more card rewards than you take — only add cards that fill a specific gap in your deck.' },
			{ heading: 'Remove Strikes First', text: 'Strikes are the weakest cards in your deck. Remove them at shops before Defends. Every removed Strike means you draw your strong cards more often.' },
			{ heading: 'Front-load Damage in Act 1', text: 'Act 1 enemies hit hard before you have scaling. Take strong Attack cards early (Pommel Strike, Ball Lightning, Backstab). Transition to scaling cards in Act 2.' },
			{ heading: 'Learn Enemy Intents', text: 'Enemies show their next move with intent icons. Sword = Attack, Shield = Block, Buff = Power. Plan your turn around what the enemy is doing — block when they attack, attack when they buff.' },
			{ heading: 'Potions Are Free Power', text: 'Don\'t hoard potions "for the boss." Use them aggressively on Elites and hard fights to take 0 damage. An unused potion at the end of an Act is wasted power.' },
			{ heading: 'Fight Elites for Relics', text: 'Elites drop relics which are permanent upgrades for the entire run. A single good relic can double your deck\'s power. Aim for 1-2 Elite fights per Act if your HP allows.' },
			{ heading: 'Upgrade Key Cards Over Resting', text: 'At Rest Sites, upgrading a key card is usually better than healing. An upgraded Demon Form or Noxious Fumes prevents more damage over a run than 30 HP of healing.' },
			{ heading: 'Build Synergy, Not "Good Cards"', text: 'A mediocre card that synergizes with your deck is better than a powerful card that doesn\'t. If you\'re building Poison, take Deadly Poison over a flashy Attack that doesn\'t apply Poison.' },
			{ heading: 'Don\'t Force Archetypes', text: 'Don\'t decide "I\'m going Strength build" on Floor 1. Take generically strong cards early, then commit to an archetype when the game offers you 2-3 pieces that fit together.' },
			{ heading: 'Card Draw and Energy Are King', text: 'Cards that draw more cards (Battle Trance, Acrobatics) or generate Energy (Offering, Adrenaline) are high priority for every deck. An extra card per turn is roughly +20% more power.' },
			{ heading: 'Path Planning Matters', text: 'Before entering an Act, plan your route. Need relics? Path through Elites. Low HP? Take a route with Rest Sites and shops. Need cards? Hit question marks and regular fights.' },
			{ heading: 'Don\'t Ignore Defense', text: 'New players often draft too many Attacks and not enough Block. If you die before playing your damage cards, they\'re worthless. Aim for a balanced deck with at least 30-40% defensive cards.' },
			{ heading: 'Relics Guide Your Strategy', text: 'If you pick up Shuriken (Strength per 3 Attacks), draft more cheap Attacks. If you get Snecko Skull (extra Poison), lean into Poison. Let your relics guide your card picks.' },
			{ heading: 'Boss Fights Need Scaling', text: 'Bosses have hundreds of HP and escalating attacks. Raw damage won\'t cut it. You need Strength scaling, Poison stacking, Focus + Orbs, or other multiplicative damage to keep up.' },
			{ heading: 'Accept That Some Runs Are Lost', text: 'Not every run is winnable. Bad card offerings, bad relics, or unlucky events happen. Learn from each loss — what killed you, and what could you have drafted differently?' }
		]
	},
	{
		title: 'Advanced Strategy',
		slug: 'advanced-strategy',
		description: 'Concepts for experienced players looking to improve consistency',
		tips: [
			{ heading: 'Deck Archetypes Over Individual Cards', text: 'A mediocre card that fits your archetype is better than a great card that doesn\'t. Synergy beats raw power.' },
			{ heading: 'Damage vs. Scaling', text: 'Act 1: raw damage. Act 2: start scaling. Act 3+: pure scaling wins. Adapt your drafting priorities.' },
			{ heading: 'Path Planning', text: 'Plan your path through each act before starting. Consider your HP, deck strength, and whether you need shops, campfires, or elites.' },
			{ heading: 'Energy Management', text: 'Cards that generate energy (or cost 0) are high priority. An extra energy per turn is roughly +25% more plays.' },
			{ heading: 'Know When to Upgrade vs. Rest', text: 'Upgrading a key card is usually better than healing. Key upgrades can prevent more damage than the heal restores.' },
			{ heading: 'Boss Relic Swaps', text: 'Trading your starting relic for a boss relic at the start is high risk, high reward. Evaluate based on which character you\'re playing.' }
		]
	},
	{
		title: 'Ascension Guide',
		slug: 'ascension-guide',
		description: 'All 10 Ascension levels explained — what changes and how to adapt',
		tips: [
			{ heading: 'How Ascension Works', text: 'Ascension unlocks after beating Act 3. There are 10 levels, tracked per character. All modifiers are cumulative — Ascension 10 has ALL effects active at once.' },
			{ heading: 'A1: Swarming Elites', text: '~60% more Elites spawn on the map. Fight them — relics are permanent power. But plan your HP carefully, more Elites means more damage taken.' },
			{ heading: 'A2: Weary Traveler', text: 'Healing is reduced to 80% effectiveness. Rest Sites and potions heal less. This makes taking unnecessary damage even more punishing.' },
			{ heading: 'A3: Poverty', text: 'Enemies and chests drop 25% less Gold. Fewer shop visits, fewer card removals. Prioritize which purchases matter most.' },
			{ heading: 'A4: Tight Belt', text: '1 fewer potion slot. Potions are free power — losing a slot hurts. Use potions aggressively instead of hoarding them.' },
			{ heading: 'A5: Ascender\'s Bane', text: 'You start with an unplayable curse card. It dilutes your deck and hand. Remove it at the first shop — a dead card costs you turns every fight.' },
			{ heading: 'A6-7: Fewer Resources', text: 'A6 removes a Rest Site per Act (fewer heals/upgrades). A7 halves Rare and Upgraded card appearances. Draft more flexibly — you can\'t rely on finding specific Rares.' },
			{ heading: 'A8-9: Tougher Enemies', text: 'A8 gives all enemies more HP. A9 makes all enemies deal more damage. Together these make every fight significantly harder. Draft more defensively and keep decks tight.' },
			{ heading: 'A10: Double Boss', text: 'You fight TWO bosses at the end of Act 3, back to back. Your deck must handle two full HP bars without resting. This is the ultimate test — build for consistency over glass-cannon burst.' },
			{ heading: 'General High-Ascension Tips', text: 'Skip cards aggressively (15-20 card decks). Remove Strikes first. Fight Elites for relics. Use potions on Elites, not bosses. Upgrade key cards over healing. Don\'t force builds — adapt to what\'s offered.' }
		]
	}
];

export const TIER_LIST_DATA: TierListData = {
	cards: {
		ironclad: {
			S: ['DEMON_FORM', 'CORRUPTION', 'BARRICADE', 'OFFERING', 'IMPERVIOUS'],
			A: ['DARK_EMBRACE', 'FEEL_NO_PAIN', 'INFLAME', 'FIEND_FIRE', 'BATTLE_TRANCE', 'WHIRLWIND', 'STONE_ARMOR'],
			B: ['TWIN_STRIKE', 'POMMEL_STRIKE', 'THRASH', 'FLAME_BARRIER', 'SHRUG_IT_OFF', 'BLOODLETTING', 'SECOND_WIND'],
			C: ['ANGER', 'HEADBUTT', 'BODY_SLAM', 'RUPTURE', 'HEMOKINESIS', 'RAGE'],
			D: ['IRON_WAVE', 'PERFECTED_STRIKE']
		},
		silent: {
			S: ['ENVENOM', 'NOXIOUS_FUMES', 'ADRENALINE', 'WRAITH_FORM', 'TOOLS_OF_THE_TRADE'],
			A: ['DEADLY_POISON', 'BLADE_DANCE', 'ACCURACY', 'FOOTWORK', 'MALAISE', 'BACKSTAB', 'BOUNCING_FLASK'],
			B: ['CLOAK_AND_DAGGER', 'DASH', 'LEG_SWEEP', 'INFINITE_BLADES', 'WELL_LAID_PLANS', 'CALCULATED_GAMBLE'],
			C: ['POISONED_STAB', 'DEFLECT', 'PREPARED', 'DODGE_AND_ROLL', 'SLICE'],
			D: ['DAGGER_THROW', 'SUCKER_PUNCH']
		},
		defect: {
			S: ['BIASED_COGNITION', 'GLACIER', 'DEFRAGMENT', 'ECHO_FORM', 'CREATIVE_AI'],
			A: ['COOLHEADED', 'HAILSTORM', 'BALL_LIGHTNING', 'STORM', 'BUFFER', 'THUNDER', 'CONSUMING_SHADOW'],
			B: ['COLD_SNAP', 'CHARGE_BATTERY', 'TEMPEST', 'DARKNESS', 'GENETIC_ALGORITHM', 'LOOP'],
			C: ['MULTI_CAST', 'LEAP', 'BEAM_CELL', 'HOLOGRAM', 'TESLA_COIL'],
			D: ['REBOOT', 'TURBO']
		},
		necrobinder: {
			S: ['REAPER_FORM', 'SPIRIT_OF_ASH', 'NECRO_MASTERY', 'SOUL_STORM', 'SACRIFICE'],
			A: ['REANIMATE', 'UNDEATH', 'HAUNT', 'LEGION_OF_BONE', 'SHARED_FATE', 'CAPTURE_SPIRIT', 'DEMESNE'],
			B: ['SCULPTING_STRIKE', 'BLIGHT_STRIKE', 'BONE_SHARDS', 'DANSE_MACABRE', 'SHROUD', 'DEATHBRINGER'],
			C: ['BODYGUARD', 'FLATTEN', 'REAP', 'DEFILE', 'SPUR', 'GRAVEBLAST'],
			D: ['POKE', 'SNAP']
		},
		regent: {
			S: ['SEVEN_STARS', 'SWORD_SAGE', 'VOID_FORM', 'GENESIS', 'ARSENAL'],
			A: ['STARDUST', 'COMET', 'MONARCHS_GAZE', 'FURNACE', 'HEAVENLY_DRILL', 'NEUTRON_AEGIS', 'HAMMER_TIME'],
			B: ['SHINING_STRIKE', 'DEVASTATE', 'BULWARK', 'CONVERGENCE', 'PILLAR_OF_CREATION', 'SPECTRUM_SHIFT'],
			C: ['SOLAR_STRIKE', 'GLIMMER', 'CLOAK_OF_STARS', 'PATTER', 'RADIATE', 'PARRY'],
			D: ['CRUSH_UNDER', 'COSMIC_INDIFFERENCE']
		}
	}
};

export const POTION_TIER_DATA: TierData = {
	S: ['BLESSING_OF_THE_FORGE', 'DISTILLED_CHAOS', 'FAIRY_IN_A_BOTTLE', 'GHOST_IN_A_JAR', 'LIQUID_MEMORIES', 'POWER_POTION', 'DUPLICATOR'],
	A: ['ATTACK_POTION', 'SKILL_POTION', 'CUNNING_POTION', 'GAMBLERS_BREW', 'SNECKO_OIL', 'SHACKLING_POTION', 'ESSENCE_OF_DARKNESS', 'BOTTLED_POTENTIAL', 'OROBIC_ACID', 'STAR_POTION', 'POTION_OF_DOOM', 'COSMIC_CONCOCTION', 'DROPLET_OF_PRECOGNITION', 'MAZALETHS_GIFT'],
	B: ['BLOCK_POTION', 'ENERGY_POTION', 'FIRE_POTION', 'STRENGTH_POTION', 'FOCUS_POTION', 'LIQUID_BRONZE', 'SPEED_POTION', 'DEXTERITY_POTION', 'FLEX_POTION', 'VULNERABLE_POTION', 'POISON_POTION', 'CLARITY', 'HEART_OF_IRON', 'ASHWATER', 'KINGS_COURAGE', 'RADIANT_TINCTURE', 'POTION_OF_CAPACITY', 'BONE_BREW'],
	C: ['COLORLESS_POTION', 'REGEN_POTION', 'SWIFT_POTION', 'WEAK_POTION', 'CURE_ALL', 'FORTIFIER', 'FYSH_OIL', 'BLOOD_POTION', 'POWDERED_DEMISE', 'STABLE_SERUM', 'POTION_OF_BINDING', 'TOUCH_OF_INSANITY', 'FRUIT_JUICE', 'FOUL_POTION', 'GLOWWATER_POTION', 'SOLDIERS_STEW', 'LUCKY_TONIC'],
	D: ['EXPLOSIVE_AMPOULE', 'POTION_SHAPED_ROCK', 'ENTROPIC_BREW', 'POT_OF_GHOULS', 'SHIP_IN_A_BOTTLE', 'GIGANTIFICATION_POTION', 'BEETLE_JUICE']
};

export const RELIC_TIER_DATA: TierData = {
	S: ['ICE_CREAM', 'ART_OF_WAR', 'GIRYA', 'BLACK_STAR', 'EMPTY_CAGE', 'RUNIC_PYRAMID', 'SNECKO_EYE', 'ASTROLABE'],
	A: ['AKABEKO', 'ANCHOR', 'BAG_OF_PREPARATION', 'CENTENNIAL_PUZZLE', 'GAMBLING_CHIP', 'GREMLIN_HORN', 'FROZEN_EGG', 'MUMMIFIED_HAND', 'NUNCHAKU', 'PEN_NIB', 'SHURIKEN', 'KUNAI', 'ORNAMENTAL_FAN', 'TOXIC_EGG', 'MOLTEN_EGG', 'UNCEASING_TOP', 'MEMBERSHIP_CARD', 'CHEMICAL_X', 'ORRERY', 'ICE_CREAM'],
	B: ['BLOOD_VIAL', 'BRONZE_SCALES', 'BAG_OF_MARBLES', 'ETERNAL_FEATHER', 'HORN_CLEAT', 'JUZU_BRACELET', 'LANTERN', 'MERCURY_HOURGLASS', 'ORICHALCUM', 'PANTOGRAPH', 'PEAR', 'POTION_BELT', 'REGAL_PILLOW', 'STONE_CALENDAR', 'THE_COURIER', 'VAJRA', 'VAMBRACE', 'WAR_PAINT', 'WHETSTONE', 'PAPER_KRANE', 'PAPER_PHROG', 'TINGSHA', 'TOUGH_BANDAGES', 'SELF_FORMING_CLAY', 'CHARONS_ASHES', 'DEMON_TONGUE', 'FUNERARY_MASK', 'IVORY_TILE', 'DATA_DISK', 'EMOTION_CHIP', 'POWER_CELL', 'GOLD_PLATED_CABLES', 'SYMBIOTIC_VIRUS', 'RUNIC_CAPACITOR', 'GALACTIC_DUST', 'REGALITE', 'LUNAR_PASTRY', 'MINI_REGENT', 'ORANGE_DOUGH'],
	C: ['BOOK_OF_FIVE_RINGS', 'GORGET', 'HAPPY_FLOWER', 'MEAT_ON_THE_BONE', 'MEAL_TICKET', 'PENDULUM', 'PERMAFROST', 'RED_MASK', 'STRIKE_DUMMY', 'STRAWBERRY', 'MANGO', 'TINY_MAILBOX', 'ODDLY_SMOOTH_STONE', 'VENERABLE_TEA_SET', 'GORGET', 'BELLOWS', 'CANDELABRA', 'LETTER_OPENER', 'REPTILE_TRINKET', 'SPARKLING_ROUGE', 'STONE_CRACKER', 'TUNING_FORK', 'TWISTED_FUNNEL', 'LUCKY_FYSH', 'RIPPLE_BASIN', 'PLANISPHERE', 'MINIATURE_CANNON', 'PARRYING_SHIELD', 'PETRIFIED_TOAD', 'BOWLER_HAT', 'CAPTAINS_WHEEL', 'CLOAK_CLASP', 'CHANDELIER'],
	D: ['CIRCLET', 'POCKETWATCH', 'BELT_BUCKLE', 'BIG_MUSHROOM', 'RINGING_TRIANGLE', 'FESTIVE_POPPER', 'MEAL_TICKET']
};
