# Getting started

## Prerequisites

Use Node.js 24 or later with npm and a modern browser. Run commands from the repository root, which contains `package.json` and `package-lock.json`.

## Install and run

```sh
npm ci
npm run dev
```

Open the **Local** URL printed by Vite. The dev server defaults to port `5173` and can use a different port if it is busy. The **Character Creator** opens with the Balanced Skill distribution selected. Stop the server with Ctrl+C.

If npm reports a missing `package.json`, return to the repository root. For a registry or network error during `npm ci`, check access to the npm registry and retry. If your browser cannot connect, check that Vite is running and use its printed URL.

## Try the ledger

Assign ratings to Attributes and Skills using the available slots. Set Stamina to see Health, and set both Composure and Resolve to see Willpower. Choose a rated Skill for the free Specialty and fill any first-dot Specialty slots that appear.

Use the [neonate fixture’s base allocation](v5-rules.md#base-allocation) for a complete check. Mara fills both distributions, names two Specialties, and reaches Health 6 and Willpower 5. If you change distributions after assigning Skills, adjust any overfilled ratings shown in the ledger. The current draft lasts for the page session and starts fresh on reload.

Under **Clan & Predator Type**, choose Brujah and Alleycat. For Mara, put two clan dots in Presence and one in Potence. Choose Awe, Daunt, and Lethal Body. Give the Alleycat dot to Potence, choose Prowess, and select Brawl (Grappling). The ledger should show Presence 2, Potence 2, three dots of Criminal Contacts, and Humanity 6. If the chosen Predator Specialty’s Skill has no base dots, its Skill row shows the separate granted dot.

Under **Advantages & Flaws**, choose 13th Generation, then set Beautiful 2, Haven 1, Mask 2, Resources 2, and Stake Bait. Mara uses all 7 base Advantage dots and all 2 Flaw dots. The Alleycat grant brings the Advantage total to 10. The character has Blood Potency 1 and Bane Severity 2.

Under **Starting XP**, select Skill and add Stealth twice, then add Drive. The journal should show 3, 6, and 6 XP spent, leaving 0. Move Stealth 2 above Stealth 1 to see why the earlier purchase is ineligible. Move it back to restore the results.

## Verify the production build

```sh
npm test
npm run build
npm run preview
```

The tests check Mara’s starting allocations and clan path, partial drafts, dependent choices, and grant eligibility. The build runs TypeScript and writes the static site to `dist/`. Open the preview’s printed **Local** URL to check the creator. Rebuild after editing source files. Use `npm run typecheck` when you only need the TypeScript check.

See the [overview](overview.md) for first-release scope and [Development](development.md) for contributor checks.
