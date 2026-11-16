# vtm-character-creator

The Vampire: The Masquerade Character Creator is a browser guide in development for making V5 standard clan neonates. Build with the seven named Core Rulebook clans and ten Core Predator Types, then review and print the character sheet. Use manual entries for table-specific options and include their sources or notes for Storyteller review. See [the product plan](PLAN.md) for first-release scope and implementation milestones.

Name a draft to autosave the character and resume at the last step in the same browser. You can download a JSON backup at any point, then preview it and restore it as a new draft. See [Getting started](docs/getting-started.md#back-up-and-restore-a-draft).

## Run locally

With Node.js 24 or later, run `npm ci` and `npm run dev` from the repository root. Open the URL printed by Vite. Run `npm run build` to type-check and build the production files.

## Documentation

- [Project overview](docs/overview.md)
- [Getting started](docs/getting-started.md)
- [Agent instructions](AGENTS.md)
- [Roadmap](roadmap/roadmap.json)
