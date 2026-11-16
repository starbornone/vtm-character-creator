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
| `src/catalog/clan-path.ts`, `src/rules/clan-path.ts` | Core and optional clan and Predator Type options, source tags, power slots, and derived grants. |
| `src/catalog/source-packs.ts`, `src/rules/creation-sources.ts` | Pack IDs, availability checks, and detection of packed selections in transfers. |
| `src/components/CatalogSelect.tsx` | Keyboard-accessible search and native select for source-tagged catalogs. |
| `src/catalog/starting-options.ts`, `src/rules/starting-xp.ts` | Starting Advantage and Flaw options, generation and Blood Potency, and ordered XP rules. |
| `src/rules/advancement.ts`, `src/components/AdvancementJournal.tsx` | Earned XP awards and ordered purchases against the finished creation build. |
| `src/rules/table-reference.ts`, `src/components/TableReference.tsx` | Searchable rule summaries, citations, and a dialog that preserves the open draft. |
| `src/rules/character-guide.ts`, `src/components/CharacterSheet.tsx` | Shared draft evaluation, review issues, and the printable sheet. |
| `src/drafts/`, `src/components/DraftControls.tsx` | Draft input validation, browser storage, recovery download, and draft controls. |
| `src/drafts/chronicle-presets.ts`, `src/components/ChroniclePresets.tsx` | Browser-local chronicle presets and a preview of the changes to the open draft. |
| `src/drafts/draft-backup.ts`, `src/components/BackupRestore.tsx` | Versioned backup format, file validation, and restore preview. |
| `src/sharing/build-link.ts`, `src/components/SharedBuild.tsx` | Mechanical allowlist, versioned URL fragment, and read-only recipient preview. |
| `src/sharing/storyteller-brief.ts`, `src/components/StorytellerBrief.tsx` | Markdown brief, open rulings, and narrative opt-in preview. |
| `src/rules/creation-profiles.ts` | Starting generation, Blood Potency, Predator access, and budgets by age profile. |
| `tests/fixtures/`, `tests/` | Shared hand-checked character fixtures and rules regression tests. |

Start from a [roadmap item](../roadmap/roadmap.json) and read the relevant section of the [plan](../PLAN.md). For documentation changes, follow the relative links from the edited pages and parse the three roadmap files if any changed. Check schema values, matching project metadata, timestamps, and unique IDs across all three files. Review the diff for unrelated edits.

Install dependencies with `npm ci`. Use `npm run dev` while editing, `npm test` for the rules tests, and `npm run build` for the type check and production bundle. Use `npm run typecheck` for a standalone TypeScript check and `npm run preview` after building to serve `dist/` locally. See [Getting started](getting-started.md) for the local smoke check.

Use the [pinned V5 rules and hand-checked fixtures](v5-rules.md) when encoding rules or catalog prerequisites. Prioritize tests for edition-specific math, dependent grants, invalidated selections, and XP purchase order. For edits to persistence or sharing, exercise unfinished drafts, malformed input, version mismatches, and narrative text exclusion from build links. Use [Architecture](architecture.md) for the planned module boundaries and [Contributing](contributing.md) for how to update the roadmap with a change.

For sheet changes, check the complete Mara Vale fixture in **Review & Print** and the browser’s print preview. Try a draft with a missing Touchstone or other open choice. Confirm that Draft appears and the review links back to the affected step.

