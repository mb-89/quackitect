---
kind: [[rationale]]
---

# Why

The owner took the idea from two places. In pylib the tutorials were notebooks
the test suite ran, so a broken tutorial was a red test. In pyqtgraph the
example explorer ran each example, and the test suite ran every one of them.
One file served the reader and the check at once, so neither drifted from the
other. For the owner's words, see [[spec/design_input/examples-are-the-tests]].

## 1. Where the user reads

A behavior asserted in a unit test alone reached nobody who learned the tree.
The same behavior written as an example taught the user and held the check. An
edge a user skipped still wanted a test. So it took the same format in the
developer chapters, and the tutorial stayed free of it.

## 3. One behavior, one assertion

Two assertions of one behavior drifted: a change updated one and left the
other, and the battery paid for both. The ratio rule in
[[spec/guidance/code/testing]] counted every line of the second copy. So the
suite came down to the examples, the developer cases and one contract test per
door, and a test repeating an example left.
