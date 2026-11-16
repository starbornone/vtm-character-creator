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

## Check the live character summary

The **Character summary** sits beside the editor on desktop. On a narrow screen, tab to **Character summary** and press Enter or Space to open or close it. It shows your age profile, clan or blood status, applicable Predator Type, Health, Willpower, Humanity, Blood Potency, starting XP remaining, and completed sections. The values follow your edits as you move through the guide or restore a draft. **Review & Print** shows the full sheet.

## Choose an age profile

In **Concept**, use **Age profile** to choose **Fledgling**, **Neonate**, or **Ancilla**. A newly Embraced fledgling starts with 0 XP and develops a Predator Type in play. A neonate chooses an eligible Predator Type and starts with 15 XP. Named-clan and Caitiff fledglings and neonates use 12th or 13th Generation. Thin-bloods use the Fledgling profile and 14th to 16th Generation. An ancilla also chooses an eligible Predator Type and starts at 10th or 11th Generation with Blood Potency 2, Humanity 6 before Predator adjustments, 9 base Advantage dots, 4 base Flaw dots, and 35 XP.

Switching profiles checks the selected Generation, dot budgets, and XP journal against the new rules. If a Generation becomes unavailable, the guide keeps it in the full draft until you choose a new one. Switching back can make the saved choice active again. Fledgling pauses the Predator Type and XP choices. Browser drafts and JSON backups preserve those choices. Mechanical build links carry the choices supported by the current profile. First-release drafts, backups, and links open as neonates.

The info buttons beside **Concept**, **Chronicle**, **Embraced**, **Ambition**, and **Desire** explain what to enter. Hover, focus, or tap a button to read its help.

## Reuse chronicle settings

Set **Chronicle** and **Rule sources** in **Concept**, and enter **Chronicle Tenets** in **Relationships**. Return to **Concept**, expand **Chronicle presets**, enter a **Preset name**, and select **Save current settings**.

Open another character draft and return to **Concept**. Choose the preset under **Saved presets** and select **Preview preset**. Compare the current and preset values for each field that would change. **Apply preset** copies those settings into the open draft. **Cancel preview** leaves the draft as it was. If a preset turns off a rule source, the draft keeps any saved selections that depend on it for review.

Named drafts autosave the applied values. A character’s JSON backup carries its chronicle name, Tenets, and rule sources. The reusable presets stay in the browser where you saved them.

## Look up V5 rules

Select **V5 table reference** in the header from any creation step. The search field receives focus automatically. Try a rule name, related words such as `Resilience Stamina`, or a printed page number such as `137`. Entries give a short explanation and their book and page references. The reference includes supported Player’s Guide power prerequisites and labels them with their source.

Use **Tab** from the search field to reach and scroll the results with the keyboard. Select **Close** or press **Esc** to return to the same draft and step. The reference leaves unsaved edits available in the creator.

## Map a character’s relationships

Open **Relationships** and scroll to **Relationship Map**. The character’s sire, coterie, and Touchstones appear as you record them above. Enter a name and select **Add person** to include someone else. Choose **From** and **To**, enter a label such as “Owes a favor,” then select **Add connection**.

Use **Tab** to reach the fields, arrow keys to move through the endpoint choices, and **Enter** to submit. The connection list reads from the first named endpoint to the second. Removing an added person also removes connections involving that person. If you rename or clear an original relationship, its existing connections keep the original name and mark it as an earlier entry.

Named drafts autosave the map. The JSON backup preview shows the counts of added people and connections before you restore the draft as a copy. Mechanical build links share creation choices without relationship details.

## Plan a coterie and Domain

Select **Coterie & Domain** in the header. Name the plan and describe the coterie’s shared purpose. Add members by name or choose a saved **Character draft** and select **Add from draft**. By default this copies the character’s display name. Check **Include Relationship Map details** before adding a draft when you want its people and connections in the plan. The plan keeps a snapshot of the selected details.

Name the Domain, record the table’s agreed Chasse, Lien, and Portillon ratings, and add notes such as boundaries or shared obligations. Use **Save plan** to store it in this browser. Reopen it later under **Saved plans**.

