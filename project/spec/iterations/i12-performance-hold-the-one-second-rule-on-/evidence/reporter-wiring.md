---
form: reporter-wiring
by: agent
signed_off: 2026-08-15T11:18:38.419Z
authors: agent
files:
---

# Evidence form / reporter-wiring

## current_situation

The battery built its reporter list in engine/bin/selftest.ts and the scoped run built a different one in engine/tools.ts. Only the battery's carried the timing reporter.

So a file could be timed only inside a run where about twenty files contend, and no duration was its own. Two lists that must agree, maintained in two places, had drifted and nothing said so.

## built

Committed in 0c6babef, corrected in the same record.

engine/testreporters.ts is new and holds testReporterArgs(human), returning the pair: the human reporter on stdout, the timing reporter on stderr. The battery passes spec, the scoped run passes tap, and everything after the first flag is identical by construction.

THE REPORTER IS FOUND FROM THE ENGINE. It resolves against this module's own URL rather than against the tree under test. The first attempt resolved it under the root being tested, which is wrong for every fixture root, because a fixture holds no engine at all.

Covered by tests/timings.test.ts, three cases: the scoped list carries a timing reporter, the file it names exists on disk, and the two lists differ only in the human reporter.

## follow_up

- records-home and timing-report both lean on this chunk and follow it.
- The scoped path's change is not live in the running engine until a reload, which needs the walk at idle. The battery's half is live already, because the battery spawns selftest from disk.

## anything_else

ON WHY ONE BUILDER RATHER THAN A TEST THAT COMPARES TWO.

A test asserting the two lists match would have caught the drift and left the drift possible. One builder makes the two lists the same object, so there is nothing left to drift.

The test that survives is narrower and better: it asserts the two differ ONLY in the human reporter. That is the one difference the design intends, and it is now the only one the code can express.
