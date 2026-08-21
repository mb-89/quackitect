---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: fn-run-a-governed-walk.bring-forth-a-vehicle
type: "[[function]]"
cluster: the-bootstrap
statement: produce a complete independent vehicle from the engine under a new name, keeping nothing about it and leaving it no path back
satisfies:
  - req-one-command-produces-a-complete-copy
  - req-the-source-keeps-no-record-of-a-copy
  - req-the-product-name-is-one-fact
  - req-nothing-a-copy-does-reaches-its-source
  - req-an-act-writes-only-the-tree-it-produced
inputs:
  - flow-repository
  - flow-intent
outputs:
  - flow-vehicle
controls:
  - the name, which is one fact and is written once
  - the direction of writes, which nothing the vehicle carries may follow outward
source_refs:
  - uc-vendor-and-overlay
  - raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours
  - vp-the-engine
---

## Renamed 2026-08-18 on the owner's ruling

THIS WAS `bring-forth-a-copy` AND THE WORD WAS WRONG. The owner's words: "It's
not a copy. It's a vehicle. And we are the engine."

A COPY IS A THING THAT DUPLICATES SOMETHING. A VEHICLE IS A THING SOMEBODY
DRIVES. The pair engine-and-vehicle names a relationship; source-and-copy names
an act of duplication, and the relationship is what this whole line is about.

THE REQUIREMENT IDS STILL SAY COPY and are left alone. Ids are contracts and a
rename owes a migration; note-761dbf2a236c carries the reach.

## Rationale

NOTHING HELD THIS BEFORE. The nearest function was read in full and declines it
for a stated reason.

`stand-up-a-product` takes A COMPUTER WITH NOTHING ON IT to a product that is
running. Its subject is the RECEIVING machine: install the toolchain, scaffold a
product, stop before a partial install. This function acts on the ENGINE side
and produces a tree; nothing about it is an install.

THE TWO MEET LATER, and that is fine. A vehicle this function produces is what
`stand-up-a-product` later brings up on somebody's machine. They are a producer
and a consumer of the same thing rather than one act.

## Why keeping no record is part of the same function

IT IS THE SAME DECISION SEEN FROM THE OTHER END. A function that produces a
vehicle is the only place that could record one, so the rule that it must not is
a property of this act rather than a separate behaviour somewhere else.

SPLITTING THEM WOULD LEAVE THE RULE HOMELESS. A prohibition allocated to no
function is a sentence in a document, and this one is graded crippling.

## Why the isolation rule is satisfied here AND at resolve-a-path

THE RULE HAS TWO SURFACES AND THEY ARE DIFFERENT ACTS.

- AT PRODUCTION, it constrains the ARTIFACT: the tree that leaves may contain no
  link, junction, mount or install step whose target resolves outside it. That
  is this function's, because only this function makes the tree.
- AT RUN, it constrains the WRITE: every operation resolves inside a tree the
  system was pointed at. That is `resolve-a-path`'s, because that function's
  whole statement is deciding which tree a path names.

A REQUIREMENT SERVED BY TWO FUNCTIONS IS NOT A DUPLICATE where the two serve
different facets of it. Collapsing them would put the run-time rule inside a
function that runs once, at production, and then never again.

## What this function deliberately does NOT do

IT DOES NOT TAKE UPDATES. Producing a vehicle and later feeding it are two acts,
and until 2026-08-18 the second had no function at all — `flow-vehicle` named it
in prose and handed the mechanism to a crossing so nothing had to model it.

THAT HOLE IS NOW `take-an-update` AND `report-what-the-vehicle-changed`. This
function produces and stops, which is what it always claimed.

## Solution neutrality

COULD TWO HONESTLY DIFFERENT DESIGNS BOTH DO THIS? At least four could, and M4
weighed them.

- A file copy with a fresh repository, which is what the shipped export does.
- A vendoring tool that carries history, so the vehicle knows where it came
  from.
- A mirror-plus-overlay layout, where what came from the engine is never
  hand-edited and the vehicle's own content sits beside it.
- A published archive somebody unpacks, with provenance recorded inside it.

NO TECHNOLOGY IS NAMED IN THE STATEMENT. It says produce, keep nothing, leave no
path. Each of the four satisfies all three and they are not the same design.

WHAT THE STATEMENT DELIBERATELY DOES NOT SAY: whether the vehicle retains any
relationship to the engine. That was the open question of this iteration, and a
function that answered it would have chosen the winner.
