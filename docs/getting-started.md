# Getting started

## Prerequisites

Use Node.js 24 or later with npm and a modern browser. Run commands from the repository root, which contains `package.json` and `package-lock.json`.

## Install and run

```sh
npm ci
npm run dev
```

Open the **Local** URL printed by Vite. The dev server defaults to port `5173` and can use a different port if it is busy. The **Character Creator** opens on **Concept**. Stop the server with Ctrl+C.

If npm reports a missing `package.json`, return to the repository root. For a registry or network error during `npm ci`, check access to the npm registry and retry. If your browser cannot connect, check that Vite is running and use its printed URL.

## Save and reopen browser drafts

Enter a **Draft name** and select **Save draft**. Once named, the character and current step autosave as you work. Reload the page to resume the last open saved draft. Use **New draft** for another character, or choose a name under **Saved drafts** and select **Open draft** to resume that character at its own last step. Edit the draft name and select **Save draft** to rename it.

Drafts belong to the current browser and site address. If saving fails, the last saved version stays in the browser and the current edits stay open. Use **Retry save** after storage is available or choose **Download current draft** before reloading to save a JSON copy with the current edits and step.

## Back up and restore a draft

Select **Download current draft** to save a JSON backup of the character and current step, including an unfinished or unnamed character. The backup includes narrative fields and Storyteller notes.

Select **Choose JSON backup** and open the file. Review the character, saved step, and completion status in **Backup preview**. Edit **New draft name** if desired, then select **Restore as new draft**. The copy opens at its saved step and the existing drafts remain in the library. If the original name is already taken, the preview suggests a name with a copy suffix.

The guide reports malformed files, unsupported versions or rulesets, and invalid draft inputs before restoring anything. If browser storage rejects the restore, the preview stays open so you can retry.

## Choose options from the Core catalog

Under **Clan & Predator Type**, use the search fields to filter the pickers by option name or source page. The picker shows eligibility restrictions. Once you choose a Predator Type, complete its Specialty, Discipline power, and any additional grant choices. Characters with Blood Sorcery can select an optional starting level-one Ritual.

Choose **Manual entry** in either picker for a table-specific clan or Predator Type using the same starting allocation. Enter its name and source or Storyteller note. In **Advantages & XP**, add manual Advantages or Flaws against the base budgets. The sheet shows those entries and their notes under **Storyteller Review**.

## Build and print Mara Vale

In **Concept**, enter Mara Vale, a former theater carpenter in *Last Call at the Lyric*, Embraced in 1998. Her Ambition is to secure a permanent home for the theater company. Her Desire is to find the missing stagehand tonight. Use **Continue** or the step navigation to move through the guide.

Under **Clan & Predator Type**, choose Brujah and Alleycat. For Mara, put two clan dots in Presence and one in Potence. Choose Awe, Daunt, and Lethal Body. Give the Alleycat dot to Potence, choose Prowess, and select Brawl (Grappling). The ledger should show Presence 2, Potence 2, three dots of Criminal Contacts, and Humanity 6.

In **Attributes & Skills**, assign ratings using the slots for the selected distribution. Brawl shows a bonus dot from Alleycat until you assign base dots to it. After you assign Brawl 3, the grant becomes Brawl (Grappling) in **Specialties**. Choose a rated Skill for the free Specialty and fill any first-dot Specialty slots that appear.

Use the [neonate fixture’s base allocation](v5-rules.md#base-allocation) for a complete check. Mara fills both distributions and reaches Health 6 and Willpower 5. Choose Athletics (Climbing) for her free Specialty and Craft (Carpentry) for her first-dot Specialty. If you change distributions after assigning Skills, adjust any overfilled ratings shown in the ledger.

Under **Advantages & Flaws**, choose 13th Generation, then set Beautiful 2, Haven 1, Mask 2, Resources 2, and Stake Bait. Mara uses all 7 base Advantage dots and all 2 Flaw dots. The Alleycat grant brings the Advantage total to 10. The character has Blood Potency 1 and Bane Severity 2.

Under **Starting XP**, select Skill and add Stealth twice, then add Drive. The journal should show 3, 6, and 6 XP spent, leaving 0. Move Stealth 2 above Stealth 1 to see why the earlier purchase is ineligible. Move it back to restore the results.

In **Relationships**, enter Inez Varga as Mara’s sire and “Protect people who depend on you” as the Chronicle Tenet. Pair the Conviction “Keep my word” with Jo Reyes, the living stage manager, as her Touchstone.

Open **Review & Print**. Mara’s sheet shows Health 6, Willpower 5, Humanity 6, Blood Potency 1, and 0 XP remaining. Use **Print character sheet** to open your browser’s print dialog, where you can print or save to PDF. The same sheet is available for an incomplete build with a **Draft** label. Open choices in the review link back to their steps.

## Verify the production build

```sh
npm test
npm run build
npm run preview
```

The tests check Mara’s complete sheet, core path and grant rules, browser draft storage, and JSON backup round-trips. The build runs TypeScript and writes the static site to `dist/`. Open the preview’s printed **Local** URL to check the guide. Rebuild after editing source files. Use `npm run typecheck` when you only need the TypeScript check.

See the [overview](overview.md) for first-release scope and [Development](development.md) for contributor checks.
