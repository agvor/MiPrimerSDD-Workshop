# Feature Specification: Curso-PSWE-07 To-Do List

**Feature Branch**: Not created

**Created**: 2026-10-26

**Status**: Draft

**Input**: User description: "Build a simple to-do list application named Curso-PSWE-07 for organizing daily tasks. Provide a To-Do List screen for adding, opening, and filtering tasks by All, Pending, and Done, and a To-Do Detail screen for viewing, editing, completing, and deleting a task. Tasks have a required title, optional description, and done/not-done status, and must persist after the application is closed and reopened. Use a clean, minimal, responsive design with a light background, generous white space, one sans-serif font, one accent color, readable contrast, and controls at least 44x44 px. Show the app name in the list header and application/window title. List rows show status and title; completed titles are struck through and muted. Include friendly empty states, a visible Add task action, a detail back control, status label, Edit, completion toggle, and warning-colored Delete with confirmation. Reuse the add form for editing, with Save and Cancel; reject an empty title with a validation message. Do not include accounts, categories, due dates, priorities, search, or sync."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add and find tasks (Priority: P1)

As a user, I want to add tasks and find them in a list so I can keep track of the work I need to do.

**Why this priority**: Creating and finding tasks is the core purpose of the application.

**Independent Test**: Add tasks with and without descriptions, open a task, and use each list filter to confirm the displayed task set.

**Acceptance Scenarios**:

1. **Given** the To-Do List screen has no tasks, **When** the user opens it, **Then** the message “No tasks yet. Add a task to get started.” and a clearly visible Add task action are shown.
2. **Given** the user chooses Add task, **When** they enter a non-empty title and optionally a description and save, **Then** a task with Pending status is created and appears in the list.
3. **Given** a task has been added, **When** the user selects its row, **Then** its To-Do Detail screen opens.
4. **Given** the list contains pending and done tasks, **When** the user selects All, Pending, or Done, **Then** the list shows all tasks, only pending tasks, or only done tasks, respectively, and highlights the active filter.
5. **Given** no tasks match the selected filter, **When** the filtered list is shown, **Then** the message “No tasks match this filter.” is shown without implying that tasks were deleted.
6. **Given** a task is done, **When** it appears in the list, **Then** its title is struck through and muted, and a status indicator remains visible.
7. **Given** the application is viewed at a 375x667 mobile viewport or a 1440x900 desktop viewport, **When** either screen is displayed, **Then** the app name appears in the list header and application/window title, the layout remains usable without horizontal scrolling, and all required actions remain available.
8. **Given** either screen is displayed, **When** the user views its content, **Then** the light background, single sans-serif font, single accent color for primary actions and the active filter, and larger, bolder titles are consistently applied.
9. **Given** either screen is displayed, **When** the user measures its text and interactive targets, **Then** normal-sized text has at least 4.5:1 contrast, large text (at least 24 CSS px, or at least 18.66 CSS px when bold) has at least 3:1 contrast, and interactive targets measure at least 44x44 CSS px.

### User Story 2 - Review and maintain a task (Priority: P1)

As a user, I want to review, edit, complete, restore, or delete a task so its details and status stay current.

**Why this priority**: Changing task details and completion is necessary to keep a daily task list useful.

**Independent Test**: Open a task, inspect its details and status, edit and save it, change its completion status in both directions, and confirm deletion.

**Acceptance Scenarios**:

1. **Given** a task is open, **When** the detail screen is displayed, **Then** it shows the prominent title, description or muted “No description” text, a Done or Pending status label, and a back control.
2. **Given** a task is pending, **When** the user chooses Mark as done, **Then** it becomes done and the available action changes to Mark as not done.
3. **Given** a task is done, **When** the user chooses Mark as not done, **Then** it becomes pending and the available action changes to Mark as done.
4. **Given** the user chooses Edit on the detail screen, **When** the screen enters edit mode, **Then** it shows the reusable form with the current title and description and offers Save and Cancel.
5. **Given** the user changes task fields, **When** they save with a non-empty title, **Then** the updated details are displayed; **When** they cancel, **Then** the unsaved changes are discarded.
6. **Given** the user enters an empty or whitespace-only title, **When** they save, **Then** the task is not saved and a title-required validation message is shown.
7. **Given** a task is open, **When** the user chooses Delete, **Then** a confirmation is requested before deletion; confirming removes the task and returns to the list, while canceling leaves the task unchanged.

### User Story 3 - Keep tasks between visits (Priority: P1)

As a user, I want my task list and changes to remain available after closing and reopening the application so I can rely on it over time.

**Why this priority**: Losing tasks on close would defeat the application's purpose as a daily organizer.

**Independent Test**: Add, edit, complete, and delete tasks, close and reopen the application, and check that all remaining tasks retain their last saved details and status.

**Acceptance Scenarios**:

1. **Given** the user has added or changed tasks, **When** the application is closed and reopened, **Then** the latest saved titles, descriptions, and statuses are present.
2. **Given** the user confirmed deletion of a task, **When** the application is closed and reopened, **Then** the deleted task remains absent.
3. **Given** a task change cannot be saved, **When** the save fails, **Then** the user is told it was not saved and is not shown a success result.
4. **Given** saved task data is malformed or the stored collection cannot be read, **When** the application loads, **Then** it reports that the tasks could not be loaded, preserves the stored value, and does not present an empty list or allow task changes to overwrite the unreadable data.

