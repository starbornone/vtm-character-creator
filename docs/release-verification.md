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

Player and Storyteller feedback on a sample handoff remains pending.
