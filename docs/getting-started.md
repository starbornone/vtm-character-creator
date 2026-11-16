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

## Choose an age profile

In **Concept**, choose **Neonate** or **Fledgling**. Neonates choose an eligible Predator Type and have 15 starting XP. Choose **Fledgling** for a newly Embraced standard-clan character who will develop a Predator Type during play. The guide skips that choice and gives the character 0 starting XP. Both profiles start at 12th or 13th Generation and use the same base Attribute, Skill, Advantage, and Flaw allocations.

If you switch a neonate to fledgling, the guide pauses the Predator Type choices and XP purchases. Switch back to **Neonate** to use them again. Browser drafts and JSON backups preserve those choices. Fledgling build links carry the active mechanics only. First-release drafts, backups, and links open as neonates.

## Save and reopen browser drafts

Enter a **Draft name** and select **Save draft**. Once named, the character and current step autosave as you work. Reload the page to resume the last open saved draft. Use **New draft** for another character, or choose a name under **Saved drafts** and select **Open draft** to resume that character at its own last step. Edit the draft name and select **Save draft** to rename it.

Drafts belong to the current browser and site address. If saving fails, the last saved version stays in the browser and the current edits stay open. Use **Retry save** after storage is available or choose **Download current draft** before reloading to save a JSON copy with the current edits and step.

## Back up and restore a draft

Select **Download current draft** to save a JSON backup of the character and current step, including an unfinished or unnamed character. The backup includes narrative fields and Storyteller notes.

Select **Choose JSON backup** and open the file. Review the character, saved step, and completion status in **Backup preview**. Edit **New draft name** if desired, then select **Restore as new draft**. The copy opens at its saved step and the existing drafts remain in the library. If the original name is already taken, the preview suggests a name with a copy suffix.

The guide reports malformed files, unsupported versions or rulesets, and invalid draft inputs before restoring anything. If browser storage rejects the restore, the preview stays open so you can retry.

## Share a mechanical build

In **Review & Print**, select **Share mechanical build** and copy the link. Anyone with the link can open a read-only sheet showing the included ratings, catalog choices, and starting XP. The link leaves out draft and character names, chronicle details, relationships, notes, custom Specialty names, and manual entries.

The preview identifies omitted choices that need to be re-entered. Select **Save as new draft** to add an editable copy to your own browser library. The copy starts at **Concept** so you can add its name and story. Use a [JSON backup](#back-up-and-restore-a-draft) when you want to share the full draft.

## Export a Storyteller brief

In **Review & Print**, select **Storyteller brief**. The Markdown preview includes evaluated mechanics, starting XP, and open rulings such as unresolved mechanical choices, rejected XP purchases, and manual options that need Storyteller review.

Choose the narrative sections you want to share. Character identity and chronicle, Ambition and Desire, Convictions and Touchstones, relationships and Chronicle Tenets, and custom names and Storyteller notes each start unchecked. Manual options and custom Specialties use generic labels in the default brief, while their ratings, costs, and review flags remain visible. Select **Download Markdown** to save the text shown in the preview as `storyteller-brief.md`.

## Choose options from the Core catalog

Under **Clan & Predator Type**, use the search fields to filter the pickers by option name or source page. The picker shows eligibility restrictions. Once you choose a Predator Type, complete its Specialty, Discipline power, and any additional grant choices. Characters with Blood Sorcery can select an optional starting level-one Ritual.

Choose **Manual entry** in either picker for a table-specific clan or Predator Type using the same starting allocation. Enter its name and source or Storyteller note. In **Advantages & XP**, add manual Advantages or Flaws against the base budgets. The sheet shows those entries and their notes under **Storyteller Review**.

## Build and print Mara Vale

In **Concept**, choose **Neonate** and enter Mara Vale, a former theater carpenter in *Last Call at the Lyric*, Embraced in 1998. Her Ambition is to secure a permanent home for the theater company. Her Desire is to find the missing stagehand tonight. Use **Continue** or the step navigation to move through the guide.

Under **Clan & Predator Type**, choose Brujah and Alleycat. For Mara, put two clan dots in Presence and one in Potence. Choose Awe, Daunt, and Lethal Body. Give the Alleycat dot to Potence, choose Prowess, and select Brawl (Grappling). The ledger should show Presence 2, Potence 2, three dots of Criminal Contacts, and Humanity 6.

In **Attributes & Skills**, assign ratings using the slots for the selected distribution. Brawl shows a bonus dot from Alleycat until you assign base dots to it. After you assign Brawl 3, the grant becomes Brawl (Grappling) in **Specialties**. Choose a rated Skill for the free Specialty and fill any first-dot Specialty slots that appear.

Use the [neonate fixture’s base allocation](v5-rules.md#base-allocation) for a complete check. Mara fills both distributions and reaches Health 6 and Willpower 5. Choose Athletics (Climbing) for her free Specialty and Craft (Carpentry) for her first-dot Specialty. If you change distributions after assigning Skills, adjust any overfilled ratings shown in the ledger.

Under **Advantages & XP**, choose 13th Generation, then set Beautiful 2, Haven 1, Mask 2, Resources 2, and Stake Bait. Mara uses all 7 base Advantage dots and all 2 Flaw dots. The Alleycat grant brings the Advantage total to 10. The character has Blood Potency 1 and Bane Severity 2.

Under **Starting XP**, select Skill and add Stealth twice, then add Drive. The journal should show 3, 6, and 6 XP spent, leaving 0. Move Stealth 2 above Stealth 1 to see why the earlier purchase is ineligible. Move it back to restore the results.

In **Relationships**, enter Inez Varga as Mara’s sire and “Protect people who depend on you” as the Chronicle Tenet. Pair the Conviction “Keep my word” with Jo Reyes, the living stage manager, as her Touchstone.

Open **Review & Print**. Mara’s sheet shows Health 6, Willpower 5, Humanity 6, Blood Potency 1, and 0 XP remaining. Use **Print character sheet** to open your browser’s print dialog, where you can print or save to PDF. The same sheet is available for an incomplete build with a **Draft** label. Open choices in the review link back to their steps.

## Build and print Rowan Pike

In **Concept**, choose **Fledgling**. Use [Rowan Pike’s fixture](v5-rules.md#rowan-pike-fledgling-fixture) to make a 12th-Generation Gangrel with Fortitude 2 and Protean 1. In **Clan & Predator Type**, complete the clan powers and continue directly to **Attributes & Skills**. In **Advantages & XP**, allocate the 7 Advantage and 2 Flaw dots. The starting XP section shows a budget of 0.

Complete **Relationships** and open **Review & Print**. Rowan’s sheet shows Health 8, Willpower 5, Humanity 7, and Blood Potency 1. Verify the Fledgling label and print the sheet. You can also save a named draft, reload at **Review & Print**, and restore a downloaded backup as a second draft.

## Verify the production build

```sh
npm test
npm run build
npm run preview
```

The tests check Mara’s and Rowan’s complete sheets, age profile compatibility, core path and grant rules, browser draft storage, JSON backup round-trips, the build link allowlist, and narrative opt-ins for the Storyteller brief. The build runs TypeScript and writes the static site to `dist/`. Open the preview’s printed **Local** URL to check the guide. Rebuild after editing source files. Use `npm run typecheck` when you only need the TypeScript check.

See the [overview](overview.md) for first-release scope and [Development](development.md) for contributor checks.
