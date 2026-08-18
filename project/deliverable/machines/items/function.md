---
template: item-function
artifact: node
id_prefix: fn-
folder: project/spec/trace/function
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: statement
    ban_words:
      - should
      - would
      - could
      - may
      - might
      - appropriate
      - adequate
      - sufficient
      - robust
      - flexible
      - seamless
      - efficient
      - optimal
      - reasonable
    hint: a weasel word checks nothing, and a function is checked by coverage
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: no TBD survives the milestone
  - field: statement
    ban_phrases:
      - as possible
      - where possible
      - as required
      - as appropriate
      - if necessary
      - including but not limited to
      - and so on
      - etc.
    hint: an open-ended clause hides a function nobody derived
  - field: inputs
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: a function whose input is unknown has not been derived yet
  - field: outputs
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: a function with no named output does nothing anybody can check
  - field: satisfies
    ban_markers:
      - TBD
      - TBC
      - TBR
      - ???
    hint: a function serving no requirement is work nobody asked for
sections:
  - Rationale
---

# function

A function is something the system MUST DO for a requirement. Verb plus noun.
No technology named.

It is the last artifact of design input and the feedstock of M4's
partitioning. Requirements say what is demanded. Functions say what the
system does about it. Neither says how.

## THE STATEMENT IS VERB PLUS NOUN, AND NAMES NO SOLUTION

Write what happens, not what does it.

- "store the walk's position" — a function.
- "write the walk's position to SQLite" — a solution wearing a function's
  clothes. SQLite is M4's to choose, or to reject.

The test is one question. Could two honestly different designs both do this?
If only one could, a design decision has been made early and unrecorded.

WHY IT MATTERS HERE MORE THAN ELSEWHERE. M4 enumerates a space of candidates
from these functions. A function naming a technology has already collapsed
that space to one point, before anybody compared anything.

## THE ID CARRIES THE STRUCTURE, THROUGH DOTS

Functions form a tree. The overall function sits at the root. Sub-functions
hang beneath it.

That tree lives in the ID, as dotted segments.

```
fn-serve-the-walk
fn-serve-the-walk.answer-a-pull
fn-serve-the-walk.answer-a-pull.check-the-conditions
```

- A node's parent is its id with the last segment removed.
- The tree is readable from a list of ids alone, with nothing to cross-check.
- A missing parent is a mechanical defect, not a judgment.

WHY NOT A PARENT FIELD. Because two places would then hold one fact, and one
of them would go stale. The id already had to be unique. Making it carry the
tree costs nothing and cannot disagree with itself.

DEPTH IS NOT A VIRTUE. Three levels is usually enough. A tree deeper than
that is normally a partition (M4's work) that arrived early.

## `satisfies` IS THE COVERAGE EDGE, AND IT IS CHECKED BOTH WAYS

A function names the requirement ids it serves, under `satisfies:`.

THE WORD IS NOT `refines`, and the difference is the point. `refines` means
the child breaks the parent into finer grain, same kind of thing. A function
does not break a requirement into smaller requirements. It is what the system
does so the requirement holds. The schema is [[trace-schema]].

THE EDGE LANDS ON A REQUIREMENT, never on a use case. The chain runs use
case, then requirement, then function. A use case says what somebody does. A
requirement says what is therefore demanded. Skipping the middle link loses
the demand, and it breaks every coverage check, because each one is a claim
about exactly one hop.

That single edge carries both halves of the completeness check, and neither
is anybody's judgment.

- Every function serves at least one requirement. Otherwise it is work
  nobody asked for.
- Every requirement is served by at least one function. Otherwise it is a
  demand nothing does.

The engine checks both directions at the step that lists them. A hole on
either side refuses the submit and names the orphans.

A SUB-FUNCTION MAY INHERIT. Where a parent already names the requirement,
the child need not repeat it. Repeat it only where the child serves something
the parent does not.

## INPUTS, OUTPUTS AND CONTROLS

Each function names what crosses its boundary. This is IDEF0 discipline, kept
light: inputs and outputs always, controls where something governs when the
function runs.

- `inputs` — the flows it consumes.
- `outputs` — the flows it produces. If nothing, it is not a function.
- `controls` — what activates or constrains it. A condition, a rule, a
  clock. Absent where nothing does.

WHY THEY EARN THEIR PLACE. An output nobody consumes and an input nobody
produces are the two commonest holes in a function structure, and both are
invisible until the flows are written down. They are also what M4 partitions
on: a cluster is a set of functions that talk to each other more than to
anything else, and there is nothing to cluster on without the flows.

## A FLOW IS A NODE, PICKED FROM THE LIST

`inputs` and `outputs` name [[flow]] ids. Not prose.

ONE TYPE SERVES BOTH ENDS. The input of one function is the output of
another, so there is nothing to distinguish.

WHY NOT WORDS. Written as prose, one function put out "the walk's recorded
position" and another took in "walk position". A reader sees one thing, a
string comparison sees two, and the edge between those functions never
existed.

The prose was not even a name. Real outputs read "one instruction, with its
owed documents" — a thing plus a clause about it. Nothing could match that.

SO TWO FUNCTIONS NAMING ONE FLOW ARE CONNECTED BY CONSTRUCTION, and M4 has
nothing to reconcile before it can partition anything ([[meth-function-dsm]]).

## Fields

- `id` — `fn-<slug>`, dotted for depth.
- `type` — `"[[function]]"`.
- `statement` — verb plus noun, solution-neutral.
- `satisfies` — the requirement ids this function serves. Requirements only.
- `inputs` — what it consumes, one per line.
- `outputs` — what it produces, one per line.
- `inputs` — the [[flow]] ids it consumes.
- `outputs` — the [[flow]] ids it produces.
- `controls` — what activates or constrains it. Omit where nothing does.
- `cluster` — the [[cluster]] this function belongs to. ONE only, because a
  partition does not overlap. Written at M4 partition-functions.
- `source_refs` — use-case steps, norms, decisions it came from.

## The Rationale section

One short paragraph. Why this function exists as its own node rather than
folded into its parent or its sibling.

The commonest honest answer is that it is allocated separately later. Where
even that is not true, the function is a candidate for folding.

## Skeleton

```
---
id: fn-{{dotted-slug}}
type: "[[function]]"
statement: {{verb}} {{noun}}
satisfies:
  - {{req-id}}
inputs:
  - {{a flow id it consumes}}
outputs:
  - {{a flow id it produces}}
controls:
  - {{what activates or constrains it}}
#
# The cluster this belongs to, written at M4 from the partitioning card. One
# only — a partition does not overlap.
cluster: <!-- a cluster id, written at M4 -->
source_refs:
  - {{where it came from}}
---

## Rationale

{{why this stands as its own function}}
```

## Sources

- Pahl & Beitz, Konstruktionslehre. Overall function, sub-functions, the
  solution-neutral rule.
- VDI 2221. Functions before concepts.
- NASA Systems Engineering Handbook. Logical decomposition.
- INCOSE Systems Engineering Handbook, 4th edition. Logical architecture
  definition, and allocation as a separate act from decomposition.
- IDEF0. Inputs, outputs, controls and mechanisms.
  - The mechanism is deliberately left out here, because naming it is naming a solution.
- v1's design-input chapter, at ref main: "a function is something the system
  must do for a need — verb plus noun, solution-neutral."
