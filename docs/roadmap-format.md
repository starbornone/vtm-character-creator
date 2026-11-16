# Roadmap format contract

Import `name-roadmap/v1` from the repository’s `roadmap/` directory. Each file is a UTF-8 JSON object with two-space indentation and the same top-level fields. Keep all three files present, using `"items": []` for an empty file.

| File | `file` value | Item order |
| --- | --- | --- |
| `roadmap.json` | `roadmap` | Work still to do, highest priority first. |
| `completed.json` | `completed` | Finished work, appended as it lands. |
| `cancelled.json` | `cancelled` | Dropped work, appended as it is dropped. |

## Fields and limits

| Field | Rule |
| --- | --- |
| `schema` | Required string with the exact value `name-roadmap/v1`. |
| `file` | Required string matching the filename without `.json`. |
| `updatedAt` | Required ISO 8601 timestamp with an explicit numeric UTC offset. Refresh it in every changed file. |
| `project` | Required object. `key` is permanent lowercase kebab-case. `key`, `title`, and `status` must match in all three files. `status` is `active`, `paused`, or `complete`. `summary` is an optional string allowed in `roadmap.json`. |
| `items` | Required array containing at most 2,000 objects. |
| `items[].id` | Required permanent lowercase kebab-case string, unique across the three files. |
| `items[].title` | Required short imperative title of at most 500 characters. |
| `items[].group` | Optional string naming the work area. |
| `items[].notes` | Optional string of at most 20,000 characters. |
| `items[].completedAt` | Required in `completed.json`. Use an ISO 8601 timestamp with an explicit numeric UTC offset. |
| `items[].cancelledAt` | Required in `cancelled.json`. Use an ISO 8601 timestamp with an explicit numeric UTC offset. |
| `items[].reason` | Optional in `cancelled.json`, at most 20,000 characters. Supply a brief reason when dropping work. |

Include only the listed fields and each item’s applicable status fields. Use strings for IDs, titles, dates, and descriptive fields. JSON comments and trailing commas are invalid.

## Moving items

- Finish an item by moving it from `roadmap.json` to the end of `completed.json` and adding `completedAt`. Move it in the same change that delivers the work.
- Drop an item by moving it to the end of `cancelled.json` and adding `cancelledAt` and a short `reason`. Remove any completion timestamp when moving a previously completed item.
- Reopen an item by moving it to the appropriate priority in `roadmap.json`, keeping the ID, and removing its previous status fields.
- Keep exactly one copy of each item across the files. Retain the ID through all moves. Edit titles or notes for clarity. Use fresh IDs for distinct work when splitting an item, and retain a disposition for the original item.
- Set `updatedAt` on both the source and destination files. When project metadata changes, update all three files together and preserve the project key.

## Minimal examples

These three example files form one valid roadmap. The example uses populated arrays to show each category’s item fields.

**`roadmap.json`**

```json
{
  "schema": "name-roadmap/v1",
  "file": "roadmap",
  "updatedAt": "2026-10-14T09:30:00+11:00",
  "project": {
    "key": "example-project",
    "title": "Example Project",
    "status": "active"
  },
  "items": [
    {
      "id": "verify-print-preview",
      "title": "Verify the print preview"
    }
  ]
}
```

**`completed.json`**

```json
{
  "schema": "name-roadmap/v1",
  "file": "completed",
  "updatedAt": "2026-10-14T09:30:00+11:00",
  "project": {
    "key": "example-project",
    "title": "Example Project",
    "status": "active"
  },
  "items": [
    {
      "id": "write-project-overview",
      "title": "Write the project overview",
      "completedAt": "2026-10-14T09:30:00+11:00"
    }
  ]
}
```

**`cancelled.json`**

```json
{
  "schema": "name-roadmap/v1",
  "file": "cancelled",
  "updatedAt": "2026-10-14T09:30:00+11:00",
  "project": {
    "key": "example-project",
    "title": "Example Project",
    "status": "active"
  },
  "items": [
    {
      "id": "publish-a-sample-build",
      "title": "Publish a sample build",
      "cancelledAt": "2026-10-14T09:30:00+11:00",
      "reason": "The example is now part of the guide."
    }
  ]
}
```

See [AGENTS.md](../AGENTS.md) for the project workflow and its [current roadmap](../roadmap/roadmap.json) for live data.
