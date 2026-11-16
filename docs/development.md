# Development

| Path | What is here |
| --- | --- |
| `README.md` | Human entry point and current phase. |
| `PLAN.md` | Product scope, player workflow, and implementation milestones. |
| `docs/` | Architecture, onboarding, decisions, contribution guidance, and the roadmap contract. |
| `roadmap/` | Three JSON files tracking pending, finished, and cancelled work. |
| `AGENTS.md` | Repository instructions for coding agents. |
| `index.html`, `src/main.tsx`, `src/App.tsx` | HTML entry, React bootstrap, and guide navigation. |
| `src/components/ui/`, `src/index.css`, `components.json` | shadcn/ui components, Tailwind theme, and registry configuration. |
| `src/catalog/traits.ts`, `src/rules/trait-ledger.ts` | Trait IDs and groups, in-memory draft edits, and the pure base allocation evaluator. |
| `src/catalog/clan-path.ts`, `src/rules/clan-path.ts` | Core clan and Predator Type options, sources, power slots, and derived grants. |
| `src/components/CatalogSelect.tsx` | Keyboard-accessible search and native select for source-tagged catalogs. |
| `src/catalog/starting-options.ts`, `src/rules/starting-xp.ts` | Starting Advantage and Flaw options, generation and Blood Potency, and ordered XP rules. |
| `src/rules/character-guide.ts`, `src/components/CharacterSheet.tsx` | Shared draft evaluation, review issues, and the printable sheet. |
| `src/drafts/`, `src/components/DraftControls.tsx` | Draft input validation, browser storage, recovery download, and draft controls. |
| `src/drafts/draft-backup.ts`, `src/components/BackupRestore.tsx` | Versioned backup format, file validation, and restore preview. |
| `src/sharing/build-link.ts`, `src/components/SharedBuild.tsx` | Mechanical allowlist, versioned URL fragment, and read-only recipient preview. |
| `src/sharing/storyteller-brief.ts`, `src/components/StorytellerBrief.tsx` | Markdown brief, open rulings, and narrative opt-in preview. |
| `tests/fixtures/mara-vale.ts`, `tests/` | Shared neonate fixture and rules regression tests. |

Start from a [roadmap item](../roadmap/roadmap.json) and read the relevant section of the [plan](../PLAN.md). For documentation changes, follow the relative links from the edited pages and parse the three roadmap files if any changed. Check schema values, matching project metadata, timestamps, and unique IDs across all three files. Review the diff for unrelated edits.

Install dependencies with `npm ci`. Use `npm run dev` while editing, `npm test` for the rules tests, and `npm run build` for the type check and production bundle. Use `npm run typecheck` for a standalone TypeScript check and `npm run preview` after building to serve `dist/` locally. See [Getting started](getting-started.md) for the local smoke check.

Use the [pinned V5 rules and hand-checked neonate fixture](v5-rules.md) when encoding rules or catalog prerequisites. Prioritize tests for edition-specific math, dependent grants, invalidated selections, and XP purchase order. For edits to persistence or sharing, exercise unfinished drafts, malformed input, version mismatches, and narrative text exclusion from build links. Use [Architecture](architecture.md) for the planned module boundaries and [Contributing](contributing.md) for how to update the roadmap with a change.

For sheet changes, check the complete Mara Vale fixture in **Review & Print** and the browser’s print preview. Try a draft with a missing Touchstone or other open choice. Confirm that Draft appears and the review links back to the affected step.

For catalog changes, run the [catalog tests](../tests/core-catalog.test.ts) and try a second path in the browser. Search by name and page, switch clans with a Predator Type already selected, and confirm that a manual entry’s source or note reaches **Storyteller Review**.

For draft changes, run the [browser storage tests](../tests/browser-drafts.test.ts), save two characters at different steps, and reload after switching between them. Force a write failure on the local draft key and confirm that the last save persists, the current edits appear in the download, and a retry succeeds when writes resume.

For backup changes, run the [backup tests](../tests/draft-backup.test.ts). In the browser, restore a finished Mara Vale backup and one unfinished character, then reload both at their saved steps. Verify that cancelling a preview or choosing malformed JSON, an unsupported ruleset, or invalid inputs leaves the open draft and saved library intact.

For link changes, run the [build link tests](../tests/build-link.test.ts). Generate a link from Mara Vale and inspect the decoded fragment for names, narrative, and custom choice text. Open it in another tab, confirm that the preview leaves the library intact, and save a separate copy. Check that a malformed fragment shows an error.

For brief changes, run the [Storyteller brief tests](../tests/storyteller-brief.test.ts). Compare the downloaded Markdown with the preview for Mara Vale and a draft with an unresolved manual ruling or a rejected XP purchase. Toggle a narrative section on and off and confirm that the text appears only while selected.
