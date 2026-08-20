---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: tsp-the-folder-answers-for-consent
type: "[[test-spec]]"
statement: A folder carrying machine state comes up asking nothing, and a folder without it is told so and left untouched.
method: test
verifies:
  - req-a-folder-is-driven-only-with-consent
files:
  - tests/boot.test.ts
---

## Scope

TWO TRANSITIONS AND NO THIRD. The folder carries machine state and the system
comes up. It does not, and the system says so and stops.

THE WHOLE TEST IS THE FOLDER. Nothing is looked up, nobody is asked, and no
record is kept anywhere about which folders are permitted.

OUT OF SCOPE: whether a person is ever prompted. The requirement forbids
prompting outright, so there is no prompt case to write. What replaces it is an
assertion that nothing was asked.

## Approach

LEVEL: integration. The unit is the bring-up path against a real folder on
disk, because the claim is about a filesystem observation and its consequence.

METHOD: equivalence class partitioning on one input with exactly two classes,
which is what the requirement's own two-row table already gives. Boundary
analysis has nothing to work on here; there is no range.

DEPTH: graded corrosive and priority must. Two classes, both executed, plus the
negative assertion that carries the security characteristic.

## Steps

WHAT THE NAMED FILE ALREADY CARRIES, read before this spec claimed it. The boot
gate, what is refused before boot completes, and that a refused pre-boot call
lands in the log. That is the machinery this behaviour rides on, and none of it
is this claim.

WHAT IS OWED.

- A FOLDER WITH MACHINE STATE COMES UP. Assert the desk is reached and that
  nothing was asked of anybody on the way.
- A FOLDER WITHOUT IT IS REFUSED. Assert the answer says plainly that this
  folder is not a project of this system.
- NOT ONE BYTE IS WRITTEN. Take the folder's full listing and every file hash
  before the open and after it, and assert both are identical. This is the
  case that carries the security characteristic, and an assertion that the
  machine-state folder was not created is weaker than it looks: the row forbids
  writing ANYTHING, not just that.
- NOTHING IS SEEDED. Assert no machine-state folder exists afterwards, which is
  the specific failure the owner's ruling names.

THE ORACLE FOR THE REFUSAL IS THE WORDS A PERSON READS, not an exit code. The
requirement asks the system to say what it found, so the case pins the sentence.

## What this spec deliberately does not test

THE CLONE CASE. An earlier version of the requirement asked for one and the
owner struck it on 2026-08-19. Writing a case for it would re-add a demand that
was removed, which is the quietest way a struck decision comes back.
