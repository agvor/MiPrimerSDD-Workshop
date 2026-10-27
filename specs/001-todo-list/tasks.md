# Tasks: Curso-PSWE-07 To-Do List

**Input**: Design documents from `/specs/001-todo-list/`

**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`, `research.md`, `contracts/task-storage-contract.md`, and `quickstart.md`

**Tests**: Included because the project constitution requires test-first production changes, business-logic unit tests, and an acceptance test for each user story.

**Organization**: Tasks are grouped by user story. Each story phase has its own acceptance criteria and implementation tasks.

## Phase 1: Setup

**Purpose**: Initialize the planned client-side React application and its dependencies.

- [x] T001 Initialize the Vite React/TypeScript application, npm scripts, and required dependencies; configure the ESLint lint script in `package.json`, `eslint.config.js`, `index.html`, `src/main.tsx`, and the root TypeScript configuration files

---

## Phase 2: Foundational

**Purpose**: Establish shared test infrastructure and task/repository contracts needed by all stories.

- [x] T002 [P] Configure Vitest, jsdom, and Testing Library in `vite.config.ts` and `tests/setup.ts`
- [x] T003 [P] Define the `Task`, `TaskStatus`, and `TaskFilter` types in `src/features/tasks/models/task.ts` with a unique string id, a string title that must be non-empty after trimming whitespace but preserves the entered value, an optional description that allows an empty string, and a `pending` or `done` status defaulting to `pending`
- [x] T004 Define the replaceable task repository interface in `src/features/tasks/task-repository.ts` for loading and saving the full task collection

**Checkpoint**: Shared task types, repository boundary, and test runner are ready before story implementation.

---

## Phase 3: User Story 1 - Add and find tasks (Priority: P1)

**Goal**: Create pending tasks, find them in the list, open a task, and filter by All, Pending, and Done.

**Independent Test**: Add tasks with and without descriptions, verify new tasks are Pending, open a task, switch between all three filters, and verify both empty states and completed-row styling.

### Tests for User Story 1

- [x] T005 [P] [US1] Add unit tests for rejecting empty or whitespace-only titles and accepting non-empty titles in `tests/unit/task-validation.test.ts`
- [x] T006 [P] [US1] Add list acceptance tests for the exact no-task and no-match messages, task creation with title preservation and Pending status, task-row opening, all three filters, active-filter indication, completed-row styling, app/window naming, light background, single font and accent color, title hierarchy, and an assertion that no account, category, due-date, priority, search, or sync UI/flow is exposed in `tests/integration/task-list.test.tsx`
- [x] T006A [P] [US1] Add unit tests for task collection loading, creation with Pending status, filter results, and selected-task state in `tests/unit/task-list-actions.test.ts`

### Implementation for User Story 1

- [x] T007 [US1] Implement required-title validation in `src/features/tasks/validation/task-validation.ts` so blank or whitespace-only titles are rejected with a user-facing validation message
- [x] T008 [US1] Implement the initial in-memory `TaskRepository` adapter in `src/features/tasks/in-memory-task-repository.ts` for the working list increment
- [x] T009 [US1] After T006A's tests are written and confirmed failing, implement task loading, creation with `pending` status, list filtering, and task selection in `src/features/tasks/hooks/use-tasks.ts`
- [x] T010 [US1] Implement the reusable add-task form with title validation, preservation of valid entered titles, and optional description in `src/features/tasks/components/task-form.tsx`
- [x] T011 [US1] Implement the task list, visible Add task action, status indicators, All/Pending/Done filters, and distinct no-task/no-match empty states in `src/app/screens/task-list-screen.tsx`
- [x] T012 [US1] Wire the list and task-opening navigation, display “Curso-PSWE-07” in the list header and window title, and implement the light responsive visual system and specified contrast and 44x44 CSS px target sizes in `src/app/app.tsx`, `src/styles/app.css`, and `index.html`

**Checkpoint**: The list increment is independently testable for adding, opening, filtering, empty states, and task-row appearance.

---

## Phase 4: User Story 2 - Review and maintain a task (Priority: P1)

**Goal**: View task details, edit and cancel changes, toggle completion in both directions, and confirm or cancel deletion.

**Independent Test**: Open a task, verify its title, description or “No description,” status, and back control; edit and save valid fields; cancel edits; reject a blank title; toggle status both ways; and verify confirmed and canceled deletion outcomes.

### Tests for User Story 2

- [x] T013 [P] [US2] Add task-maintenance acceptance tests for detail display, edit/save/cancel, validation feedback, completion toggles, and confirmed/canceled deletion in `tests/integration/task-maintenance.test.tsx`
- [x] T014 [P] [US2] Add unit tests for task update, pending/done transitions, and removal behavior in `tests/unit/task-actions.test.ts`

### Implementation for User Story 2

- [x] T015 [US2] Implement task update, completion toggle, and removal operations in `src/features/tasks/hooks/use-tasks.ts`
- [x] T016 [US2] Implement the task detail screen with a back control, prominent title, optional-description placeholder, status label, Edit action, status-toggle label, and Delete action in `src/app/screens/task-detail-screen.tsx`
- [x] T017 [US2] Add edit mode to the task detail screen using the reusable form, prefilled title and description, preservation of valid entered titles, Save, and Cancel behavior in `src/app/screens/task-detail-screen.tsx`
- [x] T018 [US2] Implement a warning-colored delete confirmation with confirm and cancel behavior in `src/features/tasks/components/delete-task-dialog.tsx` and connect it to `src/app/screens/task-detail-screen.tsx`

**Checkpoint**: Task detail and maintenance behaviors are independently testable against the task list created in User Story 1.

---

## Phase 5: User Story 3 - Keep tasks between visits (Priority: P1)

**Goal**: Retain the latest saved task collection across application close/reopen and report save failures without indicating success.

**Independent Test**: Create, edit, complete, and delete tasks; recreate the application against the same browser storage; verify saved fields and status remain and confirmed deletions stay absent; force a storage failure and verify the user receives an error without a success result.

### Tests for User Story 3

- [x] T019 [P] [US3] Add local-storage repository unit tests for the `curso-pswe-07.tasks` key, full-collection writes, required task fields, unique ids, allowed statuses, malformed or unreadable stored data without overwrite, and visible load/save failures in `tests/unit/task-store.test.ts`
- [x] T020 [P] [US3] Add persistence acceptance tests covering create, edit, status change, confirmed deletion, application reinitialization, save failure, and safe handling of malformed or unreadable stored data in `tests/integration/task-persistence.test.tsx`

### Implementation for User Story 3

- [x] T021 [US3] Implement the local-storage `TaskRepository` in `src/lib/storage/local-task-repository.ts` using key `curso-pswe-07.tasks`, validating stored collections, preserving invalid or unreadable data without treating it as empty, and surfacing load/save errors
- [x] T022 [US3] Wire the local-storage repository into the application and task hook, replace the in-memory production default, display load/save errors without success feedback, and prevent task changes from overwriting data that failed to load in `src/app/app.tsx` and `src/features/tasks/hooks/use-tasks.ts`

**Checkpoint**: The completed task flows retain their latest saved state across reinitialization and expose persistence errors clearly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Align the validation guide with the finished application and verify the complete feature.

- [x] T023 Update setup commands and document the lint check alongside manual acceptance checks for US1 scenarios 7-9, exact empty-state messages, absence of the FR-020 excluded features, app/window naming, visual hierarchy, 375x667 and 1440x900 layouts without horizontal scrolling, the FR-018 large-text cutoff and contrast/target-size measurement procedure, persistence, malformed-storage handling, and feature validation steps in `specs/001-todo-list/quickstart.md`
- [x] T024 Run the configured lint, test, and build scripts from `package.json` and complete the validation scenarios in `specs/001-todo-list/quickstart.md`, resolving any failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; complete before configuring tests or implementing features.
- **Foundational (Phase 2)**: Depends on Setup; shared test infrastructure and task/repository contracts block story work.
- **User Stories (Phases 3-5)**: Depend on the Foundational phase and proceed in the order below because task maintenance extends the list/task selection flow, and persistence must cover the completed create/edit/status/delete flows.
- **Polish (Phase 6)**: Depends on all three user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after the Foundational phase; no dependency on another user story.
- **US2 (P1)**: Depends on US1's task list, selection, shared form, and task state.
- **US3 (P1)**: Depends on US1 and US2 so persisted state covers creation, editing, completion changes, and deletion.

### Within Each User Story

- Write and run the story's tests before its implementation tasks.
- For US1, T006A must be written and confirmed failing before T009 begins; T009 also follows T007 and T008.
- Complete validation and repository prerequisites before the task hook and UI integration that consume them.
- Keep each story independently testable at its checkpoint.

## Parallel Opportunities

- **Foundational**: T002 and T003 can run in parallel after T001; T004 follows T003.
- **US1**: T005 and T006 can run in parallel. After both tests are written and confirmed failing, T007 and T008 can be implemented in parallel; T009 follows both.
- **US2**: T013 and T014 can run in parallel. After T015, implement T016; then T017 adds edit mode and T018 connects delete confirmation to the detail screen.
- **US3**: T019 and T020 can be authored in parallel after US2. T021 follows the repository unit tests, and T022 follows T021 and the persistence acceptance tests.

## Parallel Examples

### User Story 1

```text
Run T005 and T006 in parallel to establish unit and list acceptance coverage.
After both tests are written and confirmed failing, implement T007 and T008 in parallel; continue with T009 after both.
```

### User Story 2

```text
Run T013 and T014 in parallel to establish acceptance and task-action unit coverage.
After T015, implement T016; then add edit mode in T017 and complete delete-dialog integration in T018.
```

### User Story 3

```text
Run T019 and T020 in parallel to establish storage unit and persistence acceptance coverage.
Implement T021 after T019, then wire the tested repository and error feedback in T022.
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Setup and Foundational phases.
2. Complete US1 and validate adding, opening, and filtering tasks independently.
3. Stop at the US1 checkpoint for the initial MVP; task changes will not yet survive application reinitialization.

### Incremental Delivery

1. Complete US1 for a usable task list.
2. Complete US2 for editing, completion changes, and confirmed deletion.
3. Complete US3 to persist all task operations and surface storage errors.
4. Complete Polish and run the lint, test, build, and quickstart validations.
