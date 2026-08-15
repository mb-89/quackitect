---
minted_in: i27
id: req-a-resolution-is-proven-by-read-back
type: "[[requirement]]"
statement: Where a test proves that a call reached the intended tree, it shall prove it by reading back from that tree, never by the call's own verdict.
kind: quality
fitness_candidate: true
characteristic: reliability
verify_method: inspection
breaks_if_removed: A test passes while the defect it guards stands, because a wrong resolution reports success.
breaks_how_badly: crippling
refines:
  - uc-quality-reliability
source_refs:
  - req-a-write-lands-where-it-is-meant
  - req-a-read-comes-from-where-it-is-meant
  - raid-risk-a-write-lands-in-the-wrong-tree-silently
priority: must
---

## Scenario

- Source: the test suite.
- Stimulus: a call that resolves a path while a record is bound.
- Artifact: the tree the caller meant.
- Environment: each of the four path kinds - method, record content,
  session state, repo-root files.
- Response: a read from that tree, compared against what was written.
- Response measure: every resolution test reads back; none asserts on
  the write's own return value.

## Detail

A REFUSAL IS LOUD AND A MISROUTE IS SILENT. Every guard in this system
refuses and names its remedy. A wrong resolution has no refusal: the
path resolves, the bytes land, the tool answers ok.

SO THE WRITE'S OWN VERDICT PROVES ONLY THAT SOMETHING WAS WRITTEN. Only
a read from the tree the caller meant proves it landed there.

THIS IS A RULE ABOUT TESTS rather than about the engine, which is why
its verify method is inspection. A suite can satisfy every other row on
this page while proving nothing, if it trusts the verdict it is meant to
be checking.

## Four kinds, four rules, and the bug lives between them

Method fans to every tree. A record's content belongs to one tree.
Session state lives at the root and belongs to the machine. Repo-root
files belong to the root and to no record.

A test per KIND rather than per tool, because the seams are where this
goes wrong. Observed on 2026-08-13: two paths outside the project folder
resolved two different ways within five minutes of each other.

## Behaviour

No model wanted. It is a constraint on how a proof is written.
