---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-iss-the-record-names-its-doors-after-technologies-rather-than-purposes
type: "[[raid]]"
kind: issue
statement: This record's goals and scope name a disk door and an outward door, which are technologies. The primary source for the pattern says interfaces carved by technology are the failure it exists to fix, and that a port names a purposeful conversation instead.
owner: the owner
trigger: found on 2026-08-26 when the owner asked how doors are usually carved, and the primary source was read
status: open
impact: Every artifact below the kickoff inherits the wrong carving. The goals, the scope box, the two doors named in them and any requirement derived from them are all organised around resources rather than conversations, which is the shape the source says makes a system hard to understand.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself
  - i54-everything-exported-has-a-door-a-sweep-o
place: overhaul
---

## What the primary source says

ALISTAIR COCKBURN, "Hexagonal Architecture" (Ports and Adapters), HaT Technical
Report 2005.02, at alistair.cockburn.us/hexagonal-architecture/. He named the
pattern, so this is the publisher rather than a summariser.

HIS DEFINITION: "A port identifies a purposeful conversation."

THE WORKED FAILURE IS THIS RECORD'S OWN SHAPE. A weather-alert system had four
interfaces "identified and discussed by technology, linked to purpose" — a wire
feed, answering machines, a GUI, a database — and faced what the paper calls a
maintenance and testing nightmare.

THEIR FIX, VERBATIM: "Their shift in design was to architect the system's
interfaces by purpose rather than by technology, and to have the technologies
be substitutable (on all sides) by adapters."

## Why it is an issue rather than an assumption

NOTHING IS ASSUMED HERE. The record's own goals say "build the disk door" and
"give reaching outward a central door". Those are technologies, and the source
says plainly that naming interfaces that way is the mistake.

IT IS ALSO NOT A RISK, because it has already happened. The wrong carving is
written into a signed and blessed kickoff gate.

## The measurement independently agrees

OF 64 JUDGED WRITE SITES, 30 SHARE ONE SHAPE: read a claim, record or form
file, modify it, write it back, none atomic and none hash-checked, plus the
directory creation before it.

THAT SHAPE IS A PURPOSE, NOT A TECHNOLOGY. The hand that read them concluded
the object which pays is a claim writer rather than a disk facade, without
having read Cockburn.

TWO INDEPENDENT LINES REACHING ONE ANSWER is why this is graded expected rather
than plausible. The standing condition already holds: the wrong carving sits in
a signed gate.

## What M5 did about it

THE NEIGHBOURS WALK CARVED BY CONVERSATION RATHER THAN BY TECHNOLOGY, which is
what this entry asks for. Four conversations were found, not seven neighbours:
store and retrieve bytes at an address, record and retrieve versions of the
tree, ask the outside world a question, and serve one lane call.

THE CONTEXT DIAGRAM IS NOW SPLIT primary against secondary, which this entry
named as missing. One conversation is primary and three are secondary.

WHAT IS STILL OPEN is the kickoff's own wording. The goals still say build the
disk door and give reaching outward a central door, and a signed gate cannot be
reworded by a downstream milestone.

## What closing it looks like

THE DOORS ARE RENAMED FOR CONVERSATIONS. On the evidence so far the candidates
are persisting a claim, reading the corpus, and reaching outward for an answer.

THE TECHNOLOGIES MOVE BEHIND ADAPTERS. Disk, HTTP and the syscall surface stop
being doors and become what a door happens to use.

THE CONTEXT DIAGRAM IS SPLIT PRIMARY AGAINST SECONDARY. Cockburn ties the ports
to it directly: "follow the system's use case context diagram and draw the
primary ports and primary adapters on the left side of the hexagon, and the
secondary ports and secondary adapters on the right." This record drew seven
neighbours and has not split them.

## What it does NOT change

THE FALSIFIER RESULT STANDS. 42 improvable against 22 not. What changes is what
the improvement is called and how it is bundled, not whether it pays.

THE SWEEP AND THE TWO DOORLESS PIECES STAND UNTOUCHED. They were never carved
by technology.

THE OWNER HAS RULED AGAINST RESIZING, so this does not reopen the change size.
