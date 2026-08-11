---
id: dsp-call-log
type: "[[design-spec]]"
statement: every call appended with role and channel, carried by one jsonl log and the views that count it
realizes:
  - "el-account"
  - "if-walk-engine-to-account"
  - "if-holding-pen-to-account"
  - "if-method-compiler-to-account"
  - "if-record-store-to-account"
files:
  - "project/deliverable/engine/calllog.ts"
  - "project/deliverable/engine/survey.ts"
---

## Responsibility

The append-only account: every lane call lands raw with its actor role
and channel, refusals with their clause, verdicts with their run. The
log query serves it back by ref, by filter and by grouping; the survey
counts what stands open across records and notes.

## Behavior and constraints

- Append-only; the log is kept, never rewritten.
- Sessions and retro windows are derived from the records themselves.
