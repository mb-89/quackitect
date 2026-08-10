---
kind: matrix-row
name: decompose-structure
statement: "Decompose the structure: the winner becomes elements, allocation, interfaces — and every requirement lands on one of them."
state_kind: work
filled_by: agent
depends_on:
  - declare-winner
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
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
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies in full: the element tree from the winner's picks, the standing
  system and the grouping judgment; every function allocated to exactly
  one element; every owed interface named at both ends; every requirement
  satisfied by an element or an interface. What stood before is
  superseded, never left ambiguous.
minor_note: |
  ONE edit is legal at this size: new functions ALLOCATE into existing
  elements, and their requirements land on existing structure. Every new
  function allocated exactly once, as ever. Elements, groups and
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
not allowed — a trace with holes cannot show the changes). Most
requirements reach the structure transitively: served by functions,
implemented by elements, and nothing is written twice. A requirement the
function chain cannot carry — a structural quality the shape answers, an
imposed constraint binding a choice — is named DIRECTLY in the answering
element's or interface's `satisfies`. The union is the bar: every
requirement reached by one path or the other, zero unreached, counted in
the trace_complete field.

THE BASELINE WORD survives only for the closing act: what stood before is
superseded, and change from here means a new baseline (the CM law).

THE RECORDED TRADEOFF: the corpus decomposes per candidate, inside solution
elaboration, and compares structures. This machine compares at pick grain
and decomposes ONCE, after the winner — one decomposition instead of five,
at the price that the scores judged mechanisms, not structures.
