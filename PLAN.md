# Vampire: The Masquerade Character Creator Plan

Build a guided Vampire: The Masquerade Fifth Edition (V5) creator that takes a player from character concept to a rules-checked starting sheet they can print or send to their Storyteller. Use Vite, React, TypeScript, Tailwind CSS, and shadcn/ui. Ship a static app with browser-local drafts and portable files. Store the rules edition in every draft and export. V5 is the proposed first edition. White Wolf’s V6 FAQ describes an alpha with materially different rules. [White Wolf’s V6 FAQ](https://www.paradoxinteractive.com/games/world-of-darkness/news/vtm-sixth-edition-faq) · [shadcn/ui Vite setup](https://ui.shadcn.com/docs/installation/vite)

The core clan and Predator Type catalog is available through **Review & Print**. See [Getting started](docs/getting-started.md) for the walkthrough and the [roadmap](roadmap/roadmap.json) for the remaining milestones.

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

Use the [pinned Core Rulebook printing, errata, and hand-checked neonate fixture](docs/v5-rules.md) when entering rule data. Verify additional dot allocations, Specialty eligibility and grants, Discipline power levels and Amalgam prerequisites, Predator Type exceptions, generation and age defaults, starting budgets, and XP costs against those sources as coverage expands. Test order-sensitive XP purchases and Blood Potency limits.

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

Expand to additional V5 profiles such as fledglings, ancillae, Caitiff, and Thin-bloods through explicit rules and fixtures for each. Add Player’s Guide options as a source pack, then consider chronicle presets, a shared coterie and Domain planner, a Relationship Map, long-term XP advancement, and a table reference. Treat Foundry export and a private Storyteller workspace as separate additions with their own interchange and access requirements. [Renegade’s V5 Player’s Guide](https://renegadegamestudios.com/pdf-vampire-the-masquerade-roleplaying-game-5th-edition-players-guide/)
