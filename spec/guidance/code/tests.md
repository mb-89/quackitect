---
kind: [[guidance]]
tags: [testing]
scope: ["every test a change adds, moves or deletes"]
rationale: [[spec/rationales/tests]]
---

# Actionables

1. Test a behavior once, at the command line, and at the module's ports for an edge the command line cannot reach. A second test of one behavior fails on the same edit, and every fix pays twice. [[spec/guidance/code/examples]] *
2. Hold a behavior in one layer and one language, and write a second copy as a finding. Two copies fail together, and a fix to one leaves the other stale, so the contract suite of [[spec/guidance/code/testing]] alone runs twice. *
3. Delete a test in the change that deletes the code it tests. A test over a removed path fails for nothing or passes over nothing. *
4. Delete each twin, parity case, shadow row, old golden section and removal guard in the change that switches its migration phase. A comparison past its switch holds the live code to code nobody runs. *
5. Pin a behavior in a golden file, and keep a line count, a size, an unread order, a wording, a hash and the tree's own content out of it. A golden file holding incidental output fails on an unrelated edit, and a hand counts it again. *
6. Keep the test lines of a module, its fixtures counted, at or under its code lines, and of each language as `src/quack/check_lines.go` counts them. A module past that holds copies of one behavior, and every change pays for each copy. *

# Examples

| the rule | do | do not |
|---|---|---|
| 1 | one table test over the verb list | a registers test for each verb |
| 2 | the draft table run by the module, and one case of it through the wired quack | the whole draft table run by the module and again by quack |
| 3 | the test deleted in the commit deleting its function | a test of a removed script, standing for its fixture |
| 4 | the twin golden files deleted in the switch-over | a parity golden file standing after its switch |
| 5 | a case asserting a file one line past the ceiling meets `FileCeiling` | a golden file listing each long file with its line count |
| 6 | a module of two hundred lines with two hundred lines of tests | a window package of two hundred lines with two thousand lines of tests |
