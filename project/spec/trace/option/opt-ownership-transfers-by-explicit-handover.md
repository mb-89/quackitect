---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-ownership-transfers-by-explicit-handover
type: "[[option]]"
statement: Have whatever starts the system STATE which tree it is handing over, and have the system acknowledge that tree back, so ownership is transferred rather than inferred and neither side can be wrong about it silently.
cluster: the-walk
question: how the product's root is decided
found_by: analogy
source: "air traffic control — sector handover, where an aircraft is owned by exactly one controller and ownership moves only by an explicit transfer that the receiving controller acknowledges"
---

## Mechanism

THE ABSTRACT PROBLEM. Something must be owned by exactly one holder at a time,
and everyone must agree which holder that is, at every moment.

HOW THE DOMAIN SOLVES IT. Control of an aircraft passes between sectors by a
named handover. The releasing controller states the aircraft; the receiving
controller acknowledges it. There is never a moment when two believe they hold
it, and never one when nobody does. Ambiguity is not resolved afterwards — it
is prevented by making the transfer an explicit two-sided act.

WHAT TRANSFERS HERE. The launcher or a hook STATES the root it is handing over.
The lane echoes back what it took. Neither side searched, and neither side
guessed.

THE EDITOR IS NOT ON THAT LIST ANY MORE. It was, and a spike removed it. Read
"What the probe changed" at the foot of this node before building from the
paragraph above.

WHAT BREAKS IN TRANSLATION, and it is worth naming. Air traffic has a live
human on each end who will notice silence. A process does not, so the
acknowledgement has to be read by something — a log line nobody reads is not
an acknowledgement, it is a hope.

WHAT IT BUYS OVER SEARCHING. A walk upward can land in a tree nobody chose,
and the folder-you-opened rule has no answer when nothing opened anything. A
stated handover covers both, because the answer always comes from whoever
actually knows.

WHAT IT COSTS. Every entry point must be taught to state it, including ones
that do not exist yet. A caller that forgets is the failure mode, and it needs
a refusal rather than a default.

## What the probe changed, 2026-08-19

THE EDITOR CANNOT STATE THE ROOT. It has no way to. This was read from the
editor's own source and its whole published type surface, not from a write-up.

WHAT THE EDITOR DOES INSTEAD. Its activation check walks the open folders,
finds the first that contains the named file, and starts the extension. The
matching folder is in scope on that line and is discarded. The extension is
handed the whole workspace and no activation reason at all.

SO ONE HALF OF THIS CELL IS IMPOSSIBLE ON THAT HOST. The stating half. It stays
true for a launcher, a hook or a command line, each of which knows its own root.

## What the cell becomes where nothing can state it

THE RECEIVING SIDE PRODUCES THE STATEMENT ITSELF, by running the same test the
host ran and counting what it finds.

- Nought carriers. REFUSE. Something claimed one exists and it does not.
- One carrier. BIND to it, and echo it where a person reads it.
- Two or more. REFUSE, and ask the person which.

WHY THAT IS STILL THIS OPTION AND NOT A SEARCH. A walk upward guesses, and lands
wherever the tree happens to allow. This enumerates the declared candidates and
refuses every count but one. The failure is loud in both directions, which is
the property the analogy was borrowed for.

WHAT IT GIVES UP HONESTLY. It is one-sided. Nobody states anything, so the
transfer is not two-sided and the analogy is weaker here than the section above
claims. What survives is the guarantee, not the shape.

AND IT NEVER LEARNS WHICH FOLDER FIRED THE EVENT. It makes that question
irrelevant instead: the only case where the trigger's identity would matter is
the ambiguous one, and that case refuses.
