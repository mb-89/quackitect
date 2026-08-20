---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: tsp-withheld-by-its-door-not-by-its-folder
type: "[[test-spec]]"
statement: A read inside the machine-state folder is withheld only where a structured verb serves that file, and the refusal names the verb.
method: test
verifies:
  - req-only-a-file-with-its-own-door-is-withheld
files:
  - tests/files.test.ts
---

## Scope

ONE RULE WITH TWO BRANCHES. A file served by a structured verb is withheld. Any
other file in the folder is served like any other file.

THE REFUSAL IS PART OF THE CLAIM. A withheld read that only says no teaches
that the folder is closed, which is the belief this row exists to remove.

OUT OF SCOPE: writing. Whether those files may be written directly is a
different question with a different answer and another row's guard.

ALSO OUT: which files have a door. The requirement names none on purpose,
because the list changes as verbs are added. The cases read the list from the
declaration rather than repeating it.

## Approach

LEVEL: component, at the lane's read verb. The decision is a pure function of a
path and the declared door list, so it needs no tree.

METHOD: equivalence class partitioning with two classes, then boundary analysis
on the edges of the class. The edges are where a folder-shaped rule leaks: a
file whose name merely starts like a door's, a file in a subfolder, and a path
that reaches the folder from outside it.

DEPTH: graded abrasive, so the classes are covered and the tail is not hunted.
What earns the extra boundary cases is that the previous rule was a directory
proxy, and a proxy failure is exactly an edge failure.

## Steps

WHAT THE NAMED FILE ALREADY CARRIES, read before this spec claimed it. The
count of reads that bypass the door, held by a ratchet that may fall and never
rise. A declared root serving reads while an undeclared one refuses with the
vocabulary. Those are about the door as a mechanism; none is about this split.

WHAT IS OWED.

- A FILE WITH A DOOR IS WITHHELD. One case per declared door, generated from
  the declaration so a new verb is covered the day it is added.
- THE REFUSAL NAMES THE VERB. Assert the verb's own name appears in the remedy,
  not merely that the read failed.
- A FILE WITHOUT A DOOR IS SERVED. Read an ordinary file inside the folder and
  assert the content comes back.
- A NAME THAT ONLY LOOKS LIKE A DOOR IS SERVED. A file whose name extends a
  door's name is a different file, and a prefix match would withhold it.
- A FILE IN A SUBFOLDER IS SERVED. The old rule caught the whole tree, so the
  depth case is where the proxy's ghost would show.
- THE LIST IS READ, NOT REPEATED. Assert the withheld set equals the declared
  set, so the test fails when the two drift rather than when somebody notices.

THE ORACLE IS WHICH BRANCH RAN, and for the withheld branch it is the remedy's
text. A case that asserts only that something threw would pass on a refusal for
the wrong reason.
