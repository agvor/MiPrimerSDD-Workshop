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
- Valid titles are stored as entered, including surrounding whitespace.
- If the key is absent, the repository loads an empty task collection.
- If the stored value is not valid JSON, is not an array, or contains an invalid task or duplicate id, loading fails with a user-visible error. The repository must preserve the stored value and must not silently return an empty collection.
- If reading from localStorage fails, loading fails with a user-visible error.
- While loading has failed, task changes must be unavailable so the application cannot overwrite the unreadable or invalid stored value.
- A failed save must be surfaced to the user as an error and must not be reported as success.