### Edge Cases

- An empty or whitespace-only title is rejected on both task creation and editing; the user receives a clear validation message.
- A task with no description can be created and edited, and its detail view displays muted “No description” text.
- Canceling the delete confirmation leaves the selected task unchanged.
- A filter with no matching tasks shows an empty state without implying that tasks were deleted.
- If a task cannot be saved, the application clearly reports the failure and does not indicate that the change succeeded.
- If saved task data is malformed or cannot be read, the application reports a load error, preserves the stored value, and does not treat the collection as empty or allow writes that could overwrite it.
- At 375x667 and 1440x900 viewports, the two screens remain usable without horizontal scrolling and controls continue to meet the minimum target size.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST provide a To-Do List screen and a To-Do Detail screen.
- **FR-002**: The To-Do List screen MUST show tasks and provide a clearly visible Add task action that opens a form with title and description fields.
- **FR-003**: Each task MUST have a required title, an optional description, and a completion status of Done or Pending.
- **FR-004**: The application MUST reject an empty or whitespace-only title on create or edit and show a validation message.
- **FR-005**: A newly created task MUST have Pending status.
- **FR-006**: Each task row MUST show a status indicator and title; a Done task's title MUST be struck through and shown in a muted color.
- **FR-007**: The list MUST provide All, Pending, and Done filters, highlight the active filter, and show only matching tasks.
- **FR-008**: When the task collection is empty, the list MUST show “No tasks yet. Add a task to get started.” When the active filter returns no results, it MUST show “No tasks match this filter.” without implying that tasks were deleted.
- **FR-009**: Selecting a task row MUST open the detail screen for that task.
- **FR-010**: The detail screen MUST show the task title, its description or muted “No description” text, its Done or Pending status, and a back control.
- **FR-011**: The detail screen MUST provide Edit, a status-toggle action labeled Mark as done or Mark as not done according to the current status, and Delete.
- **FR-012**: The edit form MUST reuse the title and description fields, offer Save and Cancel, save valid changes, and discard unsaved changes on cancel.
- **FR-013**: Delete MUST use a distinct warning color and require explicit confirmation before removing a task.
- **FR-014**: The application MUST retain task creation, edits, status changes, and confirmed deletions after the application is closed and reopened.
- **FR-015**: The application MUST clearly report when a task change cannot be saved and MUST NOT present an unsuccessful save as successful.
- **FR-016**: The application/window title and the To-Do List header MUST display “Curso-PSWE-07”.
- **FR-017**: The interface MUST use a light background, generous whitespace, one sans-serif font family, and a single accent color for primary actions and the active filter; titles MUST be larger and bolder than descriptions.
- **FR-018**: Text MUST meet a contrast ratio of at least 4.5:1 for normal-sized text and 3:1 for large text; for this requirement, large text means at least 24 CSS px, or at least 18.66 CSS px when bold. Interactive targets MUST be at least 44x44 CSS px.
- **FR-019**: Both screens MUST adapt for mobile and desktop layouts while remaining usable.
- **FR-020**: The application MUST NOT include accounts, categories, due dates, priorities, search, or synchronization.
- **FR-021**: If the saved task collection cannot be read or fails validation, the application MUST report a load error, preserve the stored value, and prevent task changes from overwriting that data.

### Key Entities *(include if feature involves data)*

- **Task**: A daily task with a required title, optional description, and Done or Pending completion status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

SC-001, SC-002, SC-004, and SC-006 are post-launch usability outcome targets, not release acceptance gates. Evaluate them with participants who have not previously used the application. Give each participant the specified task without moderator prompts; record task completion and elapsed time. For SC-006, ask participants whether each named interface element is clear and count “yes” responses. Report participant counts and numerators/denominators with the results.

- **SC-001**: At least 90% of first-time users can add a task and open its details without assistance within two minutes.
- **SC-002**: At least 90% of users can change a task's status and find it with the corresponding filter without assistance within one minute.
- **SC-003**: In all acceptance tests, every successfully saved addition, edit, status change, and deletion is reflected correctly after the application is closed and reopened.
- **SC-004**: At least 90% of users can edit a task and complete or cancel a confirmed deletion without assistance within two minutes.
- **SC-005**: At 375x667 and 1440x900 CSS-pixel viewports, every interactive target measures at least 44x44 CSS px, normal text has at least 4.5:1 contrast and large text at least 3:1 (large text is at least 24 CSS px, or at least 18.66 CSS px when bold), and both screens remain usable without horizontal scrolling.
- **SC-006**: At least 90% of usability-test participants report that task status, the active filter, validation messages, and delete confirmation are clear.

## Assumptions

- The application serves one user's task list; accounts, sharing, and collaboration are out of scope.
- Tasks are retained for the same application installation after normal close and reopen; cross-device access and synchronization are not required.
- A newly created task is Pending.
- Titles containing only whitespace are invalid; valid titles are saved as entered, including surrounding whitespace. No further title or description length restrictions are introduced.
- “Done” means complete and “Pending” means not complete.
- The application includes only the two requested screens and the described task-management behaviors; features not requested are out of scope.
