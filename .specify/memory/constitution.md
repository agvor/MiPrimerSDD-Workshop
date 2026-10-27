<!--
Sync Impact Report
Version change: unversioned template -> 1.0.0 (initial adoption)
Principles established:
- I. SIMPLICITY FIRST (YAGNI)
- II. SIMPLE, CLEAR DESIGN
- III. STRUCTURED ARCHITECTURE
- IV. TEST-DRIVEN DEVELOPMENT (NON-NEGOTIABLE)
- V. SPEC IS THE SOURCE OF TRUTH
- VI. DEPENDENCIES AND QUALITY
Added sections:
- Dependencies and Quality
- Development Workflow
Removed sections: None
Follow-up TODOs:
- RATIFICATION_DATE: Original adoption date is unknown.
-->
# Curso-PSWE-07 Constitution

## Core Principles

### I. SIMPLICITY FIRST (YAGNI)
Implement only what the spec requires. Choose the simplest solution that works. MUST NOT add
unrequested features, abstractions, configuration, or dependencies; plans MUST justify added
complexity in writing. Rationale: focused scope reduces maintenance and avoids speculative work.

### II. SIMPLE, CLEAR DESIGN
Functions and modules MUST be small and single-responsibility; names MUST reveal intent. Duplication
MUST be removed only when behavior is genuinely shared; single-use abstractions and premature
optimization MUST NOT be introduced. Rationale: clear structure keeps changes understandable.

### III. STRUCTURED ARCHITECTURE
Code MUST separate UI, application logic, and persistence, with dependencies flowing UI → logic →
persistence. UI MUST NOT access storage directly; persistence MUST be hidden behind a small,
replaceable interface that tests can fake. Rationale: one-way dependencies isolate changes and tests.

### IV. TEST-DRIVEN DEVELOPMENT (NON-NEGOTIABLE)
Production code MUST follow Red-Green-Refactor: write a failing test, implement the minimum to pass,
then refactor. Every production change MUST be required by a test; business logic MUST have unit
tests, and each user story MUST have an acceptance test matching its scenarios. Tests MUST be fast
and independent. Rationale: tests establish behavior before implementation and prevent regressions.

### V. SPEC IS THE SOURCE OF TRUTH
Every implementation task MUST trace to a spec requirement; anything unspecified is out of scope.
Ambiguous requirements MUST be clarified before implementation. Rationale: traceability prevents
unapproved scope and incorrect assumptions.

## Dependencies and Quality

### VI. DEPENDENCIES AND QUALITY
Prefer the standard library and platform features. A third-party dependency MUST clearly remove more
complexity than it adds. Code MUST pass linting and all tests before completion. Rationale: fewer
dependencies and enforced quality gates reduce risk and maintenance cost.

## Development Workflow

Plans MUST include a "Constitution Check" that verifies these principles before implementation
begins.

## Governance

This constitution overrides other practices. Amendments MUST document their rationale and impact
and receive approval in project review before taking effect. Every amendment MUST bump the
MAJOR.MINOR.PATCH version: MAJOR for incompatible changes, MINOR for new or materially expanded
principles, and PATCH for non-semantic clarification. Plans and implementation reviews MUST verify
compliance; violations MUST be resolved or approved through an amendment before completion.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2026-10-26