Select **Preview handoff** and review the shared purpose, Domain details, member names, and any opted-in relationships. Select **Download coterie JSON** to save the file. On another browser or in the same planner, use **Choose coterie JSON**, review the preview, and select **Restore as new plan**. This creates a separate plan and leaves individual character drafts and their saved steps intact.

## Save and reopen browser drafts

Expand **Browser drafts**, enter a **Draft name**, and select **Save draft**. Once named, the character and current step autosave as you work. Reload the page to resume the last open saved draft. Use **New draft** for another character, or choose a name under **Saved drafts** and select **Open draft** to resume that character at its own last step. Edit the draft name and select **Save draft** to rename it.

Drafts belong to the current browser and site address. If saving fails, the last saved version stays in the browser and the current edits stay open. Use **Retry save** after storage is available or choose **Download current draft** before reloading to save a JSON copy with the current edits and step.

### Duplicate a draft

Open a named draft and expand **Browser drafts**. Select **Duplicate draft**, accept or edit the suggested **Copy name**, then select **Save copy**. The copy opens at the same step with the current character inputs. From then on, the two drafts autosave separately. If saving the copy fails, the original stays open at the same step and the copy form shows the error.

## Back up and restore a draft

Select **Download current draft** to save a JSON backup of the character and current step, including an unfinished or unnamed character. The backup includes narrative fields, Storyteller notes, and the XP advancement journal when present.

Select **Choose JSON backup** and open the file. Review the character, saved step, and completion status in **Backup preview**. Edit **New draft name** if desired, then select **Restore as new draft**. The copy opens at its saved step and the existing drafts remain in the library. If the original name is already taken, the preview suggests a name with a copy suffix.

If you pick a valid coterie handoff here, the guide directs you to **Coterie & Domain → Choose coterie JSON**. If you pick a valid character backup in the planner, it directs you to **Browser drafts → Choose JSON backup**. Select the file again in the matching control to preview it.

The guide reports malformed files, unsupported versions or rulesets, and invalid inputs before restoring anything. Rejected files leave the open draft and plan and both saved libraries intact. If browser storage rejects the restore, the preview stays open so you can retry.

## Share a mechanical build

In **Review & Print**, select **Share mechanical build** and copy the link. Anyone with the link can open a read-only sheet showing the included creation ratings, catalog choices, and starting XP. The link leaves out the advancement journal, draft and character names, chronicle details, relationships, notes, custom Specialty names, and manual entries.

