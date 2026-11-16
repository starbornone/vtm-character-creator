# Private Storyteller workspace scope

**Proposed first slice.** A private chronicle inbox for reviewing character handoffs. Today the player previews a Storyteller brief, downloads it, and hands it to the Storyteller. The workspace adds a place to see whether the current handoff is awaiting review, accepted, or needs changes. This scope uses the [internal walkthrough](release-verification.md#internal-walkthrough). External feedback is deferred.

## Smallest useful workflow

1. A Storyteller creates a named chronicle and invites a player. The invite is for that player, can be redeemed once, and can be revoked before use. Redeeming it creates membership.
2. The player opens their local character draft and previews a **Storyteller brief** for that chronicle. Mechanics and open rulings are included. Each narrative section starts unchecked. The preview names the recipient role and shows what that role can download. Sending creates a shared snapshot of the preview.
3. The Storyteller opens the chronicle inbox, reads the snapshot, and chooses **Accept** or **Request changes**. The Storyteller can leave one response, visible to the submitting player.
4. The player sees the response and updates their browser draft if needed. Sending a replacement requires a new preview, replaces the shared snapshot, clears the previous response, and returns the submission to **Awaiting review**. A review sent from an older open tab must refer to the current submission revision or ask the reviewer to reopen it.

The first slice has one owner Storyteller per chronicle and uses only app-generated briefs. Shared coterie editing, private GM notes, co-Storytellers, submission history, and live character sync are later work.

## Access and data control

| Action | Player | Storyteller |
| --- | --- | --- |
| Open the private chronicle | See its name and own submissions after accepting an invite. | Open chronicles they own and manage invitations and membership. |
| Read a handoff | See their current brief, status, and response. | See current submissions in the chronicle they own. |
| Change a handoff | Submit, replace, or withdraw their own shared copy. | Change review status and response. The submitted brief remains player-controlled. |
| Download | Export their own current handoff and review. | Export an individual handoff and its review from their chronicle. |
| Remove access or content | Withdraw a handoff or leave the chronicle. | Revoke an unused invite, remove a member, or delete the chronicle. |

The player controls the original character and which brief snapshot to share. The owner Storyteller manages chronicle settings, membership, and responses. Each submission holds one current snapshot and the information needed to route and review it. The workspace has no access to browser draft storage or the local coterie library. A submission is visible only to the submitting player and the chronicle’s owner. Authorization for a hosted implementation must check that relationship for each read, change, export, and deletion.

## Export and deletion

- **Export.** Both authorized readers can download the current submission as versioned JSON with the shared Markdown, status, and Storyteller response. The export contains one handoff. The preview tells the player the Storyteller can download it. The creator’s existing character JSON backup remains the way to transfer an editable character.
- **Withdraw.** Withdrawing deletes the shared snapshot and its review from the active workspace. The originating browser draft remains available. The player can send a new snapshot later while still a member.
- **Leave or remove a member.** Revoke access and remove that player’s submissions and associated reviews from the chronicle. Other members and their handoffs stay available. Previously issued invitations for the removed member must be revoked or invalidated. A later invitation starts a new membership.
- **Delete a chronicle.** After owner confirmation, remove the chronicle, memberships, invitations, submissions, and responses from the active workspace. Downloaded files remain with their recipients. Before using real data, document backup retention and check that recovering from a backup does not reopen deleted content or restore revoked access.

## Prototype walkthrough

Open **Handoff prototype** in the creator header. It uses fictional roles and the [review samples](release-verification.md#player-and-storyteller-handoff-review). The demo state lives in the current tab and resets on reload.

1. As **Storyteller**, invite Mara Vale and Rowan Pike. Switch to each player and accept their invitation.
2. As Mara, preview the brief and send it. As Rowan, check that Mara’s brief is absent from his view, then preview and send his own.
3. As the Storyteller, review both entries. Accept Rowan’s and request that Mara spend her remaining 6 XP.
4. As Mara, spend the sample XP on Drive, preview the replacement, and send it. The new snapshot returns to **Awaiting review**. The previous response is cleared.
5. Accept the replacement as the Storyteller. Download its handoff JSON and check the shared Markdown, status, and response. As Mara, confirm withdrawal. Check that Rowan’s handoff remains available.

The local browser walkthrough confirmed that each player saw only their own handoff, while the Storyteller reviewed both. Mara’s replacement showed 0 XP remaining and cleared the first review. The downloaded JSON contained the new review and mechanics without the identity section, which Mara had left unchecked on the replacement. Withdrawing removed Mara’s handoff and export from both views without affecting Rowan’s accepted handoff. Closing returned to the same creator step; reloading cleared the demo. No external participants were involved.

## Pilot decision

Keep the local prototype and defer a hosted pilot until a player and a Storyteller have reviewed the [sample handoffs](release-verification.md#player-and-storyteller-handoff-review). Use their feedback to decide whether a hosted inbox solves a problem that file handoffs leave open.

The role switcher is a demonstration, so a hosted pilot would also need authorization checks with separate accounts and two chronicles, including direct access to another player’s handoff, revoked access, stale reviews, and deletion after restore.
