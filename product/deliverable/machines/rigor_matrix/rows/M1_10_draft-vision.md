---
kind: matrix-row
name: draft-vision
statement: "Draft the vision packet: the big idea, the to-be world, the goal system, the Moore pitch."
state_kind: work
filled_by: agent
depends_on:
  - gate-kickoff
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_web_search
  - se_web_fetch
evidence:
  - name: big_idea
    description: "one breath, standalone-readable, lineage named"
  - name: to_be_world
    description: "who does what in the to-be world, alive"
  - name: goal_system
    description: "goals, conflicts named openly, priority order ruled"
  - name: moore_pitch
    description: "all five slots filled"
major: tailored
minor: inherit
patch: none
product: full
specification: full
major_note: |
  INHERIT-WITH-JUDGMENT: point to the resident vision and argue in one
  paragraph whether the change bends it. A major that leaves the vision
  untouched inherits; one that shifts a goal or a conflict rewrites the
  affected part of the packet, and only that part.
minor_note: |
  INHERIT with a delta note. Point to the resident vision; state in one
  paragraph how the delta serves it. The axiom is not re-derived.

  ESCALATE: a delta the resident vision cannot absorb reframes the
  product - that is major at least, and the vision walks in full there.
patch_note: |
  Does not apply. The vision is axiomatic and a patch never touches it.
  STRIKE PROPOSAL - owner adjudicates.

  ESCALATE: a patch that finds itself wanting to reword the vision is not
  a patch.
product_note: |
  STANDING ARTIFACT: the vision packet - big idea, to-be world, goal
  system, pitch. It is the spec's opening chapter and the axiom every
  smaller column inherits by pointer. At rest it reads true; the moment
  it does not, the product owes itself a major.
specification_note: |
  DOCUMENT FORM: the book's opening chapter. The big idea and to-be world
  as marked prose (ai-involvement marks, no unmarked path in); the goal
  system as a list with conflicts named; the Moore pitch verbatim in its
  five-slot shape. Harvest v1's M1 template with its fill comments - the
  comments guide the author and are stripped at render.
---

## Guidance

Vision FIRST - it is the stop-or-continue filter; if the vision alone is not interesting, nothing downstream matters. The big idea in one breath, lineage named. The to-be world alive, not abstract. The goal system with conflicts named openly ([[meth-goal-system]]). Close with the pitch ([[meth-moore-pitch]]). The vision is axiomatic: nothing derives it; the gate adjudicates whether it is worth having.

INHERIT where possible: if this iteration reuses an existing design and does not deviate from the resident vision, satisfy this state with a pointer plus the delta - do not re-derive the axiom.
