---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-one-declaration-of-what-the-machine-state-folder-is
type: "[[option]]"
statement: Declare what the machine-state folder is in exactly one place, and have path resolution, the packaging exclusion and the editor's own exclusion all derive from that declaration rather than each carrying its own copy of the answer.
cluster: the-walk
question: how everything agrees where the machine state is
found_by: heuristic
source: One source of truth; everything else derives.
---

## Mechanism

FOUR MECHANISMS NOW NAME THE SAME FOLDER. Path resolution decides where it is.
Packaging decides that it must not ship. The editor's settings decide whether a
person sees it. The launcher decides whether this folder is a project at all.

TODAY EACH HOLDS ITS OWN ANSWER, and nothing makes them agree. One declaration
holds the name and the rule, and the other three are generated from it.

## Why the collapse makes this urgent rather than tidy

BEFORE, THE FOLDER SAT OUTSIDE THE PACKAGED ROOT. Excluding it was a boundary
that already existed. After the collapse it sits inside, so every consumer has
to know about it deliberately.

THE M2 GATE ALREADY CAUGHT TWO COPIES DRIFTING. Its prior-art comparison forced
two corrections on our own text, both recorded in `gate-inputs`.

- We claim to need no marker file. After the collapse, a check for the
  machine-state folder at the root IS a marker check, whatever we call it.
- "Hidden" buys less than the name suggests. The editor's shipped exclusion list
  names five specific patterns rather than a rule about dots.

ONE BLESSED GOAL SITS DIRECTLY ON THIS. Splitting the lane's exclusion by file
rather than by directory multiplies the patterns, and every added pattern is
another place the copies can disagree.

## What it costs

A DECLARATION SOME CONSUMERS CANNOT READ. An editor's settings file and a
packaging manifest each have their own format, and neither will read ours. So
the derivation is a generation step with its own staleness problem, not a
reference resolved at run time.

GENERATED FILES NEED A CHECK THAT THEY ARE CURRENT. That check is cheap and it
is real work this option creates.

## What it buys

DRIFT BECOMES IMPOSSIBLE RATHER THAN UNLIKELY. A pattern added in one place and
forgotten in another is the failure mode, and it is silent in the direction that
matters: private session state shipping to a stranger.

## Its sibling row, same rule and a different subject

`req-what-the-corpus-is-has-one-answer` IS THIS RULE APPLIED TO THE CORPUS. This
option applies it to the folder that holds the corpus. Neither implies the
other, and a design could take one without the other.
