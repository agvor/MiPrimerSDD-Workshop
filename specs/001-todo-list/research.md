# Research: Curso-PSWE-07 To-Do List

## Decision

Use a lightweight client-side web application with React + TypeScript and browser localStorage persistence for a single-user task list. The app will expose two primary screens: a task list view and a task detail/edit view, with all filtering and status logic running in the browser.

## Rationale

- The feature requirement is focused on a single-user local organizer, not an account-based or synchronized service.
- Browser localStorage aligns directly with the requirement that tasks remain available after the app is closed and reopened.
- A simple client-side architecture keeps the implementation small, testable, and aligned with the constitution's simplicity-first rules.
- Responsive UI behavior and accessibility constraints are easier to enforce in a single front-end app than in a more complex multi-tier architecture.

## Alternatives considered

### Option 1: Backend + database service
- Pros: more durable persistence and potential multi-device sync.
- Cons: introduces server infrastructure, authentication, and deployment complexity that the spec explicitly excludes.
- Decision: rejected because it violates the requirement to avoid sync, accounts, and server setup for a single-user local task organizer.

### Option 2: Native mobile application
- Pros: strong mobile UX and native controls.
- Cons: requires a platform build pipeline and more setup than the brief requires.
- Decision: rejected as unnecessarily heavy for a small, responsive task list with no cross-device sync requirement.

### Option 3: No persistence layer
- Pros: simplest possible implementation.
- Cons: violates FR-014 and the core user story about preserving tasks after close/reopen.
- Decision: rejected because task retention is a mandatory requirement.
