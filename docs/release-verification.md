# First-release verification

Verified the release candidate on 16 November 2026 with Node.js 24, Vite’s production preview, and Chromium. The walkthrough uses the [Mara Vale fixture](v5-rules.md#hand-checked-fixture).

| Check | Result |
| --- | --- |
| Rules, persistence, and sharing | `npm test` passed all 45 tests. `npm run typecheck` and `npm run build` passed. |
| Desktop at 1440 × 1000 | Created Mara from Concept through Review & Print. Reload restored the named draft at Review & Print. Restoring the generated JSON through the backup input opened a second draft at the same step and preserved the original. The print button invoked the browser’s print handler. |
| Mobile at 390 × 844 | Repeated creation, reload, JSON download, restore as a new draft, and the print action at the measured phone-width viewport. The creator and shared build preview fit the viewport without horizontal scrolling. |
| Keyboard | Checked Tab focus to Continue, Enter activation and focus transfer between steps, native Generation selection, and Space toggling a Storyteller brief opt-in. |
| Sharing | Opened the mechanical build preview at both widths. Downloaded the default Storyteller brief and checked its applied XP and omission of the character name. |
| Print rendering | Chromium produced one-page grayscale PDFs of Mara’s sheet on US Letter and A4. The rendered sheets included the selected powers, 15 XP spent, zero XP remaining, and her Touchstone. A copy with the Touchstone blank retained the Draft label in print. Editing controls and the site footer stayed off the paper. |
| Candidate notices | The creator and shared preview display the official Dark Pack logo, the Paradox copyright and trademark notice, and the unofficial designation. The footer links to the agreement and official V5 resources. |

## Review issue navigation

In the local production preview, Enter and Space on two Concept issues focused Ambition and Desire separately. Tab advanced from Ambition. The Skill distribution issue focused its heading. At 390 × 844, the base Flaws and Starting XP issues moved focus to their targets and scrolled them into view without horizontal overflow.

Restoring [Mara Vale’s handoff draft](examples/mara-vale-handoff-draft.json) left one open issue and 6 starting XP. Brave’s one-page print preview showed **Draft · Open choices**. Following the XP issue and buying Drive 2 spent the final 6 XP, cleared the review list, and removed the label from the shared review and print sheet. The [expanded print check](#expanded-character-sheet-printing) confirmed both states in PDFs.

## Live character summary

In the local production preview at 1440 × 900, the summary sat beside the editor. Switching to Fledgling showed 0 starting XP and hid Predator Type. Switching back to Neonate and selecting Brujah and Alleycat showed Humanity 6. Setting Stamina to 3, Composure to 2, and Resolve to 3 showed Health 6 and Willpower 5. Completing the Conviction and Touchstone updated section progress.

At 390 × 844, Tab reached the collapsed summary, Space opened it, and Enter closed it while keeping focus on the button. The open card fit above the editor without horizontal overflow. A copy of [Mara’s handoff draft](examples/mara-vale-handoff-draft.json) saved at **Advantages & XP** restored at that step. The summary showed Neonate, Brujah, Alleycat, Health 6, Willpower 5, Humanity 6, Blood Potency 1, 6 starting XP remaining, and 4 of 5 sections complete. Buying Drive 2 changed the balance to 0 and progress to 5 of 5. Both values persisted across a step change and a named-draft reload.

## Expanded character sheet printing

Rendered eight PDFs from the local Vite production build with Chrome’s print renderer. Each case used the app’s **Review & Print** screen loaded from a fixture in isolated browser storage. The tests set the paper size to US Letter or A4 and kept the app’s print margins and styles. Checked page dimensions and extracted text, then inspected the rendered pages for clipping, overlap, and page breaks.

| Fixture | US Letter | A4 | Printed result |
| --- | --- | --- | --- |
| [Mara Vale](examples/mara-vale-handoff-draft.json), before her final purchase | 1 page | 1 page | **Draft · Open choices**, 9 starting XP spent, and 6 remaining. |
| Mara Vale, after buying Drive 2 | 1 page | 1 page | Drive 2 and its 6 XP cost appeared. The balance was 15 spent and 0 remaining. The Draft marker was gone. |
| [Iris Calder](v5-rules.md#iris-calder-thin-blood-fixture) | 1 page | 1 page | 15th Generation, Health 7, Willpower 5, Blood Potency 0, Fortitude 1 with Resilience, Fixatio and Haze, and all selected Thin-blood Merits and Flaws. |
| [Mara Vale with advancement](v5-rules.md#mara-vale-advancement-fixture) | 1 page | 1 page | Health 7, both rank-three Discipline powers, the Catwalks Specialty, all four advancement purchases, and separate starting and advancement XP balances. The advancement total was 55 earned, 53 spent, and 2 remaining. |

The initial advancement sheet split Beliefs & Relationships onto a second page on Letter and left just the Conviction and Touchstone on page two on A4. Tightening print spacing kept all of the fixture’s sections on one page at both sizes with the same text size. The print stylesheet also keeps Beliefs & Relationships together when the section fits on a page. Editing controls and the site footer stayed off the printed sheets.

## Browser draft duplication

In the local production preview, a named draft on **Relationships** suggested a copy name and rejected an existing name with different capitalization. Saving under a different name opened the copy at **Relationships** with the same Touchstone. After editing only the copy and moving to **Advantages & XP**, reload reopened the copy at that step. The original reopened at **Relationships** with its original Touchstone, and the copy kept its separate edit.

A second tab then saved a newer edit to the original. Saving another copy in the older tab showed the storage conflict in the copy form and left the original open at **Relationships**. After reloading, the library still held only the original and the first copy, and the newer edit was present. The browser draft test also checks that a quota failure leaves the stored library byte-for-byte intact.

## Public site

Vercel reported the notice commit `e70e956` ready for production on 16 November 2026. The live creator and a shared build preview both displayed the official Dark Pack logo, the Paradox copyright and trademark notice, and the unofficial designation. The logo loaded from the public domain and linked to the Dark Pack Agreement. [Public character creator](https://vtm.astralarchives.games/) · [Dark Pack Agreement](https://www.paradoxinteractive.com/games/world-of-darkness/community/dark-pack-agreement) · [Official V5 resources](https://renegadegamestudios.com/vampire)

## Player and Storyteller handoff review

Use these fictional files with the character creator. The character draft is a starting point for the review. The other two files are the examples to hand off.

- [Mara Vale’s character draft](examples/mara-vale-handoff-draft.json)
- [Sample Storyteller brief](examples/sample-storyteller-brief.md)
- [The Lyric Night Shift coterie plan](examples/sample-coterie-plan.json)

### Player walkthrough

1. Open **Browser drafts**, choose Mara’s character JSON, and select **Restore as new draft**. It opens at **Review & Print**.
2. Open **Storyteller brief**. Review what the default preview shares, then enable **Character identity and chronicle** and **Ambition and Desire**. Download the Markdown and compare it with the sample brief.
3. Look at the downloaded brief as if you were about to share it with your Storyteller. Record anything you expected to share or keep private that surprised you, and any step you had trouble finding.

### Storyteller walkthrough

1. Read the sample brief and describe what still needs a ruling or a player response. Record any missing context or unclear labels.
2. With a character draft already open, choose **Coterie &amp; Domain** → **Choose coterie JSON** and select The Lyric Night Shift file. Review the members, copied relationships, and Domain details before restoring it as a new plan.
3. Close the planner and check that the character and step are still open. Reopen the plan from **Saved plans**. Record any wording or restore behavior that made you unsure what the file contained or what would change.

For each issue, record the reviewer role, device or browser, the step, what they expected, and what happened. Put issues that prevented review or restore ahead of wording and navigation improvements.

### Internal walkthrough

Rehearsed both walkthroughs on 16 November 2026 in the Chromium production preview, including at a 390 px viewport. The default brief omitted identity and relationships, and the selected identity and motivation sections produced a download identical to the sample. The brief listed the remaining 6 XP as an open creation choice. The planner preview showed both members and only Mara’s copied relationships. The plan reopened after reload, and Mara’s draft remained at **Review & Print**. Importing the same plan again suggested a copy name. Cancelling left the open plan intact.

| Priority | Observation | Follow-up to test with reviewers |
| --- | --- | --- |
| 1 | The original brief preview put open rulings below the mechanics in the same scrolling field. | The preview now shows a separate **Open Rulings** list. [Preview verification](#storyteller-brief-preview-verification) |
| 2 | The original format error named the expected file but gave no route to the matching control. | Both controls now name the other tool and its file picker when they recognize a valid file. [Restore control verification](#json-restore-control-verification) |

### Storyteller brief preview verification

In the local production preview, Mara’s remaining 6 starting XP appeared in **Open Rulings** beside the Markdown at desktop width and above it at 390 × 844. The phone layout fit without horizontal overflow. The ruling was visible with the Markdown field at its initial scroll position.

Enter opened the preview and downloaded the brief. Tab and Space reached and toggled all five narrative options. Both downloaded files contained the same ruling shown in the preview, **Advantages & XP: Spend the remaining starting XP.** The default file omitted Mara’s identity and narrative. Enabling the options included her identity, motivations, Touchstone, sire, and custom Specialty name. The brief tests also check that a rejected purchase’s custom name appears in both the visible ruling data and the escaped Markdown only when selected.

### JSON restore control verification

In the local production preview, **Choose coterie JSON** identified Mara’s sample character backup and pointed to **Browser drafts → Choose JSON backup**. **Choose JSON backup** identified the sample coterie plan and pointed to **Coterie & Domain → Choose coterie JSON**. The matching inputs opened the normal previews.

Choosing malformed JSON in either input showed the JSON error. None of the four rejected selections opened a restore preview. The saved character stayed on **Relationships** with its Touchstone intact, and the coterie plan kept an unsaved shared purpose edit when reopened before reload. After reload, the character reopened at **Relationships** and the saved plan reopened with its original shared purpose. The library still held only the original plan.

### Review status

External walkthroughs are deferred. The sample files and internal findings are ready for review when this work resumes.

| Reviewer role | Status | Feedback |
| --- | --- | --- |
| Player | Deferred | Pending |
| Storyteller | Deferred | Pending |
