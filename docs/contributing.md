# Contributing

Use an existing [roadmap item](../roadmap/roadmap.json) when its scope matches the change. For new work, describe the user need and a concrete acceptance check. For V5 rules or catalog changes, identify the book, printing or errata, and page behind the change. The [product plan](../PLAN.md) gives the first-release boundary.

Keep changes small enough to review. Update the README when the newcomer’s entry point or current status changes, and update the relevant docs when architecture, contributor workflow, or a supported format changes. Record a decision in [Decisions](decisions.md) when it changes the planned scope or an interchange contract.

Move a roadmap item in the same change as the work it describes. Keep its ID and append it to the appropriate history file with the timestamp. If a milestone lands in parts, leave the unfinished item pending or split it into distinct items with new IDs. See the [roadmap contract](roadmap-format.md) for the allowed fields and movement rules.

In a review, name the checks you ran and any rule cases or platform behavior that still need verification. See [Development](development.md) for the checks appropriate to this checkout.