The preview identifies omitted choices that need to be re-entered. Select **Save as new draft** to add an editable copy to your own browser library. The copy starts at **Concept** so you can add its name and story. Use a [JSON backup](#back-up-and-restore-a-draft) when you want to share the full draft.

## Export a Storyteller brief

In **Review & Print**, select **Storyteller brief**. Read **Open Rulings** beside the Markdown preview on desktop or above it on a narrow screen. This list shows the same unresolved mechanical choices, rejected XP purchases, and Storyteller review notes as the download. The Markdown also includes evaluated mechanics and starting and advancement XP.

Choose the narrative sections you want to share. Character identity and chronicle, Ambition and Desire, Convictions and Touchstones, relationships and Chronicle Tenets, and custom names and Storyteller notes each start unchecked. Manual options and custom Specialties use generic labels in the default brief, while their ratings, costs, and review flags remain visible. Select **Download Markdown** to save the text shown in the preview as `storyteller-brief.md`.

## Advance a finished character

Finish the creation choices, then open **XP Advancement Journal** in **Review & Print**. Enter a whole-number XP award and select **Record XP**. Choose a purchase type and target to see the cost, then select **Add purchase**. Starting XP still belongs to the creation steps.

Use **Earlier**, **Later**, or **Remove** to correct the journal. You can also remove an XP award. A purchase that loses a prerequisite or funding shows a reason and stays in the journal so you can fix it. Reopening a required creation choice pauses the journal until creation is complete again. The sheet shows the valid purchases and current ratings, and a named draft autosaves the journal. Use a JSON backup to restore a copy with its advancement.

## Enable the Player’s Guide

New drafts start with the Core catalog. In **Concept**, use **Rule sources** to enable the Player’s Guide for the current draft. Source tags include page references. Switch the pack off to return to Core choices. Saved pack choices stay in the draft and can take effect again when enabled.

A supported pack enabled in a backup or link is active in its preview and saved with the new copy. If the pack is disabled and the draft still uses its options, the preview flags the open choices. A preview that names an unavailable pack ID requires a creator that supports it to restore or save the character.

## Choose options from the catalog

Under **Clan & Predator**, use the search fields to filter the pickers by option name or source page. Caitiff and Thin-blood are dedicated options alongside the named clans. The picker shows eligibility restrictions. Once you choose a Predator Type, complete its Specialty, Discipline power, and any additional grant choices. Characters with Blood Sorcery can select an optional starting level-one Ritual.

Choose **Manual entry** in either picker for a table-specific clan or Predator Type using the same starting allocation. Enter its name and source or Storyteller note. In **Advantages & XP**, add manual Advantages or Flaws against the base budgets. The sheet shows those entries and their notes under **Storyteller Review**.

## Build and print Mara Vale

In **Concept**, choose **Neonate** and enter Mara Vale, a former theater carpenter in *Last Call at the Lyric*, Embraced in 1998. Her Ambition is to secure a permanent home for the theater company. Her Desire is to find the missing stagehand tonight. Use **Continue** or the step navigation to move through the guide.

Under **Clan & Predator**, choose Brujah and Alleycat. For Mara, put two clan dots in Presence and one in Potence. Choose Awe, Daunt, and Lethal Body. Give the Alleycat dot to Potence, choose Prowess, and select Brawl (Grappling). The ledger should show Presence 2, Potence 2, three dots of Criminal Contacts, and Humanity 6.

In **Attributes & Skills**, assign ratings using the slots for the selected distribution. Brawl shows a bonus dot from Alleycat until you assign base dots to it. After you assign Brawl 3, the grant becomes Brawl (Grappling) in **Specialties**. Choose a rated Skill for the free Specialty and fill any first-dot Specialty slots that appear.

Use the [neonate fixture’s base allocation](v5-rules.md#base-allocation) for a complete check. Mara fills both distributions and reaches Health 6 and Willpower 5. Choose Athletics (Climbing) for her free Specialty and Craft (Carpentry) for her first-dot Specialty. If you change distributions after assigning Skills, adjust any overfilled ratings shown in the ledger.

Under **Advantages & XP**, choose 13th Generation, then set Beautiful 2, Haven 1, Mask 2, Resources 2, and Stake Bait. Mara uses all 7 base Advantage dots and all 2 Flaw dots. The Alleycat grant brings the Advantage total to 10. The character has Blood Potency 1 and Bane Severity 2.

Under **Starting XP**, select Skill and add Stealth twice, then add Drive. The journal should show 3, 6, and 6 XP spent, leaving 0. Move Stealth 2 above Stealth 1 to see why the earlier purchase is ineligible. Move it back to restore the results.

In **Relationships**, enter Inez Varga as Mara’s sire and “Protect people who depend on you” as the Chronicle Tenet. Pair the Conviction “Keep my word” with Jo Reyes, the living stage manager, as her Touchstone.

Open **Review & Print**. Mara’s sheet shows Health 6, Willpower 5, Humanity 6, Blood Potency 1, and 0 XP remaining. Use **Print character sheet** to open your browser’s print dialog, where you can print or save to PDF. If the build is incomplete, select an item under **Open choices** to go to the field or group that needs attention. Keyboard focus moves there automatically. Fix the last open choice to clear the **Draft** label from the sheet and its printout.

## Build and print Rowan Pike

In **Concept**, choose **Fledgling**. Use [Rowan Pike’s fixture](v5-rules.md#rowan-pike-fledgling-fixture) to make a 12th-Generation Gangrel with Fortitude 2 and Protean 1. In **Clan & Predator**, complete the clan powers and continue directly to **Attributes & Skills**. In **Advantages & XP**, allocate the 7 Advantage and 2 Flaw dots. The starting XP section shows a budget of 0.

Complete **Relationships** and open **Review & Print**. Rowan’s sheet shows Health 8, Willpower 5, Humanity 7, and Blood Potency 1. Verify the Fledgling label and print the sheet. You can also save a named draft, reload at **Review & Print**, and restore a downloaded backup as a second draft.

## Build Silas Ward

In **Concept**, choose **Ancilla**. Use the [Silas Ward fixture](v5-rules.md#silas-ward-ancilla-fixture) to build an 11th-Generation Toreador with Sandman and Auspex 2 before XP. Under **Starting XP**, buy Scry the Soul for Auspex 3 (15 XP), then Spirit’s Touch for Auspex 4 (20 XP). Move the second purchase earlier to see its rank requirement and the 20 XP left unspent. Move it back to finish the build.

Try **Neonate** in **Concept** and return to **Advantages & XP**. The guide flags Silas’s 11th Generation and the two extra dots in each base budget. Auspex 3 still fits the smaller XP budget and the Auspex 4 purchase stays in the journal. Choose **Ancilla** again to return to the completed sheet.

## Build Nessa Reed

In **Concept**, choose **Neonate**, then select **Caitiff** under **Clan & Predator**. Follow the [Nessa Reed fixture](v5-rules.md#nessa-reed-caitiff-fixture) for the two free Discipline choices and Bagger’s Obfuscate grant. Under **Advantages & XP**, buy Presence 2 with Lingering Kiss for 12 XP and Drive 1 for 3 XP. To buy the first dot in a different Discipline, select its power and confirm the blood-tasting and learning requirements.

In **Review & Print**, check that the sheet shows Suspect as a separate Caitiff Flaw, 15 XP spent, and 0 XP remaining. Use **Print character sheet** to print it. Download the draft, then use **Choose JSON backup** to preview and restore a separate copy.

## Build Iris Calder

In **Concept**, choose **Fledgling**. In **Clan & Predator**, select **Thin-blood**. If you arrive with another age selected, use **Set age to Fledgling**. Choose the two Merits and two Flaws from [Iris Calder’s fixture](v5-rules.md#iris-calder-thin-blood-fixture). Select Brujah for Clan Curse, Fortitude and Resilience for Discipline Affinity, and Fixatio and Haze for Thin-blood Alchemy.

Follow the fixture’s trait allocation and choose 15th Generation in **Advantages & XP**. Fill the regular 7 Advantage and 2 Flaw dots separately from the Thin-blood choices. Complete **Relationships**, then confirm Blood Potency 0, Fortitude 1, and the starting formula in **Review & Print**. Print the sheet and download a backup to restore as a new draft.

## Build Elias Voss with both sources

Enable the Player’s Guide in **Concept** and follow the [Elias Voss fixture](v5-rules.md#elias-voss-mixed-source-fixture). Set Obfuscate to 2 and Presence to 1 before choosing Chimerstry. Under **Extortionist Backgrounds**, assign two dots to Contacts and one to Resources, then choose the escaped victim as the Enemy. Buy Obfuscate 3 with Mask of a Thousand Faces for 15 XP.

In **Review & Print**, confirm the Player’s Guide source, Obfuscate 3 with Chimerstry, and 10 total Advantage and 4 total Flaw dots. Download the backup and restore it as a new draft or open the mechanical build link to see the same ratings.

## Verify the production build

```sh
npm test
npm run build
npm run preview
```

The tests check the complete Mara, Rowan, Silas, Nessa, Iris, and Elias sheets, age profile compatibility, core path and grant rules, browser draft storage, JSON backup round-trips, the build link allowlist, and narrative opt-ins for the Storyteller brief. The build runs TypeScript and writes the static site to `dist/`. Open the preview’s printed **Local** URL to check the guide. Rebuild after editing source files. Use `npm run typecheck` when you only need the TypeScript check.

See the [overview](overview.md) for first-release scope and [Development](development.md) for contributor checks.
