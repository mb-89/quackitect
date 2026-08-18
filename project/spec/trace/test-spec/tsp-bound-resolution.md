---
minted_in: i27
id: tsp-bound-resolution
type: "[[test-spec]]"
statement: One seam resolves every path, refuses what falls outside its record, names the store it used, and routes a call naming a different owner.
method: test
verifies:
  - req-a-read-comes-from-where-it-is-meant
  - req-a-write-lands-where-it-is-meant
  - req-a-wrong-act-never-passes-silently
  - req-version-control-resolves-like-every-call
files:
  - tests/resolution.test.ts
---

## Scope

The resolution seam as [[el-resolution-seam]] declares it: resolve, refuse,
say. Four requirements, all graded fatal but one.

WHAT IS DELIBERATELY OUT. The cross-process half. No satellite exists, so
nothing here exercises a seam running in two address spaces. That rides with
the build and [[exp-one-seam]] records the gap.

## Approach

DESIGN METHOD: equivalence class partitioning over the four path kinds, then
boundary value analysis on the escapes. The partitions are session, method,
record and content; the boundaries are a relative climb, an absolute path
outside, and a declared root reached from the write lane.

LEVEL: component. Every case sits at the lowest level that can catch its
defect, and all of these catch at the resolver.

DEPTH: high, because exposure is high.
[[raid-risk-a-write-lands-in-the-wrong-tree-silently]] is an ISSUE rather than
a risk — [[exp-one-seam]] recorded it happening twice on 2026-08-14, so this
is a defect being fixed rather than a hazard being guarded.

## Steps

Every case in `tests/resolution.test.ts` is one step, and the case name states
its claim. Two groups.

THE CASES THAT PASS TODAY exercise what the standing resolver already does:
the jail refuses an escape, and the kind of a path decides its store rather
than where the walk stands.

THE TWO RED CASES ARE THE DESIGN'S OWED WORK, written as executable claims
rather than as prose.

- Every resolution names the store it resolved to. The seam answers a bare
  path string today, and a wrong resolution is invisible without the name.
- A call naming trunk is routed to its owner rather than refused as an escape.
  Routing is not resolution, and confusing the two would refuse the door
  method changes and commits both use.

A red here is the point. [[req-first-green-needs-a-red]] wants exactly this
before the build turns them green.
