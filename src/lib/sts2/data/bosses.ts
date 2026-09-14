export interface BossMove {
	turn: string;
	name: string;
	effect: string;
}

export interface BossPhase {
	name: string;
	moves: BossMove[];
}

export interface BossData {
	slug: string;
	name: string;
	act: string;
	actName: string;
	hp: number;
	hpAsc: number;
	hpNote?: string;
	image: string;
	difficulty: string;
	mechanics: string[];
	phases: BossPhase[];
	dangerTurns: string;
	strategy: string[];
	counters: string[];
}

export const BOSS_DATA: BossData[] = [
	{
		slug: 'ceremonial-beast',
		name: 'Ceremonial Beast',
		act: '1a',
		actName: 'Overgrowth',
		hp: 252,
		hpAsc: 262,
		image: '/static/images/monsters/ceremonial_beast.png',
		difficulty: 'medium',
		mechanics: ['Plow', 'Stun', 'Ringing'],
		phases: [
			{
				name: 'Phase 1 — Plow',
				moves: [
					{ turn: '1', name: 'Stamp', effect: 'Gains Plow 150 (160 A9+). When HP drops to threshold, becomes Stunned and loses all Strength.' },
					{ turn: '2+', name: 'Plow', effect: '18 dmg (20 A9+), gains 2 Strength each use. Strength is lost on stun.' }
				]
			},
			{
				name: 'Phase 2 — After Stun (3-move cycle)',
				moves: [
					{ turn: '1', name: 'Beast Cry', effect: 'Applies Ringing 1 — you can only play 1 card this turn.' },
					{ turn: '2', name: 'Stomp', effect: '15 dmg (17 A9+).' },
					{ turn: '3', name: 'Crush', effect: '17 dmg (19 A9+), gains 3 Strength (4 A9+) — permanent.' }
				]
			}
		],
		dangerTurns: 'Crush (permanent Strength stacking), Beast Cry (1-card limit)',
		strategy: [
			'Turn 1 is free (Stamp is a buff only) — use it to set up Powers or play key cards.',
			'Burst damage is ideal for Phase 1 — the longer it lasts, the harder Plow hits.',
			'In Phase 2, Beast Cry limits you to 1 card. Plan around it: play your strongest card or a Power.',
			'Kill quickly before Crush stacks too much permanent Strength.',
			'Apply Weak to reduce Plow and Crush damage significantly.'
		],
		counters: ['High burst damage', 'Vulnerable application', 'Weak to reduce Plow/Crush damage', 'Powers that work during Ringing turns']
	},
	{
		slug: 'vantom',
		name: 'Vantom',
		act: '1a',
		actName: 'Overgrowth',
		hp: 173,
		hpAsc: 183,
		image: '/static/images/monsters/vantom.png',
		difficulty: 'medium',
		mechanics: ['Slippery', 'Wounds', 'Fixed Cycle'],
		phases: [
			{
				name: 'Fixed 4-Move Cycle (loops forever)',
				moves: [
					{ turn: '1', name: 'Ink Blot', effect: '7 dmg (8 A9+).' },
					{ turn: '2', name: 'Inky Lance', effect: '6×2 dmg (7×2 A9+).' },
					{ turn: '3', name: 'Dismember', effect: '27 dmg (30 A9+), shuffles 3 Wounds into your discard pile.' },
					{ turn: '4', name: 'Prepare', effect: 'Gains 2 Strength — permanent.' }
				]
			}
		],
		dangerTurns: 'Turn 3: Dismember (27-30 dmg + 3 Wounds). Save ALL Block for this turn.',
		strategy: [
			'Starts with Slippery 9 — the first 9 times it would lose HP, it only loses 1 HP instead.',
			'Multi-hit attacks strip Slippery stacks fastest (each hit removes one stack).',
			'Turn 3 Dismember is the kill turn — save your strongest Block and potions for it.',
			'Turn 4 (Prepare) is the safest window to deal damage.',
			'Wounds clog your deck — card draw and Exhaust help manage them.',
			'Kill before too many Prepare cycles stack permanent Strength.'
		],
		counters: ['Multi-hit attacks (strip Slippery)', 'Strong Block for Turn 3', 'Exhaust for Wound removal', 'Burst damage on Turn 4']
	},
	{
		slug: 'lagavulin-matriarch',
		name: 'Lagavulin Matriarch',
		act: '1b',
		actName: 'Underdocks',
		hp: 222,
		hpAsc: 233,
		image: '/static/images/monsters/lagavulin_matriarch.png',
		difficulty: 'hard',
		mechanics: ['Sleep', 'Plating', 'Stat Drain'],
		phases: [
			{
				name: 'Sleep Phase (3 turns)',
				moves: [
					{ turn: '1-3', name: 'Asleep', effect: 'Does nothing. Has Plating 12 (reduces all incoming damage by 12). Wakes after 3 turns OR when taking unblocked damage.' }
				]
			},
			{
				name: 'Awake Phase (4-move cycle)',
				moves: [
					{ turn: '1', name: 'Slash', effect: '19 dmg (21 A9+).' },
					{ turn: '2', name: 'Disembowel', effect: '9×2 dmg (10×2 A9+).' },
					{ turn: '3', name: 'Slash', effect: '12 dmg (14 A9+), gains 12 Block (14 A8+).' },
					{ turn: '4', name: 'Soul Siphon', effect: 'Removes 2 Strength and 2 Dexterity from you, gains 2 Strength.' }
				]
			}
		],
		dangerTurns: 'Soul Siphon (permanent -2 Str/-2 Dex each cycle). The longer the fight, the weaker you get.',
		strategy: [
			'Sleep turns are your setup window — play Powers, scaling cards, and buffs for free.',
			'Plating 12 reduces all damage while asleep. Multi-hit attacks help pierce it.',
			'Soul Siphon permanently drains your Strength and Dexterity. Kill fast or get overwhelmed.',
			'Poison, Doom, and non-Strength scaling ignore her stat drain.',
			'If you have strong scaling, let her sleep all 3 turns. If you need to race, wake her early.',
			'Block builds are safer here since they don\'t rely on Strength that gets drained.'
		],
		counters: ['Power setup during sleep', 'Multi-hit to pierce Plating', 'Scaling that ignores Strength (Poison, Orbs, Doom)', 'Kill fast before stat drain spirals']
	},
	{
		slug: 'soul-fysh',
		name: 'Soul Fysh',
		act: '1b',
		actName: 'Underdocks',
		hp: 211,
		hpAsc: 221,
		image: '/static/images/monsters/soul_fysh.png',
		difficulty: 'medium',
		mechanics: ['Intangible', 'Beckon', 'Vulnerable'],
		phases: [
			{
				name: 'Fixed 5-Move Cycle (loops forever)',
				moves: [
					{ turn: '1', name: 'Beckon', effect: 'Shuffles 2 Beckon status cards into your deck (1 draw pile, 1 discard).' },
					{ turn: '2', name: 'De-Gas', effect: '16 dmg (17 A9+).' },
					{ turn: '3', name: 'Gaze', effect: '7 dmg (8 A9+), shuffles 1 Beckon into discard.' },
					{ turn: '4', name: 'Fade', effect: 'Gains Intangible 2 — all damage reduced to 1 for 2 turns.' },
					{ turn: '5', name: 'Scream', effect: '11 dmg (12 A9+), applies Vulnerable 3.' }
				]
			}
		],
		dangerTurns: 'Turn 4-5: Fade makes damage useless, then Scream + Vulnerable 3 sets up deadly incoming damage next cycle.',
		strategy: [
			'Do NOT waste burst damage during Intangible (turns 4-5) — all damage is reduced to 1.',
			'Concentrate your attacks on turns 2-3 for maximum damage.',
			'Play Beckon cards when drawn — holding them at end of turn deals unblockable damage to you.',
			'Save Block for Scream (Vulnerable 3 amplifies all damage for the next 3 turns).',
			'Poison ticks and Doom ignore Intangible — Silent and Necrobinder excel here.',
			'Patience is key — this is a longer fight with forced downtime windows.'
		],
		counters: ['Poison/Doom (ignore Intangible)', 'Save burst for non-Intangible turns', 'Artifact blocks Vulnerable', 'Play Beckon cards immediately']
	},
	{
		slug: 'waterfall-giant',
		name: 'Waterfall Giant',
		act: '1b',
		actName: 'Underdocks',
		hp: 250,
		hpAsc: 260,
		image: '/static/images/monsters/waterfall_giant.png',
		difficulty: 'easy',
		mechanics: ['Steam Eruption', 'Explosion on Death', 'Self-Heal'],
		phases: [
			{
				name: 'Main Pattern (repeating after Pressurize)',
				moves: [
					{ turn: '1', name: 'Pressurize', effect: 'Gains 15 Steam Eruption (20 A9+).' },
					{ turn: '2', name: 'Stomp', effect: '15 dmg (16 A9+), applies Weak 1, gains 3 Steam Eruption.' },
					{ turn: '3', name: 'Ram', effect: '10 dmg (11 A9+), gains 3 Steam Eruption.' },
					{ turn: '4', name: 'Siphon', effect: 'Heals 15 HP, gains 3 Steam Eruption.' },
					{ turn: '5', name: 'Pressure Gun', effect: '20 dmg (23 A9+) — increases by 5 each use, gains 3 Steam Eruption.' },
					{ turn: '6', name: 'Pressure Up', effect: '13 dmg (14 A9+), gains 3 Steam Eruption.' }
				]
			},
			{
				name: 'Death Sequence',
				moves: [
					{ turn: 'On Death', name: 'About To Blow', effect: 'Becomes invulnerable for 1 turn.' },
					{ turn: 'Next Turn', name: 'Explode', effect: 'Deals damage equal to total Steam Eruption stacks (typically 30-50+).' }
				]
			}
		],
		dangerTurns: 'Explosion on death (30-50+ dmg based on accumulated Steam). Pressure Gun escalates +5 per use.',
		strategy: [
			'The explosion IS the threat — save Block and potions for the turn after it reaches 0 HP.',
			'Every turn adds more Steam Eruption stacks, making the explosion bigger. Kill fast.',
			'Siphon heals 15 HP — sustained damage prevents it from dragging the fight out.',
			'Apply Weak before the killing blow to reduce explosion damage.',
			'Doom effect kills without triggering the explosion (bypasses death sequence).',
			'Pressure Gun escalates +5 per use — in long fights this becomes the biggest attack.'
		],
		counters: ['Strong Block for explosion', 'Weak on death turn', 'Fast kill to minimize Steam', 'Doom bypasses explosion entirely']
	},
	{
		slug: 'kaiser-crab',
		name: 'Kaiser Crab',
		act: '2',
		actName: 'Hive',
		hp: 199,
		hpAsc: 209,
		hpNote: 'Crusher 199/209 + Rocket 189/199',
		image: '/static/images/monsters/crusher.png',
		difficulty: 'hard',
		mechanics: ['Dual Target', 'Surrounded', 'Crab Rage'],
		phases: [
			{
				name: 'Crusher (Left Claw) — 5-move cycle',
				moves: [
					{ turn: '1', name: 'Thrash', effect: '12 dmg (14 A9+).' },
					{ turn: '2', name: 'Enlarging Strike', effect: '4 dmg.' },
					{ turn: '3', name: 'Bug Sting', effect: '6×2 dmg (7×2 A9+), applies Weak 2 + Frail 2.' },
					{ turn: '4', name: 'Adapt', effect: 'Gains 2 Strength.' },
					{ turn: '5', name: 'Guarded Strike', effect: '12 dmg (14 A9+), gains 18 Block.' }
				]
			},
			{
				name: 'Rocket (Right Claw) — 5-move cycle',
				moves: [
					{ turn: '1', name: 'Targeting Reticle', effect: '3 dmg (4 A9+).' },
					{ turn: '2', name: 'Precision Beam', effect: '18 dmg (20 A9+).' },
					{ turn: '3', name: 'Charge Up', effect: 'Gains 2 Strength.' },
					{ turn: '4', name: 'Laser', effect: '31 dmg (35 A9+).' },
					{ turn: '5', name: 'Recharge', effect: 'Does nothing.' }
				]
			}
		],
		dangerTurns: 'Laser (31-35 dmg!), Bug Sting (Weak + Frail). When one claw dies: Crab Rage — survivor gains 5 Strength + 99 Block.',
		strategy: [
			'Dual fight: Crusher (left) + Rocket (right). You\'re positioned between both.',
			'Back Attack: the claw you face away from deals 50% more damage. Always face the attacking one.',
			'Laser on Turn 4 (Rocket) is the biggest single hit — save your best Block for it.',
			'Bug Sting applies Weak 2 + Frail 2 — Artifact or cleanse is very valuable here.',
			'Crab Rage: when one dies, the other gains 5 Strength + 99 Block. Burst the survivor fast.',
			'Try to whittle both down evenly, then kill one and immediately burst the other.',
			'AoE damage hits both claws and is extremely efficient here.'
		],
		counters: ['AoE damage', 'Artifact for Bug Sting debuffs', 'High single-target burst for Crab Rage', 'Strong Block for Laser turn']
	},
	{
		slug: 'knowledge-demon',
		name: 'Knowledge Demon',
		act: '2',
		actName: 'Hive',
		hp: 379,
		hpAsc: 399,
		image: '/static/images/monsters/knowledge_demon.png',
		difficulty: 'hard',
		mechanics: ['Curse Choices', 'Self-Heal', 'Strength Scaling'],
		phases: [
			{
				name: 'Fixed 4-Move Cycle (Curse → Slap → Overwhelm → Ponder)',
				moves: [
					{ turn: '1', name: 'Curse of Knowledge', effect: 'Choose one of two curses to receive (see curse sets below).' },
					{ turn: '2', name: 'Slap', effect: '17 dmg (18 A9+).' },
					{ turn: '3', name: 'Knowledge Overwhelming', effect: '8×3 dmg (9×3 A9+) = 24-27 total.' },
					{ turn: '4', name: 'Ponder', effect: '11 dmg (13 A9+), heals 30 HP, gains 2 Strength (3 A9+).' }
				]
			},
			{
				name: 'Curse Choices (each offered once)',
				moves: [
					{ turn: 'Set 1', name: 'Disintegration (6 dmg/turn)', effect: 'OR Mind Rot (draw 1 fewer card/turn).' },
					{ turn: 'Set 2', name: 'Disintegration (7 dmg/turn)', effect: 'OR Sloth (max 3 cards/turn).' },
					{ turn: 'Set 3', name: 'Disintegration (8 dmg/turn)', effect: 'OR Waste Away (1 less Energy/turn).' }
				]
			}
		],
		dangerTurns: 'Ponder (heals 30 HP + gains Strength every cycle). Knowledge Overwhelming (24-27 multi-hit dmg).',
		strategy: [
			'379 HP + heals 30 every 4 turns — you MUST play aggressively or he outheals you.',
			'Ponder is the key move to race against: 30 HP heal + Strength stacking every cycle.',
			'Choose curses carefully: Disintegration (flat damage) is better if your build is fast.',
			'Mind Rot (-1 draw) hurts card-draw-heavy decks. Sloth (max 3 cards) hurts combo decks.',
			'Waste Away (-1 Energy) is often the worst curse — avoid it unless your build is very cheap.',
			'After all 3 curse sets, Curse of Knowledge is skipped — the 3-move cycle speeds up.',
			'Block hard on Knowledge Overwhelming turns (24-27 total multi-hit damage).'
		],
		counters: ['High sustained damage to outpace healing', 'Poison/scaling ignores Block', 'Artifact or cleanse for curses', 'Aggressive play to end before 3rd curse set']
	},
	{
		slug: 'the-insatiable',
		name: 'The Insatiable',
		act: '2',
		actName: 'Hive',
		hp: 321,
		hpAsc: 341,
		image: '/static/images/monsters/the_insatiable.png',
		difficulty: 'medium',
		mechanics: ['Sandpit Timer', 'Frantic Escape', 'Strength Scaling'],
		phases: [
			{
				name: 'Pattern (repeating after Liquify Ground)',
				moves: [
					{ turn: '1', name: 'Liquify Ground', effect: 'Applies Sandpit 4 to you (death timer). Shuffles 6 Frantic Escape into your deck.' },
					{ turn: '2', name: 'Thrash', effect: '8×2 dmg (9×2 A9+).' },
					{ turn: '3', name: 'Lunging Bite', effect: '28 dmg (31 A9+).' },
					{ turn: '4', name: 'Salivate', effect: 'Gains 2 Strength (3 A9+).' },
					{ turn: '5', name: 'Thrash', effect: '8×2 dmg (9×2 A9+).' }
				]
			}
		],
		dangerTurns: 'Sandpit: if counter reaches 0, you die instantly. Lunging Bite (28-31 dmg) every cycle.',
		strategy: [
			'Sandpit 4 = you die in 4 turns unless you play Frantic Escape cards to extend it.',
			'ALWAYS play Frantic Escape cards when drawn — they cost 0 Energy and extend the timer by 1.',
			'Never use random Exhaust effects — you might accidentally Exhaust a Frantic Escape.',
			'Lunging Bite (28-31 dmg) is the spike damage — save your strongest Block for it.',
			'Salivate stacks Strength permanently — Thrash gets more dangerous each cycle.',
			'This is a pure DPS race. Scaling damage and fast kills are essential.',
			'Poison is excellent here — it ticks passively while you manage Frantic Escape cards.'
		],
		counters: ['Fast DPS / scaling damage', 'Poison (ticks while managing Escapes)', 'Strong Block for Lunging Bite', 'Never Exhaust randomly']
	},
	{
		slug: 'queen',
		name: 'Queen',
		act: '3',
		actName: 'Glory',
		hp: 400,
		hpAsc: 419,
		hpNote: 'Queen 400/419 + Amalgam 199/211',
		image: '/static/images/monsters/queen.png',
		difficulty: 'hard',
		mechanics: ['Chains of Binding', 'Triple Debuff', 'Minion'],
		phases: [
			{
				name: 'Queen — Opening Moves',
				moves: [
					{ turn: '1', name: 'Puppet Strings', effect: 'Applies Chains of Binding 3 (first 3 cards drawn each turn become Bound).' },
					{ turn: '2', name: 'You\'re Mine', effect: 'Applies 99 Frail, 99 Weak, 99 Vulnerable to you.' }
				]
			},
			{
				name: 'Queen — While Amalgam Alive (repeats)',
				moves: [
					{ turn: '3+', name: 'Burn Bright for Me', effect: 'Gives 1 Strength to Amalgam, gains 20 Block.' }
				]
			},
			{
				name: 'Queen — After Amalgam Dies (3-move cycle)',
				moves: [
					{ turn: '1', name: 'Off with Your Head', effect: '3×5 dmg (4×5 A9+).' },
					{ turn: '2', name: 'Execution', effect: '15 dmg (18 A9+).' },
					{ turn: '3', name: 'Enrage', effect: 'Gains 2 Strength.' }
				]
			},
			{
				name: 'Torch Head Amalgam (repeating cycle)',
				moves: [
					{ turn: '1-2', name: 'Tackle', effect: '18 dmg (19 A9+).' },
					{ turn: '3', name: 'Beam', effect: '8×3 dmg.' },
					{ turn: '4-5', name: 'Weak Tackle', effect: '14 dmg (15 A9+).' }
				]
			}
		],
		dangerTurns: 'You\'re Mine (99 Frail/Weak/Vulnerable — essentially permanent). Off with Your Head + Vulnerable = massive damage.',
		strategy: [
			'Artifact is CRITICAL — it blocks You\'re Mine\'s 99 Frail/Weak/Vulnerable. Without it, your damage and block collapse.',
			'Kill the Amalgam before turn 10 — Queen buffs it with +1 Strength every turn.',
			'Amalgam is a Minion — it dies when the Queen dies, but killing Queen directly through 400 HP is slow.',
			'Chains of Binding locks your first 3 drawn cards. Only 1 Bound card can be played per turn.',
			'After Amalgam dies, Queen attacks directly with Off with Your Head (multi-hit) and Enrage.',
			'AoE damage is efficient — it hits both Queen and Amalgam.',
			'If you don\'t have Artifact, focus on Block and Poison/Doom that ignore the Weak debuff.'
		],
		counters: ['Artifact (blocks You\'re Mine)', 'AoE damage for both targets', 'Kill Amalgam fast', 'Poison/Doom ignores Weak debuff']
	},
	{
		slug: 'test-subject',
		name: 'Test Subject',
		act: '3',
		actName: 'Glory',
		hp: 100,
		hpAsc: 111,
		hpNote: 'Phase 1: 100/111 + Phase 2: 200/212 + Phase 3: 300/313 = ~600 total',
		image: '/static/images/monsters/test_subject.png',
		difficulty: 'hard',
		mechanics: ['Three Phases', 'Enrage', 'Painful Stabs', 'Intangible'],
		phases: [
			{
				name: 'Phase 1 — Enrage (100/111 HP)',
				moves: [
					{ turn: 'Passive', name: 'Enrage 2 (3 A9+)', effect: 'Gains Strength every time you play a Skill. Use Attacks only!' },
					{ turn: 'Alternating', name: 'Bite / Skull Bash', effect: 'Bite: 20 dmg (22 A9+). Skull Bash: 14 dmg (16 A9+), applies Vulnerable 1.' }
				]
			},
			{
				name: 'Phase 2 — Painful Stabs (200/212 HP)',
				moves: [
					{ turn: 'Passive', name: 'Painful Stabs', effect: 'Shuffles Wounds into your deck when you take unblocked attack damage.' },
					{ turn: 'Alternating', name: 'Multi-Claw / Pounce', effect: 'Multi-Claw: 10×3 dmg (11×3 A9+), gains +1 hit each use. Pounce: 30 dmg (32 A9+).' }
				]
			},
			{
				name: 'Phase 3 — Nemesis (300/313 HP)',
				moves: [
					{ turn: 'Passive', name: 'Nemesis', effect: 'Gains Intangible 1 at end of every other turn (all damage = 1).' },
					{ turn: 'Cycle', name: 'Lacerate / Big Pounce / Burning Growl', effect: 'Lacerate: 10×3 dmg (11×3). Big Pounce: 45 dmg. Burning Growl: 3 Burns (5 A9+), gains 2 Strength (3 A9+).' }
				]
			}
		],
		dangerTurns: 'Big Pounce (45 dmg!), Multi-Claw (gains hits each use), Burning Growl (Burns + Strength).',
		strategy: [
			'~600 total HP across 3 phases — this is a marathon, not a sprint.',
			'Phase 1: Do NOT play Skills — Enrage gives it Strength for each Skill you play. Attacks only.',
			'Phase 2: Block EVERYTHING — unblocked damage shuffles Wounds into your deck, clogging draws.',
			'Phase 3: Intangible every other turn. Save burst for non-Intangible turns. Don\'t waste damage.',
			'Big Pounce in Phase 3 deals 45 damage — always be ready with Block or potions.',
			'Scaling Powers (played in earlier phases) carry value across all 3 phases.',
			'Passive defenses (Frost Orbs, Plating, Noxious Fumes) are the best approach for this long fight.'
		],
		counters: ['Attack-heavy deck for Phase 1', 'Consistent Block for Phase 2', 'Patience with Intangible in Phase 3', 'Passive scaling (Powers, Orbs, Poison)']
	},
	{
		slug: 'doormaker',
		name: 'Doormaker',
		act: '3',
		actName: 'Glory',
		hp: 489,
		hpAsc: 512,
		hpNote: 'Door 155/165 + Doormaker 489/512',
		image: '/static/images/monsters/doormaker.png',
		difficulty: 'hard',
		mechanics: ['Phase Cycling', 'Escalating Strength', 'Free Turn'],
		phases: [
			{
				name: 'Door (3-move cycle, starts first)',
				moves: [
					{ turn: '1', name: 'Dramatic Open', effect: '25 dmg (28 A9+).' },
					{ turn: '2', name: 'Door Slam', effect: '15×2 dmg.' },
					{ turn: '3', name: 'Enforce', effect: '20 dmg, gains 3 Strength (4 A9+).' }
				]
			},
			{
				name: 'Doormaker (3-move sequence, appears after Door dies)',
				moves: [
					{ turn: '1', name: 'What Is It', effect: 'Does nothing — FREE TURN for you.' },
					{ turn: '2', name: 'Beam', effect: '31 dmg (34 A9+).' },
					{ turn: '3', name: 'Get Back In', effect: '40 dmg (45 A9+), gains 5 Strength, revives the Door, then disappears.' }
				]
			}
		],
		dangerTurns: 'Get Back In (40-45 dmg + 5 permanent Strength each cycle). Beam (31-34 dmg). Both escalate every cycle.',
		strategy: [
			'Doormaker retains Strength between appearances — +5 per cycle means the fight escalates FAST.',
			'Kill the Door as fast as possible each time to access the Doormaker.',
			'Each Doormaker appearance gives 1 free turn (What Is It does nothing) — use it for burst damage.',
			'Door max HP increases by 20-25 each revival, making it harder to reach the Doormaker.',
			'Poison persists between phase transitions — ideal for Silent and other DoT builds.',
			'You MUST kill the Doormaker to end the fight. Killing the Door only advances phases.',
			'The fight gets exponentially harder each cycle. Speed is critical — 2-3 cycles max.',
			'Apply Weak to reduce the escalating Beam and Get Back In damage.'
		],
		counters: ['Burst damage on Doormaker during free turn', 'Poison (persists between phases)', 'High sustained damage to end in 2-3 cycles', 'Weak to reduce escalating hits']
	}
];

export const BOSS_ACT_ORDER: string[] = ['1a', '1b', '2', '3'];
export const ACT_NAMES: Record<string, string> = { '1a': 'Act 1 — Overgrowth', '1b': 'Act 1 — Underdocks', '2': 'Act 2 — Hive', '3': 'Act 3 — Glory' };
export const ACT_COLORS: Record<string, string> = { '1a': '#43a047', '1b': '#1e88e5', '2': '#ff9800', '3': '#e53935' };
