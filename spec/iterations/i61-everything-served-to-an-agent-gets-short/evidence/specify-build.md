---
form: specify-build
reopened: 2026-08-24T15:55:40.940Z — The existing signed form did not contain a seedable chunk drawing, leaving the declared build submachine unseeded.
by: agent
signed_off: 2026-08-24T16:14:13.243Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

The scoped work has three local design concerns: session-mode guidance filtering, dynamic form delivery, and blockers-only stop behavior. Each concern has a design specification linked to el-walk-engine and its planned source and test files.

## design_specs

dsp-session-guidance-delivery; dsp-state-entry-form-delivery; dsp-blockers-only-stop-behavior

## promotions

none

## follow_up

Seed and execute the resulting implementation chunks in dependency order: add regression tests, repair the guidance and form paths, then repair blockers-only stop handling.

## anything_else