For age profile changes, run the [creation profile tests](../tests/creation-profiles.test.ts). Build [Rowan Pike](v5-rules.md#rowan-pike-fledgling-fixture) through review and print, reload the saved draft, restore the exported backup, and open its mechanical link. For the fledgling change, the browser also reopened a first-release Mara Vale draft, backup, and build link produced from the pre-fledgling code. Mara kept the Neonate profile, Alleycat grants, and 15 XP spent.

For ancilla rules, run the [ancilla tests](../tests/ancilla-creation.test.ts). Use [Silas Ward](v5-rules.md#silas-ward-ancilla-fixture) to check a dependent rank-four purchase, move it earlier and back, then switch to Neonate and reload. Confirm that the unavailable Generation and over-budget choices are still visible. Switch through Fledgling and back to Ancilla, then check the restored sheet and its build link.

For Caitiff rules, run the [Caitiff tests](../tests/caitiff-creation.test.ts). Build [Nessa Reed](v5-rules.md#nessa-reed-caitiff-fixture), verify the 12 XP upgrade and 6 XP first-dot quote, and try a manual positive Status entry. Compare the review sheet with print and restore a browser download under a second name.

For Thin-blood rules, run the [Thin-blood tests](../tests/thin-blood-creation.test.ts) and build [Iris Calder](v5-rules.md#iris-calder-thin-blood-fixture). Try a Neonate age and one incompatible Merit and Flaw pair, then resolve both. Confirm that the completed review, print, and restored backup show the same Clan Curse, Affinity, and Alchemy.

For catalog changes, run the [catalog tests](../tests/core-catalog.test.ts) and try a second path in the browser. Search by name and page, switch clans with a Predator Type already selected, and confirm that a manual entry’s source or note reaches **Storyteller Review**.

For source packs, run the [Player’s Guide tests](../tests/players-guide.test.ts). Try [Elias Voss](v5-rules.md#elias-voss-mixed-source-fixture) with the pack on, off, and on again. Open backups and links with the pack enabled, disabled, and with an unknown pack ID in a version 5 source manifest. Confirm that a supported disabled pack leaves open choices and that the unknown source preview offers no save action.

For advancement, run the [journal tests](../tests/advancement.test.ts) and follow [Mara’s advancement fixture](v5-rules.md#mara-vale-advancement-fixture). Move Potence 3 before Presence 3, then move it back. Remove and re-record the 25 XP award. Verify the balance and Health after each change, then reload a named draft and preview and restore its JSON backup.

For draft changes, run the [browser storage tests](../tests/browser-drafts.test.ts), save two characters at different steps, and reload after switching between them. Force a write failure on the local draft key and confirm that the last save persists, the current edits appear in the download, and a retry succeeds when writes resume.

For chronicle presets, run the [preset tests](../tests/chronicle-presets.test.ts). Save one preset with a chronicle name, a Tenet, and the Player’s Guide enabled. Preview it in two named drafts with different settings, cancel one preview, then apply it to both. Check that unrelated character fields keep their values. Reload a draft and restore its downloaded JSON under a new name to verify the three settings.

For the table reference, run the [search tests](../tests/table-reference.test.ts). From a named draft partway through the guide, use the keyboard to open search, find `Spark of Rage` and page `137`, and dismiss the dialog with **Esc**. Confirm focus returns to the opener and the draft and step stay selected. At a narrow viewport, search for `Blood Potency`, scroll the results, and close the dialog. Repeat with an unsaved edit and confirm it remains in the open draft.

For backup changes, run the [backup tests](../tests/draft-backup.test.ts). In the browser, restore a finished Mara Vale backup and one unfinished character, then reload both at their saved steps. Verify that cancelling a preview or choosing malformed JSON, an unsupported ruleset, or invalid inputs leaves the open draft and saved library intact.

For link changes, run the [build link tests](../tests/build-link.test.ts). Generate a link from Mara Vale and inspect the decoded fragment for names, narrative, and custom choice text. Open it in another tab, confirm that the preview leaves the library intact, and save a separate copy. Check that a malformed fragment shows an error.

For brief changes, run the [Storyteller brief tests](../tests/storyteller-brief.test.ts). Compare the downloaded Markdown with the preview for Mara Vale and a draft with an unresolved manual ruling or a rejected XP purchase. Toggle a narrative section on and off and confirm that the text appears only while selected.

For releases, use the [first-release verification record](release-verification.md) to repeat the desktop and mobile walkthrough, review printed sheets, and check the notices on the deployed site.
