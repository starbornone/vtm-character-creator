# Decision records

The static app, Core catalog, print sheet, named browser drafts, JSON backup and restore, mechanical build links, and the Storyteller brief are implemented. See the [roadmap](../roadmap/roadmap.json) for delivery status.

## 1 Static Vite app with shadcn/ui

**Context.** The guide needs responsive form controls, dependent choices, and a live summary. Drafts and file transfers can operate within the browser.

**Decision.** Use Vite, React, TypeScript, Tailwind CSS, and shadcn/ui. Serve a static app and keep named drafts in browser storage.

**Consequences.** A draft belongs to its browser and origin. A failed write keeps the working copy open and downloadable. JSON backup and restore can carry that copy to another browser.

The public homepage introduction and metadata ship in the initial HTML. The build emits crawl files for the public page list. The wizard and fragment-based build previews share the homepage path and use the existing browser session flow.

## 2 V5 Core Rulebook neonates first

**Context.** Character profiles and editions introduce different starting rules and exceptions.

**Decision.** Implement standard clan neonates and the core options that let them finish a build. Record the ruleset in drafts and exports.

**Consequences.** Additional profiles need explicit rules and test cases. Manual entries can cover additional choices supported by the current model and carry a Storyteller review item.

## 3 One evaluator for the ledger and character sheet

**Context.** Changing clan or Predator Type can invalidate related choices and alter several totals at once.

**Decision.** Store the player’s allocations and choices. Use pure TypeScript rules functions to derive active totals and validation for editing, review, and print.

**Consequences.** Ineligible selections remain available for the player to resolve. Every derived grant can identify its origin, and formula changes can be verified independently of React.

## 4 Explicit transfer formats

**Context.** A portable backup needs the complete draft. Sharing a build usually calls for mechanics, while a Storyteller may also need selected narrative details.

**Decision.** Use a versioned JSON backup, an allowlisted mechanical build link, and a Markdown Storyteller brief with opt-in narrative sections.

**Consequences.** Validate portable inputs before applying them. New draft fields require an explicit decision about backup, link, and brief behavior.

Build links start from an allowlist of catalog IDs and mechanical ratings. A format version lets the preview reject unsupported links. Names, narrative, and custom text stay in the full backup. The recipient can save a separate local draft after previewing the mechanics.

The brief shows evaluated mechanics and open rulings with generic labels for manual entries and free-text Specialties. Separate opt-ins add narrative, custom labels, and source notes to the preview and export.

## 5 Print from the review sheet

**Decision.** Use the same evaluated sheet in Review & Print and the browser’s print dialog. Keep open choices visible in the review and mark incomplete sheets as Draft in both views.

**Consequences.** Players can print a work in progress and use the review to return to any step with open choices. Chronicle Tenets and coterie details are optional because they can depend on the table.

## 6 Explicit age profiles and fledgling transfer compatibility

**Context.** Core p. 149 allows many fledglings to develop a Predator Type during play. The first release assumed the Neonate profile in its draft and transfer formats.

**Decision.** Support the newly Embraced standard-clan fledgling path. Use the 12th- or 13th-Generation starting options, Blood Potency 1, and 0 starting XP. Skip the Predator Type step’s feeding choices and grants. Keep saved Predator and XP inputs available when a player switches the draft back to Neonate.

**Consequences.** First-release data keeps the same Neonate mechanics. Version 2 stores the fledgling choice so older clients can identify an unsupported format. Backups preserve paused inputs and mechanical links carry active mechanics.

## 7 Ancilla profile switching retains draft inputs

**Context.** Core pp. 137 and 140 give standard-clan ancillae a different Generation range and budgets from the younger profiles. A profile change can invalidate part of an existing build.

**Decision.** Reevaluate the player’s current choices after a switch. Keep an unavailable Generation in the draft and leave it off the sheet until the player picks an eligible Generation or switches back. Replay the XP journal in order against the current budget and power prerequisites. Resolve a conflict between Farmer and Blood Potency 3 by rejecting the XP purchase while Farmer is selected.

**Consequences.** A profile switch can send the player back to **Advantages & XP**. Full drafts preserve choices for that review, including across reload and backup. Mechanical build links omit a paused Generation. Version 2 carries the ancilla profile and rank-four purchases while the established neonate and fledgling payloads still open.

## 8 Core Caitiff rules with independent age profiles

**Context.** Core pp. 107, 136–137, 148, and 244 give Caitiff free choice of starting Disciplines, a distinct XP rate, and conditions for learning a new Discipline. Caitiff start with Suspect and cannot buy positive Status at creation.

