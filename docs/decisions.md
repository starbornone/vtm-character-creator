# Decision records

The static app, Core catalog, print sheet, named browser drafts, JSON backup and restore, mechanical build links, and the Storyteller brief are implemented. See the [roadmap](../roadmap/roadmap.json) for delivery status.

## 1 Static Vite app with shadcn/ui

**Context.** The guide needs responsive form controls, dependent choices, and a live summary. Drafts and file transfers can operate within the browser.

**Decision.** Use Vite, React, TypeScript, Tailwind CSS, and shadcn/ui. Serve a static app and keep named drafts in browser storage.

**Consequences.** A draft belongs to its browser and origin. A failed write keeps the working copy open and downloadable. JSON backup and restore can carry that copy to another browser.

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

See [Architecture](architecture.md) and the [product plan](../PLAN.md) for the full flow.
