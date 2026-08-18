---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: cand-nothing-but-a-channel
type: "[[candidate]]"
name: "Nothing but a channel"
statement: "keep the predecessor's shape entirely and change one thing: the copy carries history, so an update has something to merge from"
picks:
  - "[[opt-a-clone-that-keeps-its-history]]"
  - "[[opt-a-mirror-beside-an-overlay]]"
  - "[[opt-an-override-pins-what-it-was-cut-against]]"
  - "[[opt-the-executable-finds-its-own-home]]"
  - "[[opt-layered-path-search]]"
  - "[[opt-the-override-replaces-the-whole-artifact]]"
  - "[[opt-the-vendored-engine-is-one-more-reference]]"
  - "[[opt-producing-happens-outside-the-lane]]"
  - "[[opt-the-overlay-is-declared-by-key]]"
---

## Why this one

THE SMALLEST THING THAT COULD WORK. Every cell except the first is what the
predecessor already shipped and ran for a year, and the one change is the one
the owner's demand actually requires: a copy that can pull an engine update
needs a commit in common with the engine.

WHAT IT TRADES AWAY is everything the survey found. Overriding one line means
owning the whole file. A rename upstream breaks an override silently, because
resolution keys on path. And the export stays outside the lane, so the CREATE
VEHICLE button the owner asked for has nothing to call.

IT IS ON THE CHART AS THE FLOOR. Nobody can say what the other three cost
without a line that costs almost nothing.

## How it works

EIGHT OF NINE CELLS ARE THE PREDECESSOR'S, and the ninth is the change.

THE COPY IS AN ORDINARY CLONE. It carries the source's commits, this project's
own expedition records are removed, and the name is written into the one file
that holds it. Everything else about producing it is what the export script does
today, still as a script a person runs.

THE VENDORED SOURCE SITS IN A MIRROR NOBODY HAND-EDITS, with the copy's own
work in a sibling folder that an update never touches. Resolution joins the
artifact's relative path onto each layer and takes the first that exists, so an
override is a whole file standing in for a whole file. The copy's layer sits
wherever its committed configuration key says, and no key means no layer.

TAKING AN UPDATE IS THE ONE NEW MOTION, and it reuses machinery that already
exists. The vendored source is one more entry in the reference set the system
refreshes at the start of an iteration. Staleness is asked there, at that
moment, by that mechanism. Each override records the version it was cut against,
so the machine refuses when that version has moved.

THE SEAM THAT CARRIES THE WHOLE CANDIDATE is the merge base. Nothing else in
the design changes, and the clone is what makes the reference refresh able to
report anything at all.

WHAT STAYS is the lane, the walk, the trace corpus, the path jail, and the
export script's own guards — an empty destination, three required arguments, no
fallback on the name.

## What it costs

BUILD IS THE SMALLEST OF THE THREE THAT DO ANYTHING. One change to how the copy
is produced, and one entry added to a reference set that already refreshes.
Nothing is bought, one thing is reused, and the mirror-and-overlay layout is
ported from the predecessor rather than designed.

THE WORST CASE IS A CONFLICT ON EVERY RESTRUCTURED FILE, and this iteration
measured it. A copy that merely reordered a file's sections took a merge
conflict on an upstream change to a line it never touched, because a reordered
file reads to a line-based merge as delete-everything plus insert-everything.
That is not the harsh case. It is the gentle one.

NOTHING IS LOST, AND THE EARLIER WORDING SAID OTHERWISE. The run printed
`upstream change landed: True` and `copy's own edit kept: True` beside
`merge exit: 1`. Both versions are present and marked, so the cost is one human
resolution per restructured file, not a change that cannot arrive. Corrected at
the gate of 2026-08-18, where it had read "could not merge" and "a conflict the
copy cannot resolve" — both of which contradict this node's own next paragraph.

THE FAILURE MODE THAT DECIDES is therefore predictable: every update produces
conflicts in proportion to how much the copy restructured, and the copy's owner
resolves them by hand with no help from the system beyond conflict markers.

A SECOND COST IS PAID SILENTLY AND FOREVER. Overriding one line means owning
the whole file, so every later upstream improvement to the untouched parts of
that file never arrives and nothing says so. Three vendoring systems in this
iteration's survey document exactly that consequence in their own words.

## What it leans on

THAT COPIES DO NOT RESTRUCTURE WHAT THEY RECEIVE. The probe says this is the
load-bearing belief: restructuring alone, without touching anything upstream
changes, is enough to make every merge conflict. Nothing in the design
discourages restructuring, and the owner has ruled that nothing is sealed.

THAT THE REFERENCE REFRESH CAN REPORT ON A VENDORED TREE at all. It refreshes
references today; whether it can compare a vendored source against its upstream
and say something useful is not established, and no probe here tested it.

AND THAT CARRYING THE SOURCE'S HISTORY IS ACCEPTABLE. The owner's requirement
says a copy must run WITHOUT NEEDING the history, which this satisfies. Whether
a copy handed to somebody outside the team may CARRY it is a separate question
nobody has answered.