**Decision.** Offer Caitiff alongside the named clans and reuse the chosen age profile. Allocate the free dots to two distinct Core Disciplines. Require the player to confirm the blood-tasting and other learning requirements when using XP for a Discipline's first dot. Record Suspect as a granted Flaw outside the base budget. Flag and exclude manual advantages or Predator grants labeled Status.

**Consequences.** The Storyteller determines whether the fiction meets the learning requirements and whether to apply the Social penalty with Kindred who know the character is Caitiff. Version 3 carries Caitiff and the structured learning confirmation without adding notes to mechanical links. Earlier named-clan formats remain readable.

## 9 Core Thin-blood creation uses the Fledgling profile

**Context.** Core pp. 136–140, 148–149, and 182–184 give Thin-bloods a separate Generation range and matched Merits and Flaws. Their lasting starting powers can come from Discipline Affinity or Thin-blood Alchemist.

**Decision.** Keep blood status independent of age. Use the Core Fledgling path for Thin-bloods and offer a direct fix when the saved age conflicts. Keep their Merits and Flaws separate from the regular dot budgets. Resolve permanent Affinity, the first Alchemy method and formula, and any Bane granted by Clan Curse. Flag the Core creation restrictions on personal Bonding, Mawla, Retainers, and Status.

**Consequences.** The sheet records the starting choices and leaves feeding-based temporary powers and later Alchemy advancement to play. Version 4 carries the structured choices in backups and mechanical links. Changing blood status preserves prior draft inputs for a switch back.

## 10 Per-draft opt-in sources and preview behavior

**Context.** The Core catalog is the default. A player can share a draft that depends on additional rules or switch a source off during creation.

**Decision.** Store enabled source pack IDs with the draft and evaluate catalog selections under that manifest. Keep disabled selections in backups and retain supported mechanical options in links. If a preview receives a manifest with an unknown source pack, show the pack ID and withhold save or restore until the creator supports it.

**Consequences.** Turning the Player’s Guide off leaves affected choices open and removes their effects. Re-enabling it replays the saved selections. Version 5 carries source data. Core-only characters keep their original format and rules.

Ravnos uses the existing pack and the default Bane from the pinned printing. At creation, the No Haven restriction applies to the base Flaw and to manual ways of adding the same Flaw. A previously selected No Haven stays visible so the player can remove it or switch back. [Ravnos fixture](v5-rules.md#lena-ortiz-ravnos-fixture)

## 11 Replay earned XP from the creation build

**Decision.** Use the live completed creation build as the journal baseline. Keep XP awards and ordered advancement purchases in a separate ledger and validate each against the preceding valid entries. Require confirmation for the first dot of a new out-of-clan Discipline and preserve pending purchases and awards through creation edits.

**Consequences.** The guide can still edit creation details. If a required choice becomes open, the journal pauses until creation is complete again. Print and the Storyteller brief use the current applied ratings and separate XP totals. Version 6 backups carry the whole journal, and mechanical links share the creation build.

## 12 Keep the Relationship Map in the full draft

**Decision.** Derive the map’s starting relationships from the sire, coterie, and Touchstone fields. Use stable IDs for added people and keep the recorded role and name with connections to existing relationships.

**Consequences.** A changed or removed narrative field leaves its previous connections visible with their original name. Removing an added person removes their connections. The full draft carries the map, and the mechanical build link continues to carry creation mechanics.

## 13 Keep shared coterie plans independent of characters

**Decision.** Use a separate browser library and portable format for Coterie and Domain plans. Copy names from selected drafts and include Relationship Map details only when selected. Store the Domain ratings agreed at the table.

**Consequences.** Handoffs can move between browsers and restore as new plans. The planner leaves the original character drafts and their saved steps intact. A later change to a character stays with that character until a planner member is added again from the draft.

## 14 Scope private workspace work around handoff review

**Decision.** Prototype one invite-only chronicle workflow with fictional data. A player sends a previewed brief snapshot and the owner Storyteller responds. The character remains editable through the browser creator. Define export and removal around the shared submission and its review.

**Consequences.** The prototype can show both roles without committing to accounts or hosted data. A later hosted pilot needs a separate implementation decision and must verify access and deletion boundaries. [Private Storyteller workspace scope](storyteller-workspace.md)

See [Architecture](architecture.md) and the [product plan](../PLAN.md) for the full flow.
