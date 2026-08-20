---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: exp-can-the-host-state-which-folder-it-handed-over
type: "[[experiment]]"
statement: Can the editor host state which folder it handed over, and can its activation test and its handover name different folders?
probes:
  - raid-asm-the-hosts-pattern-test-and-its-handover-name-the-same-folder
timebox: 1 hour
form: calculation
chunk: none — the host's own source and its whole published type surface were read, and no editor was opened
faked: "the running editor. Nothing was observed at runtime. The answer is read from the host's source at its default branch and from its published types, which is a stronger source than a blog and a weaker one than a session."
fallback: "NOT WRITTEN IN ADVANCE. The seeding carried the question and the timebox and no fallback, which is the same seeding defect the criteria spike records. What to do if the assumption fell was decided after it fell."
verdict: falls
measured: "2026-08-19. The host's activation check walks the open folders, finds the first containing the named file, activates, and discards the folder identity. The activation result carries one field, the event string. With a wildcard pattern the folder is never computed at all. The extension receives the whole workspace and no activation reason. The activation event appears in no published type and in no proposed one."
folds_to: opt-ownership-transfers-by-explicit-handover loses the editor from its list of things that can state a root, and raid-dec-ownership-is-stated-by-the-host-and-acknowledged-back is rewritten one-sided. The guarantee is unchanged and the mechanism becomes a self-check that refuses on any carrier count but one.
promote: none — the check is four lines against the host's own file API and belongs in the build rather than in a script kept from here.
source_refs:
  - rank-unknowns, the seeded pick
  - req-a-wrong-act-never-passes-silently
  - opt-ownership-transfers-by-explicit-handover
---

## Setup

TWO HOST MECHANISMS WERE ASSUMED TO NAME A FOLDER. An activation event decides
WHETHER the extension starts, by testing whether an opened folder contains a
named file. A handover was assumed to decide WHAT folder it then holds.

THE ASSUMPTION WAS THAT THE TWO COULD DISAGREE. The chosen design converts that
disagreement into a refusal by acknowledging the handed-over folder back.

## Result

THERE IS NO HANDOVER. Only one of the two mechanisms names a folder, and it
names it to itself.

THE FOLDER IS COMPUTED AND THROWN AWAY. The activation check finds the matching
folder, activates, and returns. The matching folder is in scope on the line that
activates and is not passed on. The result type carries one field, the event
string.

WITH A WILDCARD PATTERN IT IS WORSE. No folder is computed at all. One search
runs across every open folder and returns a boolean.

THE EXTENSION RECEIVES THE WHOLE WORKSPACE. Its context object carries no
activation event and no folder. Every published type and every proposed one was
checked and the activation event appears in none of them.

## The concrete failure this predicts

IN A WORKSPACE WHERE THE SECOND FOLDER CARRIES THE MARKER, an extension that
reaches for the first folder roots itself in the wrong one and nothing
complains. The host's own deprecated convenience accessor is documented as the
first entry, which is exactly the wrong one.

## Two silent failures found on the way

A SEVEN-SECOND TIMEOUT KILLS WILDCARD ACTIVATION, and the only trace is a log
line. A pattern with no wildcard avoids the search path entirely, which makes it
the safer form. It reverts to searching anyway under a remote authority or on
the web build.

ADDING THE FIRST FOLDER TO A WORKSPACE RESTARTS EVERY EXTENSION rather than
firing the folders-changed event.

## What survives

THE ACKNOWLEDGING HALF, REBUILT AS A SELF-CHECK. The system runs the same
content test the host ran, once per open folder, and counts carriers.

- Nought. Refuse. Something claimed a carrier exists.
- One. Bind to it, and echo it where a person reads it.
- Two or more. Refuse, and ask the person.

IT NEVER LEARNS WHICH FOLDER FIRED THE EVENT. It makes that irrelevant, because
the only case where the trigger's identity matters is the ambiguous one and
that case refuses.

USE THE HOST'S OWN FILE-EXISTS CALL RATHER THAN ITS SEARCH, where the marker is
a fixed name. The search applies the person's exclusion settings unless told not
to, so it is a different test and can disagree with the host's.

## What is still owed

A RUNNING EDITOR, on two narrower questions this could not answer: the
seven-second timeout under a slow search, and the search path under a remote
authority.

WHICH FOLDER FIRED THE EVENT WHEN TWO CARRY THE MARKER. Not observable from
inside an extension. The information does not survive the early return, so no
session will answer it either.
