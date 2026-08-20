---
template: item-flow
artifact: node
id_prefix: flow-
folder: spec/trace/flow
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: kind
    one_of:
      - material
      - energy
      - signal
    hint: the flow trinity — a function structure moves one of these three
  - field: crosses
    one_of:
      - in
      - out
    hint: only a BOUNDARY flow carries this — in comes from the world, out goes to it
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: an unnamed flow connects nothing
  - field: statement
    ban_phrases:
      - and so on
      - etc.
      - including but not limited to
    hint: a flow is one thing, so an open-ended clause means it is two
---

# flow — one thing that moves between functions

Lives in `spec/trace/flow/`.

A STANDING ARTIFACT, like a requirement.

One function produces it and another consumes it. That pair is the only thing
saying those two functions are connected, and the whole function DSM is built
from nothing else.

## WHY IT IS A NODE AND NOT A WORD

Because a word does not match.

Written as prose, one function put out "the walk's recorded position" and
another took in "walk position". A reader sees one thing. A string comparison
sees two, so the edge between those functions never existed.

WORSE, THE PROSE WAS NOT EVEN A NAME. Real outputs read "one instruction,
with its owed documents" — a thing plus a clause about it. Nothing could ever
have matched that, so the fix was never alignment. It was rewriting every
input and output into a name, which is authoring, and authoring belongs where
the function is written.

So a flow is picked from a list. Two functions naming the same flow are
connected BY CONSTRUCTION, and there is no reconciliation step anywhere.

## THE NAME IS THE THING, NOT THE SENTENCE ABOUT IT

- "the walk's recorded position" — a flow.
- "the walk's recorded position, once the conditions pass" — a flow plus a
  condition. The condition belongs on the function's `controls`.
- "one instruction, with its owed documents" — two flows, or one flow whose
  name is "the instruction".

THE TEST IS ONE QUESTION. Could two different functions both name this,
without either bending its meaning? If not, it is prose.

## THE TRINITY

`kind` is material, energy or signal. Pahl & Beitz: a function structure
moves those three and nothing else.

Most of a software product's flows are `signal`. That is fine and expected.
The field earns itself where a product is not only software, and it costs one
word where it is.

## THE BOUNDARY IS WRITTEN DOWN

Most flows run between two functions. A few cross the system's edge, and
those say so.

- `crosses: in` — the world makes it. The person's intent, a filled claim,
  what came back from a search.
- `crosses: out` — the world takes it. The instruction, the trunk, what a
  person sees.
- absent — internal. It runs from one function to another.

WHY IT LIVES HERE AND NOT ON THE OVERALL FUNCTION. Inferring the boundary
from the root's own lists would force every external input onto the root,
and the root would end up describing the whole system instead of the one
thing it does.

This is IDEF0's A-0 context arrow, written on the arrow.

## WHAT THE ENGINE CHECKS

Both directions, mechanically, and neither is anybody's judgment.

- A flow no function produces, and which does not cross in. Something
  consumes what nothing makes.
- A flow no function consumes, and which does not cross out. Something is
  made that nothing wants.

Both are holes in the function structure, and both are invisible until the
flows are written down.

The check is `deliverable/engine/bin/flow-closure.ts`, and it runs as derive-functions'
exit script.

## Fields

- `id` — `flow-<slug>`.
- `type` — `"[[flow]]"`.
- `statement` — the thing itself, named. Not a sentence about it.
- `kind` — material, energy or signal.
- `crosses` — `in` or `out` on a boundary flow. Absent on an internal one.
- `source_refs` — where it came from, if anywhere beyond the functions.

## Skeleton

```
---
id: flow-{{slug}}
type: "[[flow]]"
statement: {{the thing, named}}
kind: signal
source_refs:
  - {{where it came from, or none}}
---
```

## Sources

- Pahl & Beitz, Konstruktionslehre. Function structures move material, energy
  and signal.
- IDEF0. Inputs and outputs as the arrows between activities.
- The SyA corpus at @ai/sya_kb, chapter 01: transformation, transport and
  storage of information, energy and material.
- Lindemann, Structural Complexity Management. The DSM is built from one
  consistent relation, and here that relation is the flow.
