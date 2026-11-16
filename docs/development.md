# Development

| Path | What is here |
| --- | --- |
| `README.md` | Human entry point and current phase. |
| `PLAN.md` | Product scope, player workflow, and implementation milestones. |
| `docs/` | Architecture, onboarding, decisions, contribution guidance, and the roadmap contract. |
| `roadmap/` | Three JSON files tracking pending, finished, and cancelled work. |
| `AGENTS.md` | Repository instructions for coding agents. |
| `index.html`, `src/main.tsx`, `src/App.tsx` | HTML entry, React bootstrap, and starter screen. |
| `src/components/ui/`, `src/index.css`, `components.json` | shadcn/ui components, Tailwind theme, and registry configuration. |

Start from a [roadmap item](../roadmap/roadmap.json) and read the relevant section of the [plan](../PLAN.md). For documentation changes, follow the relative links from the edited pages and parse the three roadmap files if any changed. Check schema values, matching project metadata, timestamps, and unique IDs across all three files. Review the diff for unrelated edits.

Install dependencies with `npm ci`. Use `npm run dev` while editing, `npm run typecheck` for a standalone TypeScript check, and `npm run build` for the required type check and production bundle. Use `npm run preview` after building to serve `dist/` locally. The scaffold has build and type checks. Rules tests are planned alongside the evaluator. See [Getting started](getting-started.md) for the local smoke check.

Use the [pinned V5 rules and hand-checked neonate fixture](v5-rules.md) when encoding rules or catalog prerequisites. Prioritize tests for edition-specific math, dependent grants, invalidated selections, and XP purchase order. For edits to persistence or sharing, exercise unfinished drafts, malformed input, version mismatches, and narrative text exclusion from build links. Use [Architecture](architecture.md) for the planned module boundaries and [Contributing](contributing.md) for how to update the roadmap with a change.
