---
minted_in: i9
id: raid-asm-a-machinery-note-still-has-a-home-when-the-open-folder-is-not-ours
type: "[[raid]]"
kind: assumption
statement: The folder rule this iteration settles is assumed to leave a legal home for a note about the system's own machinery, at a moment when the folder standing open belongs to somebody else's product.
owner: the driving agent
trigger: when the foreign-driving capability is designed, and before any note is written while a driven folder is the open one
status: open
probed: 2026-08-19
probe: "narrowed rather than settled, by reading the guard itself. The engine states the rule in its own comment in paths.ts - a vehicle may never write into the tree it was produced from, and it fails CLOSED when it cannot prove the target is not that tree. So the direction is confirmed: produced-to-producer is exactly what is blocked, which is the direction a machinery note would travel. BUT THE SAME COMMENT SAYS IT ONLY HAS ANYTHING TO SAY IN A VEHICLE, and a driven project is produced by a different act from a vehicle. So the three-rule collision this entry describes may not bite for the drive case at all. Still owed, and it is one call: declare the system's own tree as a writable root from inside a produced project, and see whether the guard fires."
impact: One documented extension of the foreign-driving use case may have no reachable implementation. It would be found by whoever builds that capability, after the folder rule has hardened everywhere else.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - "uc-drive-a-foreign-product extension 4a: a fault in the system's own machinery is captured as a note in the SYSTEM's tree, never in the driven product's"
  - "uc-drive-a-foreign-product step 1 and its lane door: se_produce_project takes an empty folder and produces the tree that gets driven"
  - "the lane card on declared roots: the one thing a produced tree may never reach is the tree it was produced from, compared by recorded identity rather than path"
  - sty-drive-somebody-elses-product, the slide that reads NOT BUILT AND NOT DESIGNED for exactly this separation
---

## What is being assumed

THAT THREE STANDING RULES CAN ALL HOLD AT ONCE. Each is written down today and
each was written without the other two in view.

- The machine state belongs to the folder that is open. This iteration settles
  that, and it is the whole point of the collapse.
- A note about the system's own machinery never lands in the driven product's
  trace. The foreign-driving use case states it as an extension.
- A produced tree may never reach the tree it produced from. The lane enforces
  it, by recorded identity rather than by path.

TAKEN TOGETHER THEY MAY LEAVE NOWHERE TO PUT THE NOTE. The open folder is the
driven product, so rule one sends the note there. Rule two forbids that. Rule
three forbids the obvious alternative, because the driven tree is the one the
system produced, and writing back to its producer is the direction the guard
was built to stop.

## Why it is an assumption and not a fact

NOBODY HAS RUN IT. The foreign-driving capability is not built, so the three
rules have never met in a live call. The collision is read off the text.

THE DECLARED-ROOT DOOR MAY ALREADY ANSWER IT. The lane can declare another
folder as a writable root, and its own card names that as how this system drives
a project that is not itself. Whether that door survives the produced-tree guard
in this direction has not been checked, and checking it is cheap.

## Why it is graded abrasive rather than worse

IT COSTS NOTHING IN THIS ITERATION. Nothing here drives a foreign product, and
no state in i9 writes a note from inside one.

IT COSTS A DESIGN DECISION LATER. Whoever builds foreign driving meets it on
their first machinery note, with the folder rule already hardened everywhere
else and harder to bend by then.

## Probe

READ THE GUARD AND ASK IT THE DIRECTION QUESTION. The clause compares recorded
identities. One reading of the source settles whether it blocks a write from a
produced tree to its producer, or only the reverse.

THEN TRY THE DECLARED ROOT AGAINST IT. Declare the system's own tree as a
writable root from inside a produced project, and see whether the guard fires.
That is a single call and it converts this entry from open to closed.

## What this iteration deliberately did not do

IT DID NOT CHANGE THE FOREIGN-DRIVING USE CASE TO MATCH. That use case already
carries the separation as a demand, and the demand is right. Weakening it to fit
a collision nobody has confirmed would trade a correct requirement for a
convenient one.
