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
    of: element
    description: the element set — one reference per line, each an element node with its black-box description
  - name: allocation
    description: every function carries its element — the DMM read off the function nodes, exceptions argued here
  - name: interfaces
    of: interface
    description: the element DSM's owed cells, each named by an interface node — one reference per line
  - name: requirements_trace
    description: the satisfy coverage — every requirement lands on an element or an interface, and every element and interface answers to a requirement; name what has none
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
- ALLOCATION. Every function carries an `element` key naming exactly one
  element — the same node-borne pattern as `cluster`. Exactly-once is a
  column property; it is review-class now and engine-computed later.
- INTERFACES. Where a flow's producer and consumer land in different
  elements, that element pair OWES an interface. The owed cells are
  computable from the flows and the allocation; each one is answered by an
  interface node naming both ends, the flows it carries, and its concrete
  form. An interface no crossing demands is a question in the other
  direction.

THEN THE TRACE. Every requirement lands on the structure: an element or an
interface carries it in `satisfies`. Both directions are checked judgment:
a requirement nothing satisfies is a hole, and an element or interface
satisfying nothing is gold-plating. The standard vocabulary is SysML's own
— requirements are SATISFIED by structure, behavior is ALLOCATED to it.

THE BASELINE WORD survives only for the closing act: what stood before is
superseded, and change from here means a new baseline (the CM law).

THE RECORDED TRADEOFF: the corpus decomposes per candidate, inside solution
elaboration, and compares structures. This machine compares at pick grain
and decomposes ONCE, after the winner — one decomposition instead of five,
at the price that the scores judged mechanisms, not structures.
