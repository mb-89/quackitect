---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-a-cut-subsystem-left-its-interface-node-behind
type: "[[raid]]"
kind: issue
statement: The core-and-satellite subsystem was removed from this branch and one of its interface nodes was left standing, naming an element that no longer exists.
owner: the owner
trigger: any state that reads the element matrix, which is every decompose-structure from now on
status: open
impact: Every element matrix refuses. The state cannot close, and the message names a dangling id rather than the removal that caused it, so the reader looks for a missing element instead of for a finished cut.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - raid-debt-core-and-satellite-is-off-the-live-path
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---

## What was found

MEASURED ON THIS CLONE, 2026-08-19, when i5's decompose-structure refused.

The matrix check reported one problem: `if-satellite-to-walk-engine` names an
end no element carries, `el-satellite`.

WHAT IS GONE, checked one at a time.

- The element nodes. `el-satellite`, `el-core` and `el-satellite-supervisor`
  exist nowhere in the tree and at no ref this clone can resolve.
- The design spec. `dsp-core-and-satellite` does not exist.
- The code. No file under the engine carries the subsystem. One sentence of
  help text in `se-mcp.ts` still names core, satellite and channel.

WHAT IS LEFT. One interface node, and the register entries that describe the
subsystem.

## Why this is an issue and not a decision

THE CUT ALREADY HAPPENED. The standing debt says the repayment is one of two
acts, wire it or cut it, and both are the owner's. What the tree shows is that
the second act was taken: the code, the spec and the elements are all gone
together.

SO REMOVING THE ORPHAN DECIDES NOTHING. It finishes an act somebody else
completed everywhere except in one file.

## What was done here

THE INTERFACE NODE WAS DELETED, at i5's decompose-structure, with this entry
written first so the removal is not silent.

WHAT IS NOT DONE, and it is the owner's:

- The standing debt still reads as open with two possible repayments, and one
  of them is no longer available. It wants re-reading against what the tree
  actually holds.
- The register entries that name the removed elements are still there:
  `raid-ar-crash-lands-safe`, `raid-ar-every-call-logged`,
  `raid-ar-mirror-stays-on-the-machine`, `raid-asm-machine-wide-state-serves-over-a-local-channel`
  and `raid-ar-a-clear-jump-is-one-call` all point at elements that do not exist.
- The help text in `se-mcp.ts` still describes the architecture as core,
  satellite and channel.

NONE OF THOSE BLOCKS ANYTHING TODAY, which is why they are named here rather
than fixed in a record whose goal is elsewhere.
