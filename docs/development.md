# Development

| Path | What is here |
| --- | --- |
| `README.md` | Human entry point and current phase. |
| `PLAN.md` | Product scope, player workflow, and implementation milestones. |
| `docs/` | Architecture, onboarding, decisions, contribution guidance, and the roadmap contract. |
| `roadmap/` | Three JSON files tracking pending, finished, and cancelled work. |
| `AGENTS.md` | Repository instructions for coding agents. |

Start from a [roadmap item](../roadmap/roadmap.json) and read the relevant section of the [plan](../PLAN.md). For documentation changes, follow the relative links from the edited pages and parse the three roadmap files if any changed. Check schema values, matching project metadata, timestamps, and unique IDs across all three files. Review the diff for unrelated edits.

The scaffold milestone introduces the Vite entry point, dependency manifest, and scripts. This checkout has no app install, dev, test, lint, or build commands yet. Record the scripts and supported runtime in [Getting started](getting-started.md) when the scaffold lands. During implementation, verify TypeScript and the production build, run the tests available in the checkout, and run lint once a lint script exists.

Use the chosen Core Rulebook printing and errata to check rules fixtures before encoding V5 numbers or prerequisites. Prioritize tests for edition-specific math, dependent grants, invalidated selections, and XP purchase order. For edits to persistence or sharing, exercise unfinished drafts, malformed input, version mismatches, and narrative text exclusion from build links. Use [Architecture](architecture.md) for the planned module boundaries and [Contributing](contributing.md) for how to update the roadmap with a change.
