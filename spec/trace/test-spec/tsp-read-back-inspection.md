---
unreachable_citations:
  - tests/bound-engine.test.ts
minted_in: i27
id: tsp-read-back-inspection
type: "[[test-spec]]"
statement: Every resolution test proves its landing by reading back from the store the caller named, and none asserts on the write's own return value.
method: inspection
verifies:
  - req-a-resolution-is-proven-by-read-back
  - req-every-record-path-resolves-in-one-tree
files:
  - none — the checklist is the whole definition, because the attribute examined is the shape of the other tests rather than the behaviour of the engine
---

## Scope

The resolution tests themselves, as static artifacts. This spec examines how
they prove things, not what the engine does.

WHY INSPECTION AND NOT TEST. The attribute is a property of source code. A
test that asserted it would have to parse the other tests, which is a worse
instrument than a reader with a checklist.

## Approach

The four path kinds each get one line, and each line has a pass criterion a
reader can apply without judgment.

The instrument is a reading of `tests/resolution.test.ts` and
`tests/bound-engine.test.ts` at each gate that reviews them.

## Checklist

- METHOD PATHS. A test that writes a method file reads it back from every tree
  the write was meant to reach. PASS when the assertion reads a file; FAIL
  when it asserts on what the write call returned.
- RECORD CONTENT. A test that writes into a record reads it back from that
  record's own tree. PASS when the read names the record's tree explicitly;
  FAIL when it reads through whatever the walk happens to be bound to.
- SESSION STATE. A test touching `.se/` reads back from the project root and
  never from a worktree. PASS when the root is named in the read.
- REPO-ROOT FILES. A test touching a file at the repository root reads it back
  from the root. PASS when the read is rooted explicitly.
- NO SELF-REPORTING. No case in either file concludes from the write's own
  verdict. PASS when every write is followed by a read; FAIL on any assertion
  whose only evidence is that the call did not throw.

## Why this exists at all

[[exp-one-seam]] measured one path string reaching two different trees on
2026-08-14, with nothing on either answer saying which. A write that reports
success proves nothing about where it landed, and the whole point of
[[el-resolution-seam]] is that the caller finds out at the call rather than at
a merge.
