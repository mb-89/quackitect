---
form: the-branch-pin
by: agent
signed_off: 2026-08-20T10:57:14.459Z
reopened: "2026-08-20T10:57:05.099Z — it answered older ground: the move and the corpus reader were both re-signed after it"
authors: agent
files:
---

# Evidence form / the-branch-pin

## current_situation

The chunk stood, and fresh eyes found the repair had been made in one case out of two.

THE RETURN CASE ASSERTED NOTHING ABOUT ITS CHECKOUTS. Neither exit status was read, and its only assertion was that a file exists on the branch it ends on. That is true whether or not either checkout ran, so the case passed without exercising the guarantee once.

That is the exact shape the first case had been repaired for, left standing in the second. The evidence said each case asserts the checkout moved the opened folder; one did.

TWO MORE ASSERTIONS COMPARED A PURE FUNCTION WITH ITSELF and were worded as though they proved a recomputation.

## built

`deliverable/tests/resolution.test.ts`, two cases and their fixture.

### The test

A fixture repository on two branches. `other` is cut BEFORE the opened folder exists, so checking it out removes every tracked file under `project/`. The fixture ignores the machine-state folder, because the real repository does.

Each case now does the same four things, and each asserts every one of them.

- Bind a record: write `session.json` into the machine state inside the opened folder.
- Switch branch, and read the checkout's exit status.
- Assert the checkout REALLY DID empty the opened folder.
- Read the state back. Same place, same bytes.

The second case does it again on the way home: the exit status of the return checkout, the folder restored, and the bytes still there.

### It holds

The folder does not move with the branch, in either direction, across a checkout that rewrites the opened folder entirely.

### Two assertions were saying something they could not say

`machineStateDir` is a pure join of its argument, so comparing it with itself either side of a checkout can only ever hold. Their messages read as proof that a path had been recomputed after a branch switch, and nothing had been.

They stay, because they document what is being asked. Their messages now say what they actually check, and the weight sits on the read from disk beside them.

### The tree

1553 pass, 7 fail. Lint green, preflight green, corpus sweep green over 1969 nodes. No red is in this chunk.

## follow_up

### Repairing one instance of a shape is not repairing the shape

The first case was fixed and the second was left, in the same file, in the same session, by whoever wrote the note explaining the fix. The evidence then generalised the repair to both.

A REPAIR THAT NAMES A SHAPE OWES A SWEEP FOR IT. Where else does a case assert only the end state and never that the thing it depends on happened? That question is worth a pass of its own and is not answered here.

### The intent half is still owed

A passing test says the folder does not move with the branch. It says nothing about what the ruling's author meant by it, and no test can. That question is one sentence and it belongs to the owner; `raid-asm-the-branch-independence-ruling-constrains-branch-and-not-depth` stays graded crippling until it is answered.

## anything_else

