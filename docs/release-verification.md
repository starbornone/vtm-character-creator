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
| 1 | The brief preview is a scrolling Markdown field. On mobile, the open rulings sit below the mechanics in the same field. | Check how quickly the Storyteller finds the unresolved XP choice. If it is easy to miss, make **Open Rulings** easier to reach from the preview. |
| 2 | Giving the planner a character JSON backup produces a format error that names the expected file but gives no route back to **Browser drafts**. | Check whether reviewers can tell the two JSON files apart. If they choose the wrong file, point them to the matching restore control. |

### Review status

External walkthroughs are deferred. The sample files and internal findings are ready for review when this work resumes.

| Reviewer role | Status | Feedback |
| --- | --- | --- |
| Player | Deferred | Pending |
| Storyteller | Deferred | Pending |
