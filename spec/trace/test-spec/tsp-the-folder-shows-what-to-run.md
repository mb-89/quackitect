---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: tsp-the-folder-shows-what-to-run
type: "[[test-spec]]"
statement: The top level of a fresh checkout presents the one thing to run, where a first-time reader looks first.
method: test
verifies:
  - req-the-folder-shows-what-to-run
files:
  - tests/scaffold-entry.test.ts
---

## Scope

WHAT THE FOLDER SHOWS, on the surfaces a newcomer actually uses. The
requirement's artifact is the top level of the folder as their tool renders it,
which is at least an editor's file tree and a code-hosting page.

OUT OF SCOPE: naming the mechanism. The requirement names none, and the M2
prior-art comparison found four that surface something and one convention that
surfaces nothing. Pinning one here would turn a design choice into an
obligation.

## Approach

LEVEL: system, on a fresh checkout rather than on this working tree. A tree
somebody has been working in is not the artifact the requirement describes.

METHOD: this row's own measure is a human one — two in every three within sixty
seconds — and no test can produce that. So the design splits the row in two.
The mechanical half is what the folder CONTAINS and where, which a test can
assert. The human half is what a person DOES with it, which needs a person.

THE SPLIT IS DECLARED RATHER THAN HIDDEN, because a spec that asserted the
mechanical half and reported the row as verified would be fabricated coverage of
the measure that matters.

DEPTH: graded abrasive and priority must. The mechanical half is cheap and
carries a real regression risk, since the collapse moves the launcher inside the
folder it used to sit above.

## Steps

WHAT THE NAMED FILE ALREADY CARRIES, read before this spec claimed it. An
authored none is not a scaffold and stays walkable. The pin writes the literal
the compiler recognises. The entry refusal ships and says what to do about it.
That last one is the closest existing case and it is about a refusal's wording,
not about what the top level shows.

WHAT IS OWED.

- THE ENTRY IS AT THE TOP LEVEL. Assert the one thing to run sits at the top of
  a fresh checkout, not one folder down. This is the case the collapse puts at
  risk.
- IT IS THE ONLY THING THAT LOOKS RUNNABLE THERE. Assert no sibling at the top
  level reads as a second candidate. Two answers at the front door is the same
  failure as none.
- THE HOST-SURFACED FILE NAMES IT. Assert the file a code-hosting page renders
  automatically points at the entry, because that surface is reached before any
  editor is.
- THE PACKAGED ARCHIVE SHOWS THE SAME THING. Unpack what ships and assert the
  top level matches, since a receiver's fresh checkout is the archive rather
  than this repository.

## What a test cannot answer, and where it goes instead

THE MEASURE IS TWO IN THREE WITHIN SIXTY SECONDS, unguided. No first-timer has
ever been watched, and the ramp-up report has said so since i1.

SO THE HUMAN HALF STAYS OWED and belongs with the demonstrations that wait on a
person. This spec verifies that the folder shows the thing. Whether a stranger
finds it is a different observation with a different method.
