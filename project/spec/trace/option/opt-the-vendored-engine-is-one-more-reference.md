---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-vendored-engine-is-one-more-reference
type: "[[option]]"
cluster: the-bootstrap
question: how upstream's later work reaches a copy
statement: the vendored source is one entry in the reference set the system already refreshes at the start of an iteration, and taking an update is a named pull from an engine the person names at the time
found_by: heuristic
source: "owner design input, 2026-08-18 — 'vendor code is also a reference', and 'I can pull an engine update, and I can name which engine I want to pull from'. Rests on the heuristic ONE SOURCE OF TRUTH; EVERYTHING ELSE DERIVES."
---

## Mechanism

THE SYSTEM ALREADY HAS A REFRESH POINT. At the start of an iteration it checks
out its references and asks which are out of date. That is the frozen-window
shape: pull at the start, freeze in between, push at ship.

THE OWNER'S MOVE IS TO STOP TREATING THE VENDORED ENGINE AS SPECIAL. It is one
more reference in that set. Its staleness is asked the same way, at the same
moment, by the same machinery.

AND THE UPDATE IS A NAMED PULL. The person says which engine to pull from, at
the time they pull. Nothing is recorded in the tree about where the copy came
from, because the source is supplied by whoever asks.

## What it buys

ONE MECHANISM RATHER THAN TWO. Every other option on this cell adds machinery
that exists only for the engine. This adds none, because the staleness question
already has an owner and a moment.

AND IT SIDESTEPS THE POINTER QUESTION ENTIRELY. There is nothing to record, so
there is nothing to go stale, nothing to break on a move, and nothing to lose on
a clone. Naming the source at pull time is the same answer
[[opt-the-tree-is-named-each-run]] gives to a different question, and it costs
the same thing: the person has to know.

IT ALSO ANSWERS A CASE THE REFERENCE MECHANISM CANNOT SEE ON ITS OWN. A source
that is not this copy's ancestor is invisible to a staleness check, because
there is no lineage to compare against. Naming the engine explicitly is what
makes pulling from a non-ancestor expressible at all.

## What it costs, and the owner named it first

MERGING IS THE OPEN PROBLEM AND IT IS NOT SOLVED BY THIS OPTION. The owner's own
words: "Problem is a bit merging and stuff like this. I'm not sure if this is
something that we can do mechanically."

THAT IS THE HONEST STATE OF IT. This option says WHEN an update is asked for and
WHERE it comes from. It says nothing about what happens when the incoming change
and the copy's own change occupy the same lines, which is the question the whole
rest of this cell is about.

SO IT COMPOSES RATHER THAN COMPETES. It needs a partner:
[[opt-the-update-arrives-as-a-program]] avoids the merge entirely by shipping a
transformation, and [[opt-the-copys-changes-are-derived-on-every-update]] does a
three-way merge and writes out the delta. Either answers the half this one
leaves open.

AND PULLING FROM A NON-ANCESTOR IS HARDER THAN PULLING FROM ONE. With no shared
history there is no merge base, so a three-way merge has nothing to stand on. A
transformation shipped as a program does not need one, which is the argument for
pairing this with that.

## Where it came from, and why that matters

THIS IS DESIGN INPUT RATHER THAN PRIOR ART, and it is recorded as such. The
owner has not thought it through and said so.

WHAT MAKES IT WORTH A CELL is that it is the only option here that reuses a
mechanism the system already runs. Every other one on this question is new
machinery, and a chart with no reuse option would be hiding the cheapest answer.
