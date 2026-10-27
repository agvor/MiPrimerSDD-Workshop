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

## Visual design tokens and measurable acceptance criteria

Use the following explicit design baseline so the visual requirements are verifiable in implementation and manual review:

- Background: light neutral surface using a warm white or very light gray (`#F7F7F5` to `#FFFFFF`), with generous whitespace between sections and cards.
- Typography: one sans-serif family only, such as `"Segoe UI", "Inter", "Helvetica Neue", Arial, sans-serif`.
- Accent color: one primary accent used for primary actions and the active filter, chosen from an accessible blue or teal range such as `#2563EB`.
- Text hierarchy: page titles and section headers are larger and bolder than task titles and description text; use a clear visual scale with title text at least 1.5rem and body text at 1rem.
- Status treatment: completed tasks are rendered with a muted text color and a strike-through title, while pending tasks keep the normal foreground color.
- Focus and hit target: all interactive controls must be at least 44x44 px and not rely on a 1px border to be clickable.
- Contrast: normal text must be at least 4.5:1; large text must be at least 3:1; the accent color and neutral text must meet those thresholds in both light and filtered states.
- Layout: both screens remain usable at 375x667 and 1440x900 without horizontal scrolling; content stacks cleanly and actions remain reachable.

## Usability test protocol

Use a short first-time-user study to verify the measurable criteria in SC-001 through SC-006.

- Recruit 10 or more first-time participants who have not used the app before.
- Give each participant the same task scenarios in a fixed order without moderator coaching: add a task, open it, change its status, use the filter, edit a task, and confirm delete.
- Record completion success, time to completion, and whether the user reached the correct list or detail state without prompting.
- For SC-001, SC-002, and SC-004, treat the task as successful only when the participant completes the step without assistance and within the stated time window.
- For SC-006, ask each participant to answer yes/no on whether task status, active filter, validation messages, and delete confirmation are clear; report `yes / total` as the numerator/denominator in the final results.
- Record accessibility checks using browser devtools or a contrast checker: verify the required contrast ratios and 44x44 px interactive target sizes, then confirm the app remains usable at both mobile and desktop viewports.
- Include an error-path check for malformed or unreadable storage data and record whether the app communicates the problem without presenting a false success state.

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
- Verify the persistence tests cover missing storage as an empty collection, and malformed, invalid, or unreadable storage as a visible load error that preserves stored data and prevents task changes.
- Confirm the list header and browser window title both display "Curso-PSWE-07".
- Verify the light background, single sans-serif font, accent color usage, and larger, bolder titles.
- At 375x667 and 1440x900 viewport sizes, verify both screens remain usable without horizontal scrolling and all required actions remain available.
- Measure interactive targets to confirm each is at least 44x44 px; verify normal text contrast is at least 4.5:1 and large text contrast is at least 3:1.
