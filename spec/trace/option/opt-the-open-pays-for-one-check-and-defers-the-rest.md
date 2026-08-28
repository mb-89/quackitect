---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-the-open-pays-for-one-check-and-defers-the-rest
type: "[[option]]"
statement: Make opening a folder cost one existence check and nothing else, deferring every expensive act until something actually asks for it.
cluster: the-bootstrap
question: what happens when a folder is opened
found_by: heuristic
source: Make the common case cheap; make the rare case possible.
---

## Mechanism

THE COMMON CASE IS OPENING A FOLDER, and after the collapse it is the only way
in. It happens every working day, many times. Two answers cover almost all of
them: this is a project that has come up a thousand times, or this is not a
project at all.

BOTH ANSWERS COME FROM ONE CHECK. Does the machine-state folder exist at the
root. Nothing else has to run to decide.

EVERYTHING ELSE WAITS UNTIL SOMETHING ASKS. Reading the corpus, judging the
runtime, resolving cited refs, warming any cache. Each is real work and none of
it is owed before somebody types a sentence.

## What it serves

`req-the-desk-is-usable-soon-after-the-folder-opens` PUTS A CLOCK ON THIS. The
row exists because the entry-point row said nothing about when, so a product
that came up eventually would satisfy it exactly.

THE PROBE MADE IT CONCRETE. Today the extension activates on the editor's own
after-everything-else event, chosen when there was no bound to choose against.

## What it costs

LAZINESS MOVES FAILURES LATER, and later is worse when nobody is watching. A
missing dependency found at open is one message before any work starts. Found
lazily, it surfaces in the middle of a walk, against a state that has already
been entered.

THE ARRIVAL CLUSTER EXISTS BECAUSE OF EXACTLY THAT. Its whole shape is doing the
expensive things early, on a machine where nobody can fix them later. This
option pulls the other way, and where the two meet is a real decision rather
than an oversight.

## The narrow reading is the safe one

DEFER WHAT A PERSON CAN STILL FIX. Keep at open whatever produces a failure
nobody could recover from once work has started.

THAT SPLIT IS NOT DRAWN HERE. It is the design work this option hands forward,
and drawing it needs the arrival question settled first.
