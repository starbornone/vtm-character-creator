# V5 rules baseline and hand-checked fixtures

The first playable build uses the English V5 Core Rulebook, Renegade Game Studios’ 2022 second printing. **Core** below refers to the printed page numbers in that book. Renegade’s hardcover listing identifies the updated text as incorporating the earlier Core Rulebook errata and the V5 Companion errata. [Renegade Core Rulebook](https://renegadegamestudios.com/vampire-the-masquerade-5th-edition-roleplaying-game-core-rulebook/)

Use the Companion’s Part IV (pp. 61–63) to trace incorporated changes. Use Renegade’s published Blood Potency correction as the reference for the current table on Core p. 216. At Blood Potency 1, the corrected values include a Blood Surge of two dice and Bane Severity 2. The Companion supplies errata for this build. [World of Darkness Companion download](https://www.paradoxinteractive.com/games/world-of-darkness/community/free-content) · [Renegade Blood Potency correction](https://renegadegamestudios.com/content/File%20Storage%20for%20site/VTM/BloodPotencyTable.pdf)

The optional source pack uses Renegade Game Studios’ English 2023 V5 Player’s Guide. The catalog tags each additional option with its book and printed page. [Renegade Player’s Guide](https://renegadegamestudios.com/pdf-vampire-the-masquerade-roleplaying-game-5th-edition-players-guide/)

## Attributes and Skills

Distributions count how many distinct traits have each rating. Remaining Skill ratings start at zero. Calculate Health and Willpower from the current Attribute ratings.

| Rule | Starting values | Core reference |
| --- | --- | --- |
| Attributes | At ratings 4, 3, 2, and 1, assign 1, 3, 4, and 1 Attributes respectively. | p. 136, pp. 155–157 |
| Health and Willpower | Health is Stamina + 3. Willpower is Composure + Resolve. | p. 136, pp. 155–157 |
| Jack of All Trades | One Skill at 3, eight at 2, ten at 1. | p. 136 |
| Balanced | Three Skills at 3, five at 2, seven at 1. | p. 136 |
| Specialist | One Skill at 4, three at 3, three at 2, three at 1. | p. 136 |
| Base Specialties | One freely assigned Specialty on a rated Skill. Each rated Academics, Craft, Performance, or Science also gets a Specialty when its first dot is assigned. | pp. 136, 145, 159–171 |
| Specialty limit | Most Skills allow up to one Specialty per dot. Craft can have more Specialties than dots. | pp. 159–160 |

## Core clan and Predator Type catalog

The [catalog](../src/catalog/clan-path.ts) covers Brujah, Gangrel, Malkavian, Nosferatu, Toreador, Tremere, and Ventrue, with the three clan Disciplines, Bane, and Compulsion for each. Use Core pp. 65–103 and 210–211 for clan data. The catalog includes Core powers through level four, the highest Discipline rank reachable with the starting allocation and 35 ancilla XP. Use Core pp. 244–274 for powers and Amalgams. Fortitude’s Resilience adds the current Fortitude rating to Health (Core p. 258). A character with Blood Sorcery may choose one free level-one Ritual (Core pp. 272, 276–277).

The ten Predator Types are Alleycat, Bagger, Blood Leech, Cleaver, Consensualist, Farmer, Osiris, Sandman, Scene Queen, and Siren. Their grants sit outside the base Advantage, Flaw, and Skill budgets. If a Predator Type grants a Specialty for an unrated Skill, it gives a dot in that Skill. Core pp. 136, 149, 175–178.

| Choice | Starting rule | Core reference |
| --- | --- | --- |
| Bagger and Farmer | Ventrue cannot select either. Farmer also requires Blood Potency below 3. | pp. 176–177 |
| Bagger and Osiris | Only Tremere may take their Blood Sorcery dot in the named Core catalog. | pp. 176–177 |
| Blood Leech | Lose one Humanity, gain one Blood Potency, take Prey Exclusion (Mortals), and choose Diablerist or Shunned. | p. 176 |
| Osiris | Split three dots between Fame and Herd, and two between Enemy and the named Mythic Flaws. | pp. 177, 182, 184–185 |
| Scene Queen | Choose Disliked outside the scene or Prey Exclusion for another scene. | p. 178 |
| Nosferatu | The Bane supplies Repulsive outside the base Flaw budget. The sheet flags the Siren’s Beautiful grant for Storyteller review and excludes it from the total. | pp. 85, 178–179 |

Manual options record a source or table note. The evaluator applies the supported starting dot and grant structure and exposes the entry for Storyteller review. The clan picker includes Caitiff alongside the named clans. Each works with the fledgling, neonate, and ancilla profiles. The Predator catalog is available to neonates and ancillae. Choose the Fledgling profile for the separate Thin-blood path.

## Hand-checked fixture

Mara Vale is a Brujah neonate and former theater carpenter. The chronicle, *Last Call at the Lyric*, places her Embrace in 1998. The table’s Tenet is to protect people who depend on you. Mara’s sire is Inez Varga. Her Ambition is to secure a permanent home for the theater company and her Desire is to find a missing stagehand tonight. Her Conviction is to keep her word. Her Touchstone is Jo Reyes, the living stage manager who kept the company together. Core pp. 136–137, 139–146, 172–174 cover the concept, relationship, and beliefs fields. Names and narrative choices are original fixture inputs.

### Base allocation

| Category | Assigned ratings |
| --- | --- |
| Physical | Strength 4, Dexterity 2, Stamina 3 |
| Social | Charisma 3, Manipulation 2, Composure 2 |
| Mental | Intelligence 1, Wits 2, Resolve 3 |

| Balanced Skill rating | Assigned Skills |
| --- | --- |
| 3 | Athletics, Brawl, Streetwise |
| 2 | Awareness, Insight, Intimidation, Larceny, Persuasion |
| 1 | Craft, Drive, Etiquette, Investigation, Melee, Subterfuge, Technology |
| 0 | All remaining Skills, including Stealth |

The Attribute allocation fills all nine slots. The Balanced allocation fills all 15 rated Skill slots. Mara takes **Craft (Carpentry)** from Craft’s first dot and **Athletics (Climbing)** as the freely assigned Specialty. The other three Skills that grant a Specialty at their first dot are unrated. The resulting **Health is 6** and **Willpower is 5**. Core pp. 136, 145, 155–160.

### Clan, Predator Type, and Advantages

| Stage | Choices and expected result | Core reference |
| --- | --- | --- |
| Neonate defaults | Choose 13th Generation from the 12th- or 13th-Generation starting options. Blood Potency starts at 1, Humanity at 7, and starting XP at 15. | pp. 137, 140, 149–151 |
| Brujah | Clan Disciplines are Celerity, Potence, and Presence. For the two starting Disciplines, put 2 dots into Presence and 1 into Potence. Choose Awe and Daunt for Presence and Lethal Body for Potence. The Brujah Bane is Violent Temper and its Compulsion is Rebellion. | pp. 65–67, 136, 210, 244, 264, 267 |
| Alleycat | Choose Brawl (Grappling) and a Potence dot. Add Prowess for the new dot, giving Potence 2 with two distinct powers. Gain 3 dots of criminal Contacts and reduce Humanity by 1. | pp. 136, 175–176, 185–186, 244, 264 |
| Base Advantages | Buy Beautiful 2, Haven 1, Mask 2, and Resources 2. This spends all 7 base Advantage dots. The Alleycat Contacts appear as a 3-dot grant on top of that budget. | pp. 136, 179, 185–188, 192–193 |
| Base Flaws | Take Stake Bait for the 2-dot Flaw requirement. Alleycat supplies no Flaw dots. | pp. 136, 175, 182 |

Presence provides a check on power eligibility. The second dot can take a distinct lower-level power, so Awe and Daunt are both valid at Presence 2. Verify the chosen power against its Discipline rating at acquisition. Core pp. 244, 267.

Alleycat can grant Brawl (Grappling) or Intimidation (Stickups). If the selected Skill has zero base dots, grant one dot in the Skill in place of the Specialty. Keep it outside the starting distribution. On a rated Skill the granted Specialty counts toward the Skill’s Specialty limit. Core pp. 149, 159, 175–176.

Spark of Rage requires both Potence 3 and Presence 3. Selecting both Lingering Kiss and Unbondable leaves the conflicting purchase or base Advantage inactive until resolved. Core pp. 181, 244, 265, 267 and Companion p. 62.

### Ordered starting XP

The starting XP editor supports Attribute dots, Skill dots, Specialties, Discipline dots with a power, and the listed Advantages. Each Attribute or clan Discipline dot costs five times the new rating. For a named clan, an out-of-clan Discipline already granted by the Predator Type costs seven times the new rating. For Caitiff, every Discipline dot costs six times the new rating. A Skill dot costs three times the new rating, a Specialty costs 3 XP, and an Advantage costs 3 XP per dot added. Increasing Blood Potency costs ten times the new rating, above the neonate’s 15 XP budget. Core pp. 130, 137, 214, 244.

| Purchase | New rating | XP cost | XP remaining |
| --- | ---: | ---: | ---: |
| Stealth 0 → 1 | 1 | 3 | 12 |
| Stealth 1 → 2 | 2 | 6 | 6 |
| Drive 1 → 2 | 2 | 6 | 0 |

The finished sheet shows Stealth 2 and Drive 2. The base allocation stays Balanced with Stealth 0 and Drive 1. Track the XP increases separately from the base Skill dots so the same fixture can verify both stages. The final sheet has Health 6, Willpower 5, Humanity 6, Blood Potency 1, Bane Severity 2, 10 total Advantage dots, 2 Flaw dots, and 0 XP left.

The [ledger test](../tests/trait-ledger.test.ts) exercises the base allocation and its two Specialties. The [clan path test](../tests/clan-path.test.ts) verifies the third Specialty, Potence increase, Contacts, and Humanity adjustment. The [starting XP test](../tests/starting-xp.test.ts) verifies the final budgets, generation, Blood Potency, and purchases, including what happens when purchases are reordered. The [guide test](../tests/character-guide.test.ts) checks that the shared review and print model contains Mara’s narrative, final ratings, powers, and applied purchases.

The [catalog tests](../tests/core-catalog.test.ts) cover every named clan and Predator Type, including a complete Tremere Bagger path, out-of-clan XP, grant budgets, and Storyteller review entries.

## Mara Vale advancement fixture

The journal uses the XP costs on Core p. 137 and starts from Mara’s finished sheet with 15 starting XP spent. It covers Attribute and Skill dots, Specialties, existing catalog Advantages and Discipline powers, and Blood Potency within the supported Generation caps. A new out-of-clan Discipline needs player confirmation of the learning requirements (Core pp. 107, 231, 244). A Thin-blood can raise their permanent Discipline Affinity at the out-of-clan rate (Core p. 183). Ritual and Alchemy formula purchases, feeding-based temporary powers, and powers beyond the existing catalog are outside this journal’s coverage.

Record awards of 20, 25, and 10 XP for 55 earned XP. Begin with Presence 2, Potence 2, Stamina 3, and Stealth 2, including starting purchases and grants.

| Advancement purchase | Cost | XP left |
| --- | ---: | ---: |
| Presence 3 with Dread Gaze | 15 | 40 |
| Potence 3 with Spark of Rage | 15 | 25 |
| Stamina 4 | 20 | 5 |
| Stealth Specialty, Catwalks | 3 | 2 |

Spark of Rage requires Presence 3 when purchased (Core pp. 244, 265, 267). Move it above Dread Gaze and it stops applying, leaving Potence 2 and 17 XP. Remove Dread Gaze entirely and 32 XP remain. Restore the order and remove the 25 XP award to fund only the two Discipline purchases. Restoring the award brings Health back to 7 and leaves 2 XP. Starting XP stays at 15 spent and 0 remaining throughout.

The [fixture](../tests/fixtures/mara-vale-advancement.ts) and [journal tests](../tests/advancement.test.ts) verify those totals, paused creation choices, backup restore, reload, link scope, and Specialty privacy in the brief. Blood Potency advances at ten times the new rating with the Generation cap from Core p. 214 and the [corrected Blood Potency table](https://renegadegamestudios.com/content/File%20Storage%20for%20site/VTM/BloodPotencyTable.pdf).

## Rowan Pike fledgling fixture

For the newly Embraced standard-clan path, Core pp. 137 and 140 give 12th or 13th Generation, Blood Potency 1, and 0 starting XP. Use Humanity 7, the base 7 Advantage and 2 Flaw dots, and the usual clan Discipline allocation (Core pp. 136–137). Core pp. 149 and 175 describe leaving Predator Type for play for many fledglings. This path uses that option, so no Predator grants or Humanity adjustments apply. Blood Potency 1 gives two Blood Surge dice and Bane Severity 2 under the correction to Core p. 216.

Rowan Pike is a Gangrel night courier in *Last Stop at the River*, Embraced in 2024. Rowan’s Ambition is to keep a safe route through the city and Desire is to deliver the lost letter before dawn. Rowan’s sire is Lena Moss. The Chronicle Tenet is to protect those who shelter you. The Conviction “Never abandon a companion” is tied to Taylor Reed, a living courier.

| Category | Choices and expected results |
| --- | --- |
| Attributes | Strength 2, Dexterity 3, Stamina 3, Charisma 2, Manipulation 1, Composure 3, Intelligence 2, Wits 4, Resolve 2. |
| Balanced Skills | 3 in Athletics, Awareness, and Survival. 2 in Animal Ken, Brawl, Insight, Stealth, and Streetwise. 1 in Craft, Drive, Etiquette, Investigation, Medicine, Melee, and Persuasion. All others start at 0. |
| Specialties | Craft (Saddlery) from Craft’s first dot and Survival (Urban trails) as the free Specialty. |
| Clan | Fortitude 2 with Resilience and Toughness, plus Protean 1 with Eyes of the Beast. The Gangrel Bane is Bestial Features and its Compulsion is Feral Impulses (Core pp. 69–71, 210, 244, 258, 270). |
| Advantages and Flaws | Haven 2 + Mask 2 + Resources 3 = 7 Advantage dots. Stake Bait supplies 2 Flaw dots (Core pp. 136, 182, 186–188, 192–193). |
| Final tracks | 12th Generation, Health 8 (Stamina 3 + 3 + Fortitude 2 from Resilience), Willpower 5 (Composure 3 + Resolve 2), Humanity 7, Blood Potency 1, Bane Severity 2, two Blood Surge dice, and 0 XP spent or remaining. |

The [fixture](../tests/fixtures/rowan-pike.ts) and [creation profile tests](../tests/creation-profiles.test.ts) verify the evaluated sheet, inactive Predator Type and XP choices, and fledgling and neonate transfers. The browser walkthrough matched the calculation through review, a one-page US Letter print, reload, backup restore, and the read-only mechanical link.

## Silas Ward ancilla fixture

Core pp. 136–137, 140, and 149 give a standard-clan ancilla 10th or 11th Generation, Blood Potency 2, and 35 starting XP. Add two dots to each base budget for 9 Advantage and 4 Flaw dots, then apply Predator grants separately. Subtract 1 from the usual starting Humanity of 7, then apply the Predator modifier. Blood Leech brings Blood Potency to 3 and Humanity to 5 (Core p. 176). Farmer can start at Blood Potency 2, and selecting it blocks an XP purchase that would increase Blood Potency to 3 (Core p. 177). Core p. 214 sets the ancilla Generation cap at Blood Potency 4. The XP cost to reach 4 from 3 is 40, above the starting budget.

Silas Ward is an 11th-Generation Toreador night archivist in *The Uncatalogued City*, Embraced in 1912. His Ambition is to preserve the city’s missing histories and his Desire is to return the missing ledger to its curator. Helen Finch is his sire. The Chronicle Tenet is to give back what was entrusted to you. His Conviction “Preserve the truth” is tied to Imani Cole, a living book conservator.

| Category | Choices and expected results |
| --- | --- |
| Attributes | Strength 1, Dexterity 3, Stamina 2, Charisma 3, Manipulation 2, Composure 3, Intelligence 4, Wits 2, Resolve 2. |
| Balanced Skills | 3 in Academics, Investigation, and Stealth. 2 in Awareness, Etiquette, Insight, Occult, and Persuasion. 1 in Athletics, Craft, Drive, Larceny, Medicine, Politics, and Streetwise. All others start at 0. |
| Base Specialties | Academics (Local history), Craft (Bookbinding), and Investigation (Provenance) as the free Specialty. |
| Clan | Celerity 2 with Cat’s Grace and Fleetness, and Auspex 1 with Heightened Senses (Core pp. 87–91, 249, 252–253). |
| Sandman | Stealth (Break-in), Auspex 2 with Premonition, and 1 Resources dot (Core pp. 177, 249). |
| Base Advantages and Flaws | Unbondable 5 + Mask 2 + Resources 2 = 9 Advantage dots. Stake Bait 2 + Ugly 1 + No Haven 1 = 4 Flaw dots. Sandman brings Resources to 3 and total Advantages to 10 (Core pp. 177, 179, 181–182, 188, 192–193). |
| Final tracks | Health 5 (Stamina 2 + 3), Willpower 5 (Composure 3 + Resolve 2), Humanity 6, Blood Potency 2, Bane Severity 2, and two Blood Surge dice. |

| XP purchase | Cost | XP left |
| --- | ---: | ---: |
| Auspex 2 → 3, Scry the Soul (Core p. 249) | 15 | 20 |
| Auspex 3 → 4, Spirit’s Touch (Core p. 250) | 20 | 0 |

Moving Auspex 4 to the top of the journal skips that purchase as ineligible, then applies Auspex 3. Returning the purchases to their original order spends all 35 XP and restores Auspex 4. Under Neonate, Silas’s 11th Generation becomes inactive, both dot budgets are two over, and only the 15 XP purchase applies. Switching back to Ancilla restores the original result when those saved choices are still present.

The [fixture](../tests/fixtures/silas-ward.ts) and [ancilla tests](../tests/ancilla-creation.test.ts) cover the totals, XP replay and power prerequisites, profile switches, and transfers. Browser verification built Silas from Concept through **Review & Print**, reordered the journal, reloaded after switching to Neonate, paused grants and purchases under Fledgling, returned to Ancilla, and opened the read-only link.

## Nessa Reed Caitiff fixture

| Rule | Starting behavior | Core reference |
| --- | --- | --- |
| Free Discipline dots | Choose any two distinct Core Disciplines. Put two dots in one and one dot in the other. Choose one eligible power per dot. | pp. 136, 148, 244 |
| Discipline XP | Pay six times the new rating for every Discipline, including any grant from a Predator Type. For the first purchased dot in a new Discipline, confirm that the character has tasted a wielder’s blood and meets the normal learning requirements. | pp. 107, 137, 244 |
| Clan traits | Caitiff have no shared clan Bane or Compulsion. Suspect gives one Flaw dot outside the age profile’s base Flaw budget. A Storyteller may apply a one- or two-die Social test penalty with Kindred who know the character is Caitiff. | pp. 107, 210–211, 194 |
| Positive Status | Caitiff cannot purchase positive Status at creation. The guide excludes manual advantages and Predator grants labeled Status. | pp. 107, 194 |
| Predator eligibility | Apply the chosen age profile’s rules. Caitiff may choose Bagger or Osiris for their other eligible Discipline. Their Blood Sorcery grants are reserved for Tremere. Caitiff can still select Blood Sorcery among the two free starting Disciplines. | pp. 148–149, 175–177 |

Nessa Reed is a 13th-Generation Caitiff neonate and night-shift locksmith in *Keys to the Floodgate*, Embraced in 2006. Her Ambition is to keep a refuge open to the clanless and her Desire is to find the owner of the brass key. Her Chronicle Tenet is to leave a way out for those in danger. Her Conviction “Keep your doors open to the desperate” is tied to Mae Bell, a living shelter coordinator.

| Category | Choices and expected results |
| --- | --- |
| Attributes | Strength 2, Dexterity 2, Stamina 3, Charisma 3, Manipulation 2, Composure 2, Intelligence 1, Wits 4, Resolve 3. |
| Balanced Skills | 3 in Awareness, Stealth, and Streetwise. 2 in Athletics, Insight, Larceny, Persuasion, and Subterfuge. 1 in Animal Ken, Brawl, Etiquette, Investigation, Medicine, Occult, and Survival. All others start at 0. |
| Free Discipline dots | Fortitude 2 with Resilience and Toughness, and Presence 1 with Awe (Core pp. 258, 267). |
| Specialties and Predator grant | Larceny (Safecracking) is the free Specialty. Bagger grants Streetwise (Black Market), Obfuscate 1 with Cloak of Shadows, Iron Gullet 3, and Enemy 2 (Core pp. 176, 261). |
| Base Advantages and Flaws | Haven 2 + Mask 2 + Resources 3 = 7 Advantage dots. Stake Bait fills the 2-dot base Flaw budget. Adding Bagger and Suspect yields 10 total Advantage and 5 total Flaw dots. |
| Final tracks | Health 8 (Stamina 3 + 3 + Fortitude 2 from Resilience), Willpower 5 (Composure 2 + Resolve 3), Humanity 7, Blood Potency 1, Bane Severity 2, and two Blood Surge dice. |

| XP purchase | Cost | XP left |
| --- | ---: | ---: |
| Presence 1 → 2, Lingering Kiss (Core p. 267) | 12 | 3 |
| Drive 0 → 1 | 3 | 0 |

The [fixture](../tests/fixtures/nessa-reed.ts) and [Caitiff tests](../tests/caitiff-creation.test.ts) verify the totals, Discipline eligibility and XP costs, Status restriction, and transfers. In the browser, Nessa’s review matched the one-page US Letter print and a restored copy of the downloaded JSON. The restored copy retained the completed sheet after reload.

## Iris Calder Thin-blood fixture

| Rule | Starting behavior | Core reference |
| --- | --- | --- |
| Age and Generation | Use Fledgling and choose 14th, 15th, or 16th Generation. Start with Humanity 7, Blood Potency 0, 0 XP, and no Predator Type. The corrected Blood Potency table gives one Blood Surge die and Bane Severity 0. | pp. 136–140, 148–149, 214, 216 |
| Separate budgets | Take one to three Thin-blood Merits and the same number of Thin-blood Flaws. These have no dot value. Separately choose 7 regular Advantage and 2 Flaw dots. Core creation excludes personal Bonding, Mawla, Retainers, and Status. Anarch Comrades and Camarilla Contact remain available as Thin-blood Merits. | pp. 136, 148–149, 182–184 |
| Incompatible picks | Lifelike conflicts with Dead Flesh, Vampiric Resilience conflicts with Mortal Frailty, and Anarch Comrades conflicts with Shunned by the Anarchs. Branded by the Camarilla can coexist with Camarilla Contact. | pp. 182–184 |
| Clan Curse | Choose a clan Bane at severity 1. Brujah and Gangrel require Bestial Temper. Tremere requires Catenating Blood. A Nosferatu curse carries the Nosferatu Bane’s Looks restrictions. Clan Curse grants no clan Compulsion. | pp. 85, 183, 208 |
| Discipline Affinity | Choose a Core Discipline with one dot and one level-one power. Match any permanent Blood Sorcery dot with the same optional starting level-one Ritual available to other characters with that dot. The sheet omits temporary Disciplines gained through feeding in play. | pp. 111, 184, 244, 272 |
| Thin-blood Alchemist | Gain Thin-blood Alchemy 1. Choose Athanor Corporis, Calcinatio, or Fixatio, and one level-one formula, Far Reach or Haze. Profane Hieros Gamos is level three under the incorporated 2019 errata. The starting path covers the first method and formula. | pp. 184, 282–287 |

Iris Calder is a 15th-Generation Thin-blood fledgling and night bicycle mechanic in *The Last Ferry*, Embraced in 2025. Iris’s Ambition is to keep a safe workshop for the duskborn. Their Desire is to find the missing courier before sunrise. The Chronicle Tenet is to leave a light on for those coming home. The Conviction “Never strand a fellow traveler” is tied to Avery Chen, a living ferry dispatcher.

| Category | Choices and expected results |
| --- | --- |
| Attributes | Strength 2, Dexterity 4, Stamina 3, Charisma 2, Manipulation 1, Composure 3, Intelligence 3, Wits 2, Resolve 2. |
| Balanced Skills | 3 in Craft, Drive, and Streetwise. 2 in Awareness, Brawl, Investigation, Science, and Stealth. 1 in Athletics, Insight, Larceny, Medicine, Persuasion, Survival, and Technology. All others start at 0. |
| Specialties | Craft (Bicycle repair), Science (Materials), and Stealth (Back lanes) as the free Specialty. |
| Thin-blood Merits | Discipline Affinity grants Fortitude 1 with Resilience. Thin-blood Alchemist grants Thin-blood Alchemy 1 with Fixatio and Haze. |
| Thin-blood Flaws | Bestial Temper and Clan Curse (Brujah). Bestial Temper qualifies Iris for Violent Temper at Bane Severity 1. |
| Base Advantages and Flaws | Haven 2 + Mask 2 + Resources 3 = 7 Advantage dots. Stake Bait fills the 2-dot base Flaw budget. |
| Final tracks | Health 7 (Stamina 3 + 3 + Fortitude 1 from Resilience), Willpower 5 (Composure 3 + Resolve 2), Humanity 7, Blood Potency 0, one Blood Surge die, and 0 XP spent or remaining. |

The [fixture](../tests/fixtures/iris-calder.ts) and [Thin-blood tests](../tests/thin-blood-creation.test.ts) cover the hand calculations, incompatible selections, preserved draft inputs, and transfers. The browser walkthrough confirmed the unsupported-age warning and incompatible Lifelike and Dead Flesh pair, the completed review, a one-page US Letter print, a separate JSON backup restore and reload, and the read-only build link.

## Player’s Guide source pack

The initial pack covers the entries below. It uses the Core age profiles, dot budgets, and XP rules. Other Player’s Guide clans, Predator Types, Bane variants, Discipline powers, Oblivion and its Ceremonies, and supplemental Thin-blood options remain outside this catalog.

| Option | Creation choices and effects | Player’s Guide reference |
| --- | --- | --- |
| Ministry | Obfuscate, Presence, and Protean are clan Disciplines. The Bane is Abhors the Light and the Compulsion is Transgression. | pp. 35–36 |
| Extortionist | Choose Intimidation (Coercion) or Larceny (Security), and a dot of Dominate or Potence. Split three dots between Contacts and Resources. Choose the police or an escaped victim as a two-dot Enemy. | p. 107 |
| Montero | Choose Leadership (Hunting Pack) or Stealth (Stakeout), and a dot of Dominate or Obfuscate. Add Retainers 2 and reduce Humanity by one. | p. 108 |
| Pursuer | Choose Investigation (Profiling) or Stealth (Shadowing), and a dot of Animalism or Auspex. Add Bloodhound 1 and Contacts 1, and reduce Humanity by one. | pp. 108–109 |
| Chimerstry | Obfuscate level 2 with Presence 1 as its Amalgam prerequisite. | p. 76 |
| Fata Morgana | Obfuscate level 3 with Presence 2 as its Amalgam prerequisite. | p. 77 |

The same age and grant restrictions apply to the additional Predator Types. Predator grants sit outside the base dot budgets. An Extortionist Resources grant contributes to the total Resources rating and its cap.

## Elias Voss mixed-source fixture

Elias Voss is a 13th-Generation Ministry neonate and night market broker in *The Closing Bell*, Embraced in 2001. His Ambition is to keep the market in local hands and his Desire is to return a borrowed key before dawn. The Chronicle Tenet is to keep bargains made in good faith. The Conviction “Keep the market open to outsiders” is tied to Tess Lark, a living stallholder.

| Category | Choices and expected results |
| --- | --- |
| Attributes | Strength 2, Dexterity 3, Stamina 3, Charisma 4, Manipulation 2, Composure 3, Intelligence 1, Wits 2, Resolve 2. |
| Balanced Skills | 3 in Larceny, Persuasion, and Stealth. 2 in Awareness, Insight, Intimidation, Streetwise, and Subterfuge. 1 in Athletics, Brawl, Drive, Etiquette, Investigation, Medicine, and Occult. All others start at 0. |
| Clan | Obfuscate 2 with Core Cloak of Shadows and Player’s Guide Chimerstry. Presence 1 with Core Awe meets the Amalgam prerequisite. |
| Predator Type | Extortionist grants Larceny (Security), Potence 1 with Core Lethal Body, Contacts 2, Resources 1, and Enemy (Escaped victim) 2. The free Specialty is Persuasion (Negotiation). |
| Advantages and Flaws | Base Haven 2 + Mask 2 + Resources 3 = 7 Advantage dots. Stake Bait supplies 2 base Flaw dots. Grants bring Resources to 4, and the sheet to 10 Advantage and 4 Flaw dots. |
| Starting XP | Buy Obfuscate 3 with Core Mask of a Thousand Faces for 15 XP, leaving 0. |
| Final tracks | Health 6 (Stamina 3 + 3), Willpower 5 (Composure 3 + Resolve 2), Humanity 7, Blood Potency 1, Bane Severity 2, and two Blood Surge dice. |

The [fixture](../tests/fixtures/elias-voss.ts) and [Player’s Guide tests](../tests/players-guide.test.ts) check the calculations, Amalgam prerequisites, grant choices, and the Core-only result. Browser checks covered opt-in, a complete review, JSON restore and reload, and a read-only build link. Both previews flagged the disabled selections and named an unknown source pack.
