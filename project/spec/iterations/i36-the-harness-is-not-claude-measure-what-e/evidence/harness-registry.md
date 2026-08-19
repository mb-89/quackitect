---
form: harness-registry
by: agent
signed_off: 2026-08-19T16:25:36.032Z
authors: agent
files:
---

# Evidence form / harness-registry

## current_situation

Nothing named the supported hosts. The engine had no list, no per-host numbers, and no way to ask what a host does.

The measurements existed but only as prose. spec/harness-portability.md carries them from the audit and outward scan of 2026-08-18, including the two that bite: Copilot CLI offloads any tool output at or above 20 KiB, and it overrides the stop hook after eight consecutive blocks.

SO EVERY DOWNSTREAM CHUNK WOULD HAVE COPIED THEM. Four chunks in this drawing need to know a host's limits, and four copies of a number drift the day it is remeasured.

## built

project/deliverable/engine/harness.ts, new.

WHAT IT HOLDS. `HARNESSES`, one entry per supported host, each carrying an id, the client names it answers to in MCP `initialize`, a label, its measured limits, and a `measured` string saying when the numbers were taken and from where.

THE THREE HOSTS.

- claude-code. No inline-output threshold seen to bite below the answer bound, and no stop-block ceiling. Both absences were looked for, which is why they are recorded rather than blank.
- copilot-cli. inlineOutputBytes 20,480 (20 KiB, tunable by COPILOT_LARGE_OUTPUT_THRESHOLD_BYTES) and stopBlockCeiling 8, from harness-portability breaks 1 and 2.
- vscode-copilot. Explicitly NOT MEASURED. Its behaviours are recorded in cage/vscode-instructions.md; no threshold has been taken.

TWO FUNCTIONS.

- `harnessFor(clientName)` matches case-insensitively and returns undefined for anything unmeasured. Undefined is an answer here, not a failure.
- `smallestInlineOutputBytes()` computes the tightest measured limit across hosts. It returns 20,480 today, and it moves by itself if a tighter host is ever measured.

TESTS. project/deliverable/tests/harness.test.ts, five cases, all green. They check that the list is the single source callers iterate, that ids are unique, that every entry carries provenance, that an unknown host reads as unknown, and that an unmeasured limit is absent rather than zero.

Run on 2026-08-19: 5 passed, 0 failed.

## follow_up

AN ABSENT LIMIT IS NOT A MISSING FEATURE. `claude-code` and `vscode-copilot` both carry empty limits, for different reasons: one was measured and found not to bite, the other was never measured. The `measured` string is what tells them apart, and a reader has to look at it.

THAT DISTINCTION DESERVES A TYPE rather than a sentence, and this chunk did not build one. A later change could carry `measured: false` explicitly instead of leaving a reader to parse prose.

VS CODE IS OWED A MEASUREMENT. It is the host this session ran on, and it is the one entry with no numbers. Nothing downstream can guard a limit that was never taken.

## anything_else

