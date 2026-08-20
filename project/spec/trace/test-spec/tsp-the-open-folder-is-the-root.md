---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: tsp-the-open-folder-is-the-root
type: "[[test-spec]]"
statement: The folder the editor has open is the product's root, and it stays the same folder across a branch switch.
method: test
verifies:
  - req-the-machine-state-sits-in-the-folder-that-is-open
files:
  - tests/resolution.test.ts
---

## Scope

TWO CLAIMS, AND THEY VERIFY TOGETHER. Identity, which says WHICH folder the
root is. Branch, which says that folder does not move when the checkout does.

THEY COULD NOT VERIFY APART. One run binds a record, reads the state, switches
branch and reads again, and the same run observes where the folder sat both
times.

OUT OF SCOPE, and it lives elsewhere. Whether every product-owned artifact sits
inside that root is `req-product-is-a-folder`, which has stood since i1 and is
already covered. This spec fixes the referent; it does not restate containment.

ALSO OUT: how the folder is found. Whether by the root, by a walk upward, or by
something the host hands over is the design's call, and the requirement leaves
it open on purpose.

## Approach

LEVEL: integration. The unit under test is path resolution against a real tree
with a real checkout, because the branch half cannot be faked at component
level.

METHOD: equivalence classes on the resolution kinds, plus one state transition
for the branch switch. The kinds are already partitioned by the file this spec
names, so the identity half extends a partition rather than inventing one.

DEPTH: this requirement is graded crippling and its assumption is graded
crippling too. That buys the branch case its own run rather than an assertion
folded into an existing one.

## Steps

WHAT THE NAMED FILE ALREADY CARRIES, read before this spec claimed it. Every
path resolves to one root whatever its kind. A session write reads back from the
project root and nowhere else. Two lanes asking for one path get one answer.
Those are the identity half, at the resolution layer.

WHAT IS OWED AND IS THE POINT OF THIS SPEC. No case in that file mentions a
branch. The branch claim has stood as a ruling and has never been executed.

- THE ROOT IS THE OPENED FOLDER. Resolve from a tree whose opened folder is not
  the repository root, and assert the machine-state folder lands inside the
  opened one. This is the case the collapse makes meaningful and it does not
  exist yet.
- NO LEVEL ABOVE HOLDS A PRODUCT FILE. Walk the parent of the opened folder and
  assert it holds nothing the product owns.
- THE BRANCH SWITCH CHANGES NOTHING. Bind a record, write session state, switch
  branch, read it back, and assert the same bytes from the same place.
- THE SWITCH BACK CHANGES NOTHING EITHER. The reverse transition is a separate
  case because a state machine's edges are checked in both directions.

THE ORACLE IS THE PATH, NOT THE ABSENCE OF A THROW. Each case asserts the
resolved absolute path, so a resolution that quietly answers from somewhere else
fails rather than passing on silence.
