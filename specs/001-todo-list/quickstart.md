# Quickstart: Curso-PSWE-07 Validation Guide

## Prerequisites

- Node.js 18+ or 20+
- npm
- A modern browser such as Chromium, Firefox, or Safari

## Setup

1. Open the project in the app root.
2. Install dependencies: `npm install`
3. Start the app: `npm run dev`
4. Confirm the browser loads the task list screen and shows the app title, "Curso-PSWE-07".

## Validation scenarios

### 1. Create and inspect a task
- Add a task with a title only.
- Confirm the task appears in the list with a Pending status chip.
- Select the task to open the detail view.
- Confirm the title, description placeholder, and status label are visible.

### 2. Edit, complete, and restore
- Edit the task title and description using the reusable form.
- Save valid changes and confirm the updated data appears in both the list and the detail view.
- Toggle the task to Done and verify the action label changes to Mark as not done.
- Toggle back to Pending and verify the status label and button text update.

### 3. Filter and empty states
- Add a mix of pending and done tasks.
- Switch between `All`, `Pending`, and `Done` filters and confirm only matching tasks are shown.
- Clear the task list and verify the no-tasks empty state is visible.
- Apply a filter with no matches and confirm the no-matching-tasks empty state is displayed.

### 4. Validate delete flow
- Open a task and select Delete.
- Confirm the delete confirmation appears before removal.
- Cancel the confirmation and verify the task remains unchanged.
- Confirm the delete and verify the task disappears and the list returns to the prior view.

### 5. Persistence and accessibility
- Close the application or refresh the browser.
- Confirm all saved tasks remain available and the last saved status is preserved.
- Verify controls are at least 44x44 px, text contrast meets the accessibility target, and the layout remains usable on narrow and wide screens.
