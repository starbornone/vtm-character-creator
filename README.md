# vtm-character-creator

The Vampire: The Masquerade Character Creator is a free, unofficial browser guide for making V5 characters from the seven named Core Rulebook clans or as Caitiff or Thin-blood. Create a fledgling, a neonate, or an ancilla, then review and print the character sheet. Thin-blood fledglings choose matched Merits and Flaws, with optional Alchemy or Discipline Affinity. Neonates and ancillae choose an eligible Predator Type and get 15 and 35 starting XP respectively. Core is the default rules source. Enable the optional Player’s Guide pack for the Ministry, three additional Predator Types, and two Obfuscate powers. Use manual entries for table-specific options and include their sources or notes for Storyteller review. See [the product plan](PLAN.md) for first-release scope and implementation milestones.

Name a draft to autosave the character and resume at the last step in the same browser. You can download a JSON backup at any point, then preview it and restore it as a new draft. See [Getting started](docs/getting-started.md#back-up-and-restore-a-draft).

Use [chronicle presets](docs/getting-started.md#reuse-chronicle-settings) to reuse a chronicle name, Tenets, and rule sources across drafts. Preview the changes before applying a preset.

Once creation is complete, record awards and spend earned XP in the [XP Advancement Journal](docs/getting-started.md#advance-a-finished-character). The current sheet and Storyteller brief show advancement alongside starting XP. Browser drafts and JSON backups preserve the journal.

Share a read-only build link with another player or Storyteller. The link carries creation choices and ratings while names, notes, and advancement stay in the draft. See [Share a mechanical build](docs/getting-started.md#share-a-mechanical-build).

Preview and download a Storyteller brief with the build’s mechanics, open rulings, and the narrative sections you choose. See [Export a Storyteller brief](docs/getting-started.md#export-a-storyteller-brief).

## Run locally

With Node.js 24 or later, run `npm ci` and `npm run dev` from the repository root. Open the URL printed by Vite. Run `npm run build` to type-check and build the production files.

## Documentation

- [Project overview](docs/overview.md)
- [Getting started](docs/getting-started.md)
- [First-release verification](docs/release-verification.md)
- [Agent instructions](AGENTS.md)
- [Roadmap](roadmap/roadmap.json)

## Fan content notice

![Dark Pack](public/dark-pack-logo.webp)

Unofficial World of Darkness fan project.

Portions of the materials are the copyrights and trademarks of Paradox Interactive AB, and are used with permission. All rights reserved. For more information please visit [worldofdarkness.com](https://www.worldofdarkness.com/).

[Dark Pack Agreement](https://www.paradoxinteractive.com/games/world-of-darkness/community/dark-pack-agreement)
