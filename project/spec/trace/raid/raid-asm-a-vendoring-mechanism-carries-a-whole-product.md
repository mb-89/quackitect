---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-asm-a-vendoring-mechanism-carries-a-whole-product
type: "[[raid]]"
kind: assumption
statement: A standard vendoring arrangement works when the thing vendored is the WHOLE product rather than a subdirectory of somebody else's application.
owner: the owner
trigger: the first candidate at M4 that proposes an existing mechanism rather than a new one
status: probed
probe: "holds, RUN TWICE on throwaway repositories outside the project root. RUN ONE: a copy renamed its brand file, rewrote a line of a shared file and added a file of its own; the source changed the SAME line plus a file the copy had not touched; the copy pulled. ZERO FILES SILENTLY LOST, which was the stated pass line — the copy's rename survived, the source's change arrived staged, the copy's own file was untouched, and the one shared line came back as an honest conflict with both versions present and marked. RUN TWO, forced by the owner's constraint mid-state: the copy's link back was CUT, private guidance was committed into it, it was pushed to an internal bare repository, and a colleague cloned from internal only. Every file arrived on a machine with no reference to the source, and an update taken later BY ADDRESS merged cleanly and left the remotes unchanged. A whole-product copy needs no subtree tooling at all: a subtree exists to put a PART inside a whole, and here the copy IS the whole."
probed: 2026-08-18
breaks_how_badly: crippling
how_likely: plausible
impact: "If it holds, the channel costs a configuration rather than a design, and M4 compares known options. If it does not, the iteration is back to building its own, which is the register's headline risk and the thing the owner ruled against."
source_refs:
  - raid-risk-ownership-and-receiving-pull-against-each-other
  - req-one-command-produces-a-complete-copy
  - fn-run-a-governed-walk.bring-forth-a-vehicle
---

## Why it is an assumption rather than a fact

THE MECHANISM WAS READ AND NEVER RUN. git-subtree's manual page in git's own
tree was fetched this session and quoted in `define-actual`. Every claim about
what it does comes from its documentation.

AND ITS OWN FRAMING IS THE OPPOSITE SHAPE. "Subtrees allow subprojects to be
included within a subdirectory of the main project. For example, you could
include the source code for a library as a subdirectory of your application."
The thing being vendored is a PART; here it is the WHOLE.

WHAT MIGHT DIFFER, and this is what the probe has to find rather than reason
about: whether a copy that IS the vendored thing, rather than containing it,
still takes an update cleanly - and what the prefix means when there is no
prefix.

## Probe

RUN IT, on a throwaway pair of repositories. The whole probe is four steps and
none of them needs this product.

1. Make a source repository with a handful of files and some history.
2. Produce a copy of the WHOLE thing by the candidate mechanism, under a new
   name, in a place the source cannot see.
3. Change files in both, including at least one file both sides touch.
4. Take an update in the copy. Count: conflicts, files silently lost, and
   manual steps.

WHAT ANSWERS IT. Zero files silently lost is the pass. A conflict is not a
failure - the ordinary answer is that a person resolves it - but a change that
disappears without being offered is.

## The probe ran on 2026-08-18, and the assumption HOLDS

THE MECHANISM IS PLAINER THAN THIS ENTRY EXPECTED. A whole-product copy does
not need git-subtree at all - a subtree exists to put a PART inside a whole,
and here the copy IS the whole. What works is `git clone`, and later a pull.

### Run one: does an update land without losing anything

A source with three files and history; a copy of it; the copy renamed its brand
file, rewrote a line of a shared file and added a file of its own; the source
changed the SAME line and a different file the copy had not touched; the copy
pulled.

| the file | who changed it | what happened |
| --- | --- | --- |
| brand.json | the copy renamed it, the source did not touch it | the copy's name survived unchanged |
| engine.ts | the source only | the source's change arrived, staged |
| mine.md | the copy only | untouched |
| method.md | BOTH, on the same line | one honest conflict, both versions present and marked |

ZERO FILES SILENTLY LOST, which was the stated pass line. The conflict is not a
failure - it is the ordinary answer, and both sides were offered rather than
one being chosen.

### Run two: the owner's constraint, which is stricter than the entry asked

OWNER, 2026-08-18: a vehicle gets internal guidance that cannot sit on an open
source kit, is committed to an INTERNAL version control, and may rely on no
link back to the original.

RUN AS DESCRIBED. The copy's link to the source was cut, an internal bare
repository was made, private guidance was committed, and the copy was pushed
there. A colleague then cloned from the internal repository only.

- The vehicle's only remote is the internal one. Nothing points at the source.
- The colleague received every file including the private guidance, from the
  internal repository alone, on a machine with no reference to the source.
- The vehicle still carries its history, which is DATA IN THE REPOSITORY rather
  than a link to anything.
- Somebody who WANTED an update supplied the source's address as an argument at
  that moment. It merged: the upstream change arrived, the rename survived, the
  private guidance survived.
- REMOTES AFTER THE PULL WERE UNCHANGED. Taking an update created no link.

SO A LINK IS A DEPENDENCY AND AN ADDRESS IS NOT. The vehicle stores no address,
and a vehicle nobody ever updates keeps working forever.

## What it means for the export, which is the actionable half

`RUNME.ps1 --export` MAKES A FRESH REPOSITORY WITH ONE COMMIT AND NO HISTORY,
at lines 57-155. That single choice is the only reason a copy it produces
cannot take an update: a repository with no shared history has nothing to merge
against.

SO THE CHANNEL IS NOT A THING TO BUILD. It is a thing the export currently
throws away, at the moment it makes the copy.

AND ONE COST GOES TO M4 RATHER THAN BEING SETTLED HERE: the clean merge is
clean BECAUSE the copy carries the source's history, so the copy's repository
contains the parent's past. For an open-source parent that leaks nothing, and
it is still a real input to the choice.

AND ONE THING THE PROBE MUST ALSO REPORT: whether the copy is usable by
somebody who has never heard of the mechanism. git-subtree's own claim is that
subtrees "do not force end-users of your repository to do anything special or
to understand how subtrees work", and a copy that fails that is a worse product
than a fork.
