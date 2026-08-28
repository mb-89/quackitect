---
kind: matrix-row
name: decompose-structure
statement: "Decompose the structure: the winner becomes elements, allocation, interfaces — and every requirement lands on one of them."
state_kind: work
filled_by: agent
depends_on:
  - graft-onto-the-winner
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_file_delete
evidence:
  - name: elements
    template: list
    of: element
    description: the element set — one reference per line, each an element node with its black-box description
  - name: allocation
    template: element-matrix
    of: element
    description: the element matrix — every function's implementers, and every boundary-crossing cell named by its interface
major: full
major_complexity: C4/R4
minor: tailored
minor_complexity: C4/R4
patch: none
product: full
product_complexity: C4/R4
specification: full
major_note: |
  Applies in full: the element tree from the winner's picks, the standing
  system and the grouping judgment; every function allocated to at least
  one element — many-to-many is legal, and the
  spread shows in the matrix; every owed interface named at both ends;
  every requirement satisfied by an element or an interface. What stood before is
  superseded, never left ambiguous.
minor_note: |
  ONE edit is legal at this size: new functions ALLOCATE into existing
  elements, and their requirements land on existing structure. Every new
  function allocated at least once, as ever. Elements, groups and
  interfaces stand.

  ESCALATE: wanting a new element or a new interface IS the architecture
  moving.
patch_note: |
  Does not apply. The structure stands untouched. STRIKE PROPOSAL - owner
  adjudicates.
product_note: |
  STANDING ARTIFACT: THE ARCHITECTURE - the element nodes with their
  black-box descriptions, the allocation on the function nodes, the
  interface nodes with both ends. The single truth the build fills and
  the diagrams derive from. At rest it matches the code.
specification_note: |
  DOCUMENT FORM: the architecture chapter - the element tree and the
  element DSM as DERIVED FIGURES, black-box descriptions as marked prose
  per element, the interface table derived from the interface nodes.
---

## Guidance

The method is [[meth-decompose-structure]] — this is the state where the
winner stops being five picks and becomes a structure. Three acts, in a
LOOP, all in this one state because each moves the others:

- ELEMENTS. Derive the element set from three sources: the winner's picks
  (each mechanism becomes one or more elements), the standing system
  (brownfield joins as it is), and the grouping judgment (substrate shared
  by several picks becomes its own element). One element node each, black
  box described as it is named. The `group` key on the element node holds
  the grouping — the same mechanism the function clusters use.
- ALLOCATION. Every element names the functions it realizes in
  `implements` — the same direction as `refines` on a requirement: the
  newer artifact points at what it derives from. NOT one to one: several
  elements or interfaces may implement one function, and the spread is
  information. Checked: every function implemented at least once, nothing
  implementing nothing — review-class now, engine-computed later.
- INTERFACES. Where a flow's producer and consumer land in different
  elements, that element pair OWES an interface. The owed cells are
  computable from the flows and the allocation; each one is answered by an
  interface node naming both ends, the flows it carries, and its concrete
  form. An interface no crossing demands is a question in the other
  direction.

THE TRACE IS COMPLETE, ON TWO PATHS (owner ruling 2026-08-10: residue is
not allowed — a trace with holes cannot show the changes).

MOST REQUIREMENTS REACH THE STRUCTURE TRANSITIVELY: served by functions,
implemented by elements, and nothing is written twice.

A REQUIREMENT THE FUNCTION CHAIN CANNOT CARRY is named DIRECTLY in the
answering element's or interface's `satisfies`. That covers a structural
quality the shape answers, and an imposed constraint binding a choice.

THE UNION IS THE BAR: every requirement reached by one path or the other,
zero unreached, counted in the trace_complete field.

THE BASELINE WORD survives only for the closing act: what stood before is
superseded, and change from here means a new baseline (the CM law).

THE RECORDED TRADEOFF: the corpus decomposes per candidate, inside solution
elaboration, and compares structures. This machine compares at pick grain
and decomposes ONCE, after the winner — one decomposition instead of five,
at the price that the scores judged mechanisms, not structures.

## A FLOW THAT CROSSES THE EDGE BECOMES AN INTERFACE TO ITS NEIGHBOUR

Owner ruling 2026-08-15: "Obviously we have interfaces to our neighbours.
They need to be modelled. In the early phases, neighbours have flows, and
then when we make the flows concrete, they have interfaces. There is no way
around this."

THE LAW, checked both ways like every other coverage law here.

- Every flow marked `crosses: in` or `crosses: out` has an interface naming
  the element on our side and the NEIGHBOUR on theirs.
- Every element-to-neighbour interface carries at least one crossing flow.

Direction in means the neighbour is the source. Direction out means the
neighbour is the sink. `nbr-` is a legal target for an interface edge, which
before this ruling it was not.

## Why this state and not M4

M4's flow closure EXCUSES a crossing flow the half that faces the world, and
that is right: at M4 there is no design yet to name the other side. The
excusal was never collected anywhere.

THE MEASUREMENT THAT SET THE RULE, 2026-08-15: 26 flows carried `crosses:`,
40 interfaces existed, and a search of every interface and element file for
`nbr-` returned ZERO. Twenty-six declarations that something crosses the
edge, and not one saying what is on the other side.

Among them were flow-surface and flow-instruction crossing out — the person's
screen and the agent's answer — and flow-intent crossing in, the person's own
words. The three boundaries the product exists to serve, each declared at M4
and then dropped.

THE GENERAL SHAPE, worth more than this instance: AN EXEMPTION GRANTED IN AN
EARLY PHASE IS A DEBT ON A LATER ONE. Wherever a law says "excused here",
something must collect it later, or the excusal is a silent permanent hole.

THE ENGINE CHECK IS OWED. Until it lands the law holds by authorship at this
state's submit, and trace-design re-checks it after the build like the other
structural laws.
