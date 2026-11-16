# Repository guide

## Project

The Vampire: The Masquerade Character Creator (`vtm-character-creator`) is a V5 browser guide for fledglings, neonates, and ancillae from the named Core clans or Caitiff, and for Thin-blood fledglings. It takes a player from concept through starting choices to a rules-checked character sheet and an optional Storyteller handoff. Use Vite, React, TypeScript, Tailwind CSS, and shadcn/ui as specified in the [product plan](PLAN.md).

## Layout

- [README.md](README.md) is the human entry point. [PLAN.md](PLAN.md) describes the player workflow and release scope.
- [docs/](docs/) holds contributor documentation and the roadmap contract. [roadmap/](roadmap/) holds the ordered backlog and history.
- [`src/main.tsx`](src/main.tsx) mounts the React app. [`src/App.tsx`](src/App.tsx) renders the character guide, review, and printable sheet. The [architecture](docs/architecture.md) describes `src/rules/` and `src/catalog/`.

## Working agreements

Use `npm ci` to install dependencies, `npm run dev` to start Vite, `npm test` to run the rules tests, and `npm run build` to type-check and produce the static build. For documentation and roadmap changes, verify relative links, parse the changed JSON, and check whitespace. See [Getting started](docs/getting-started.md) for setup and [Development](docs/development.md) for change-specific checks.

## Documentation

Update the relevant documentation when behavior, setup, module ownership, or a portable format changes. Keep [the overview](docs/overview.md), the [README](README.md), and the [plan](PLAN.md) accurate about what exists and what is pending. Record substantive rule and scope choices in [Decisions](docs/decisions.md).

## Roadmap

This project's key is `vtm-character-creator` and its title is `Vampire: The Masquerade Character Creator`. Keep the roadmap in three files in `roadmap/` at the repository root.

- [`roadmap/roadmap.json`](roadmap/roadmap.json) holds project status and items still to do, highest priority first.
- [`roadmap/completed.json`](roadmap/completed.json) holds finished items.
- [`roadmap/cancelled.json`](roadmap/cancelled.json) holds dropped items.

All three use this shape, with status-specific fields as described below.

```json
{
  "schema": "name-roadmap/v1",
  "file": "roadmap",
  "updatedAt": "2026-10-14T09:30:00+11:00",
  "project": {
    "key": "vtm-character-creator",
    "title": "Vampire: The Masquerade Character Creator",
    "status": "active",
    "summary": "A planned browser-based V5 character creator for standard clan neonates."
  },
  "items": [
    {
      "id": "scaffold-vite-app",
      "title": "Scaffold the Vite app",
      "group": "Foundation",
      "notes": "Document the supported runtime and local commands."
    }
  ]
}
```

1. Use `name-roadmap/v1` for `schema` and `roadmap`, `completed`, or `cancelled` for `file`, matching the filename.
2. Keep `project.key`, `project.title`, and `project.status` identical in all three files. Preserve the project key permanently. Use `active`, `paused`, or `complete` for `status`. Include `summary` only in `roadmap.json`.
3. Give every item a permanent lowercase kebab-case `id`, unique across all three files. Preserve it through moves and edits. Titles and notes may change.
4. Use only `id`, `title`, optional `group`, and optional `notes`, plus required `completedAt` in `completed.json` or required `cancelledAt` and optional `reason` in `cancelled.json`.
5. Move finished items to the end of `completed.json` and add `completedAt`. Move dropped items to the end of `cancelled.json` and add `cancelledAt` and a short `reason`. Preserve every item in the roadmap or its history. To revive a cancelled item, move it back to `roadmap.json` with the same ID and remove `cancelledAt` and `reason`.
6. Keep each item in exactly one file. Give new work its own ID when splitting an item and retain a disposition for the original item.
7. Set `updatedAt` in every changed file. Use ISO 8601 timestamps with an explicit UTC offset for all dates.
8. Keep `roadmap.json` in priority order. Limit titles to 500 characters and notes and reasons to 20,000 characters. Limit each file to 2,000 items.
9. Write valid UTF-8 JSON with two-space indentation and no comments or trailing commas. Create a missing file with `"items": []`.
10. Update the roadmap in the same change that delivers or drops the work. Mark completion only after the work is done.

The import contract and examples are in [docs/roadmap-format.md](docs/roadmap-format.md).

## Scope of changes

- Prefer small diffs tied to a concrete outcome and update the roadmap alongside the work. Preserve roadmap IDs.
- Keep rules and derived totals in the evaluator. Cite the selected V5 printing and errata when adding or changing rule behavior.
- Keep the implementation within the product plan’s static app architecture. Revisit the scope with a decision record before introducing a new API.
