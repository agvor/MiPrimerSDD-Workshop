# Data Model: Curso-PSWE-07

## Entity: Task

| Field | Type | Required | Rules |
|---|---|---:|---|
| id | string | Yes | Unique identifier generated when a task is created. |
| title | string | Yes | Must be non-empty after trimming whitespace; preserve the entered value when valid. |
| description | string | No | Optional; empty string allowed and shown as “No description”. |
| status | enum | Yes | `pending` or `done`; default is `pending` for new tasks. |
| createdAt | string | No | ISO timestamp for tracking creation ordering. |
| updatedAt | string | No | ISO timestamp for the last save operation. |

## Relationships

- A task belongs to the single-user list maintained by the app; no user, category, or sync models are included.
- The list view is derived from the task collection by filtering on `status`.

## Validation rules

- `title` must be present after `trim()`, otherwise the app prevents save and shows a validation message.
- A valid title is stored as entered, including surrounding whitespace.
- `description` may be blank; in the detail view it is rendered as muted “No description” text.
- `status` must be either `pending` or `done`.
- On save, the app must persist the latest title, description, and status state.

## State transitions

- New task: `pending`.
- Pending -> Done: user toggles completion from the detail view.
- Done -> Pending: user toggles completion back from the detail view.
- Delete: remove task record from the collection and return to the task list.

## Derived view model

### Filter values
- `all` - include all tasks
- `pending` - only tasks with `status === 'pending'`
- `done` - only tasks with `status === 'done'`

### UI rendering rules
- Task rows display a status indicator and title.
- Done titles appear struck through and muted.
- Empty state messaging differs between “no tasks at all” and “no tasks match the active filter”.
