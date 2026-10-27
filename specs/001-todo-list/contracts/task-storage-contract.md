# Task Storage Contract

## Scope

This app persists task data locally in the browser. There is no server API or synchronization layer.

## Storage key

`curso-pswe-07.tasks`

## Stored value

The value stored at the key is a JSON array of task objects.

```json
[
  {
    "id": "task-123",
    "title": "Write project update",
    "description": "Share the status with the team.",
    "status": "pending",
    "createdAt": "2026-10-26T10:00:00.000Z",
    "updatedAt": "2026-10-26T10:00:00.000Z"
  }
]
```

## Contract rules

- The top-level value must be an array.
- Each task object must contain a unique `id` and a non-empty trimmed `title`.
- `description` may be omitted or empty; the UI renders it as “No description”.
- `status` must be `pending` or `done`.
- On every save, the app overwrites the full collection with the latest array.
- When a delete is confirmed, that task record is removed from the array.

## Validation behavior

- Empty or whitespace-only titles are rejected before saving.
- A failed save must be surfaced to the user as an error and must not be reported as success.
