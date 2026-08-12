---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: nbr-toolchain
type: "[[neighbour]]"
statement: The local toolchain the checks run on — Node, the typechecker, the linter-formatter and the test runner.
direction: out
---

## Interface

Processes spawned through `se_run` and `se_test`, with their output captured
in full under the call's ref.

The three gates run in one order: the typechecker, then the linter-formatter,
then the scoped tests. The commit hook runs the first two and BLOCKS, so a
red gate cannot be committed around.

The lane FIXES what the formatter can fix and hands back the fixed content;
what it cannot reach rides the result as findings.
