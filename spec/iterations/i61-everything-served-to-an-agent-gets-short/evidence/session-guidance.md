---
form: session-guidance
by: agent
signed_off: 2026-08-24T16:26:09.304Z
authors: agent
files:
---

# Evidence form / session-guidance

## current_situation

Guidance documents were selected only by state selectors and tags. An attended session could therefore receive cloud-only or unattended-only documents.

## built

Added `sessions` frontmatter filtering in `deliverable/engine/pull.ts`. `Session` now supplies its active mode to served guidance and read requirements. The MCP launcher accepts `--session-mode`; cloud arrival launches with `cloud`. Added a focused selector regression in `deliverable/tests/reads.test.ts`.

## follow_up

The engine-owned focused test is running. Continue to the blockers-only stop behavior after it reports.

## anything_else

