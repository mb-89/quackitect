---
form: spill-is-per-server
by: agent
signed_off: 2026-08-19T16:22:36.825Z
authors: agent
files:
---

# Evidence form / spill-is-per-server

## current_situation

`spillDir` lived at module scope in bound.ts, and tools.ts set it from the root at every server build.

The test runner builds servers at different temporary roots inside one process and runs suites in parallel, so the last build won the global. Server A then wrote its spill into server B's directory, and A's reader looked under A's root and found nothing.

THE SECOND HALF WAS THE ADDRESS. `spill()` returned the fixed string `.se/answers/<tool>.json`, which the reader resolves against its own root. One address cannot serve two roots.

WHAT IT COST. A battery run on 2026-08-19 returned 94 failures out of 1405, and almost every one carried `spill read failed` with `SE-C-102 ... (not found)`. NOT FOUND rather than stale content is the tell: the reader was looking somewhere the writer never wrote.

## built

Three files.

project/deliverable/engine/bound.ts. `boundAnswer` takes an optional `seDir` and passes it down to `spill`, which now receives its directory as an argument instead of reading the module global. The global survives as a FALLBACK for callers that do not know their root, and its comment now says why it cannot be the address.

project/deliverable/engine/mcp.ts. `McpServer` holds its own `seDir` and a `setAnswerSpillDir` to set it. All three answer sites pass it: the result, the refusal and the error.

project/deliverable/engine/tools.ts. Every built server is wired to its own root: `server.setAnswerSpillDir(seDir(root))`, right after construction.

TESTS. One new case in project/deliverable/tests/answer-bound.test.ts: "a caller's own spill directory wins over the module's, so two roots cannot collide". It sets the module global to one root, spills with another, and reads the whole answer back from the caller's.

Run on 2026-08-19 over answer-bound.test.ts and record-inspect.test.ts: 14 passed, 0 failed.

## follow_up

THE 94 FAILURES SHOULD NOW CLEAR, and that is a prediction rather than a result. This chunk was verified against answer-bound.test.ts and record-inspect.test.ts only. The full battery is verification's to run, and it is the honest place to see whether the number goes to zero.

ONE FAILURE IN THAT RUN WILL NOT CLEAR, and it is not this defect. cage.test.ts expects `nativeExceptions = new Set(["web_search", "WebSearch"])` in the extension source, and that identifier exists in the test and nowhere else. It belongs to chunk cage-inventory-check.

THE GLOBAL IS STILL THERE, deliberately. Removing it would change every caller that does not know its root, and no such caller was in this chunk's way. It is now a documented fallback rather than the mechanism.

## anything_else

