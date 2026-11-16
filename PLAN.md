# Vampire: The Masquerade Character Creator Plan

Build a guided Vampire: The Masquerade Fifth Edition (V5) creator that takes a player from character concept to a rules-checked starting sheet they can print or send to their Storyteller. Use Vite, React, TypeScript, Tailwind CSS, and shadcn/ui. Ship a static app with browser-local drafts and portable files. Store the rules edition in every draft and export. V5 is the proposed first edition. White Wolf’s V6 FAQ describes an alpha with materially different rules. [White Wolf’s V6 FAQ](https://www.paradoxinteractive.com/games/world-of-darkness/news/vtm-sixth-edition-faq) · [shadcn/ui Vite setup](https://ui.shadcn.com/docs/installation/vite)

The first release is live with the Core Rulebook guide for standard clan neonates. See [Getting started](docs/getting-started.md) for the walkthrough and [First-release verification](docs/release-verification.md) for the desktop, mobile, print, and live notice checks.

## What to take from the reference projects

| Reference | Apply here |
| --- | --- |
| `pf2e-point-buy-calc` | Put pure rules functions behind a live ledger. Show how each total was reached, what slots are left, and where each grant came from. Use the same calculation for editing, review, and print. |
| `dnd-point-buy-calc` | Make dependent choices visible where they matter. As with species and background grants, explain what a clan or Predator Type supplies and what the player still needs to pick. Version and validate portable builds. |
| `masque-of-shattered-mirrors` | Follow its concept → build → review structure, searchable option pickers, named drafts, and read-only preview before import. Give players a Storyteller handoff they can review before they share it. |

## First release

Start with a general-purpose Core Rulebook creator for standard clan neonates. Give players and Storytellers an end-to-end workflow for one vampire at a time. The first catalog covers the seven named core clans, core Predator Types and their eligibility, and the choices needed to finish builds in that scope. Offer a manual entry with a source or note for additional options that the supported rules can represent. Flag those entries for Storyteller review. [Renegade’s V5 Core Rulebook](https://renegadegamestudios.com/vampire-the-masquerade-5th-edition-roleplaying-game-core-rulebook/)

| Step | What the player does and sees |
| --- | --- |
| **Concept** | Record a concept, name, Ambition, and Desire. Set the chronicle name and any Storyteller guidance. Keep narrative fields easy to revisit. |
| **Clan and Predator Type** | Compare clans by Disciplines, Bane, and Compulsion. Allocate clan Disciplines and powers, then choose an eligible Predator Type. Preview its grants before allocating Attributes and Skills. |
| **Attributes and Skills** | Assign the V5 Attribute distribution, select a Skill distribution, and allocate its dots and Specialties. Display the remaining slots, live Health and Willpower totals, and how the Predator Type affects the selected Skill. |
| **Advantages and Flaws** | Browse Backgrounds, Merits, and Flaws. Track the starting budgets and show Predator Type grants with their source. Review prerequisites and restrictions on individual purchases. |
| **Humanity and relationships** | Record Convictions and their Touchstones, plus relevant connections such as the sire or coterie. Show Chronicle Tenets as shared table context. Keep these fields editable throughout the guide. |
| **Starting XP and review** | Apply the neonate starting XP rules. Show each purchase and the balance. Review Generation, Blood Potency, Humanity, the complete sheet, and outstanding choices. Jump to the affected field and produce a print sheet, a backup, or a Storyteller handoff. |

Keep a compact summary beside the editor on desktop and behind a clearly labeled control on mobile. Use shadcn/ui cards for steps, labeled searchable pickers for catalogs, and alerts with links to affected fields for review issues. Give dot controls visible numbers and keyboard support. Use charcoal surfaces, warm off-white type, and restrained oxblood accents. The print layout uses a light background and works in grayscale.

## Rules and data

Keep the engine in `src/rules/` and source-tagged catalogs in `src/catalog/`. Give each option a stable ID and a book and page reference. Use one TypeScript reducer for character edits and derive the current sheet and validation from the draft inputs. Keep the V5 formulas and prerequisites independent of React components.

Represent base allocations, grants, and XP purchases explicitly. Each ledger entry identifies its origin and each validation issue points to the affected step or choice. Treat a missing required choice as incomplete, an illegal allocation as a rules error, and a manual or table-dependent entry as a Storyteller review item. When a player changes clan, Skill distribution, or Predator Type, preserve affected choices for review, exclude the ineligible ones from totals, and explain how to resolve them. The completion indicator, preview, and print view all use the same evaluated sheet.

Use the [pinned V5 sources, errata, and hand-checked fixtures](docs/v5-rules.md) when entering rule data. Verify additional dot allocations, Specialty eligibility and grants, Discipline power levels and Amalgam prerequisites, Predator Type exceptions, generation and age defaults, starting budgets, and XP costs against those sources as coverage expands. Test order-sensitive XP purchases and Blood Potency limits.

## Drafts, sharing, and print

- **Browser drafts.** The guide autosaves named drafts and their last steps. Each draft has a stable ID. The guide reports save status and keeps the current draft downloadable if browser storage fails.
- **Full backup.** Download a versioned JSON file at any stage with `format`, `schemaVersion`, `ruleset`, and the draft inputs. The guide validates the file and previews its character and saved step before it can restore a new draft. An invalid or unsupported file leaves saved drafts intact.
- **Build link.** The guide generates a read-only preview from allowlisted mechanical fields and catalog IDs. Character names, notes, user-entered text, and relationships stay in the draft. The preview lists omitted choices to re-enter and lets the recipient save a copy as a new draft.
- **Storyteller handoff and print.** The guide previews and downloads a Markdown brief with the mechanical build and open rulings. Narrative sections, custom labels, and Storyteller notes are opt-in. Treat shared links and files as readable by their recipients. Print the sheet from the same review model and include a draft marker when required choices are outstanding.

Keep the public app free and noncommercial under the Dark Pack terms. Use original summaries, book and page citations, and links to official resources. Include the required Dark Pack logo, rights notice, and unofficial designation before public release. [Dark Pack Agreement](https://www.paradoxinteractive.com/games/world-of-darkness/community/dark-pack-agreement) · [Official V5 character sheet and resources](https://renegadegamestudios.com/vampire)

## Implementation order

| Milestone | Deliverable and exit check |
| --- | --- |
| **1. First playable build** | Scaffold Vite, React, TypeScript, Tailwind, and shadcn/ui. Build the evaluator and responsive guide. Take one core clan and one eligible Predator Type through every step, including starting XP. Verify the summary and printout against a hand-checked fixture. |
| **2. Core catalog** | Add the remaining core clans, eligible Predator Types, and the options needed to complete each build. Add searchable pickers, source references, and manual entries. Exercise alternate Skill distributions, Predator grants, invalidated choices, power prerequisites, and XP purchase order. |
| **3. Drafts and sharing** | Add named drafts, autosave, JSON backup and restore, build link preview, and the Storyteller handoff. Verify incomplete and complete draft round-trips, rejected imports, and exclusion of narrative text from share links. |
| **4. Release checks** | Run rules and persistence tests, TypeScript checks, and a production build. Rehearse creation → reload → export → import → print at desktop and mobile widths, including a keyboard-only pass. Ask a player and Storyteller to review a sample handoff. |

## After the first release

1. Extend standard-clan creation by age profile. The fledgling and ancilla paths are implemented and verified against [Rowan Pike](docs/v5-rules.md#rowan-pike-fledgling-fixture) and [Silas Ward](docs/v5-rules.md#silas-ward-ancilla-fixture). First-release neonate drafts, backups, and build links still resolve as neonates.
2. Model age and clan or blood status independently. Caitiff and Thin-blood creation are implemented and verified against [Nessa Reed](docs/v5-rules.md#nessa-reed-caitiff-fixture) and [Iris Calder](docs/v5-rules.md#iris-calder-thin-blood-fixture).
3. The opt-in Player’s Guide pack is implemented with the Ministry, Extortionist, Montero, Pursuer, Chimerstry, and Fata Morgana. [Elias Voss](docs/v5-rules.md#elias-voss-mixed-source-fixture) verifies the mixed-source path. Core remains the default. [Renegade’s V5 Player’s Guide](https://renegadegamestudios.com/pdf-vampire-the-masquerade-roleplaying-game-5th-edition-players-guide/)
4. The XP advancement journal is implemented. It replays earned-XP purchases from the completed creation build and keeps the starting budget separate. [Mara Vale’s advancement fixture](docs/v5-rules.md#mara-vale-advancement-fixture) verifies the ordering, derived ratings, and transfers.
5. [Chronicle presets](docs/getting-started.md#reuse-chronicle-settings) reuse the chronicle name, Tenets, and enabled rule sources across drafts in one browser. Players preview the field changes before applying a preset. The applied values travel with the character’s JSON backup.
6. The searchable [V5 table reference](docs/getting-started.md#look-up-v5-rules) covers creation budgets, XP costs, Discipline prerequisites, and derived tracks with book and page references. Players can open it from any creation step and return to the same draft.
7. The [Character Relationship Map](docs/getting-started.md#map-a-characters-relationships) starts with the recorded sire, coterie, and Touchstones. Players can add people and labeled connections. The map travels with the full draft backup.
8. The [Coterie and Domain planner](docs/getting-started.md#plan-a-coterie-and-domain) organizes several characters in a named browser plan. Players can preview and transfer the shared purpose, Domain ratings, member names, and selected relationship details as JSON. Restoring a plan creates a separate copy and leaves individual character drafts intact.
9. The [local handoff review prototype](docs/storyteller-workspace.md#prototype-walkthrough) demonstrates submission, review, replacement, export, and withdrawal with one fictional Storyteller and two players.

## Next priorities

1. **Jump from an open choice to its editor.** Review & Print currently links to the start of each step. Let players go straight to the field or group that needs attention, with focus in the right place for keyboard use. Verify that fixing the choice updates both review and the printed Draft marker.
2. **Make open rulings visible in the Storyteller brief preview.** The internal walkthrough found that a Storyteller has to scroll past the mechanics to find unresolved choices on mobile. Show the rulings alongside the preview and check them against the Markdown download with narrative options off and on. [Internal handoff walkthrough](docs/release-verification.md#internal-walkthrough)
3. **Guide players to the right JSON restore control.** When a valid character backup or coterie plan is opened in the other tool, name the matching restore control. Verify both directions and confirm that choosing a wrong or malformed file leaves the open draft and plan intact. [Internal handoff walkthrough](docs/release-verification.md#internal-walkthrough)

### Deferred external handoff feedback

The fictional sample brief, coterie plan, and walkthroughs are ready. Internal verification checked what is shared, plan restore, and reopening the same draft and step. Resume with the [handoff review record](docs/release-verification.md#player-and-storyteller-handoff-review) to capture player and Storyteller observations and rank follow-up fixes.

### Deferred hosted pilot

Keep using the local prototype for demonstration. Revisit a hosted inbox once player and Storyteller feedback clarifies what it would add to the current file handoffs. [Pilot decision](docs/storyteller-workspace.md#pilot-decision)

### Deferred Foundry compatibility check

Resume when a disposable Foundry V5 test world or paired vampire actor exports are available. The candidate is the World of Darkness 5e community system (`wod5e`) 5.3.29 with Foundry 14.368. Compare a sample vampire export with its re-export after import and record which fields and embedded items survive. Queue exporter implementation once the round-trip establishes a supported target and field mapping. [World of Darkness 5e package](https://foundryvtt.com/packages/wod5e/) · [Foundry actor import and export](https://foundryvtt.com/article/actors/#importing-from-json-files)

The [ordered roadmap](roadmap/roadmap.json) tracks the local improvements and deferred reviews.
