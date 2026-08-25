---
kind: matrix-row
name: draft-vision
statement: Draft the vision packet. It holds the big idea and the world it makes.
state_kind: work
filled_by: agent
depends_on:
  - spawn-for-motivation
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
    description: one breath, standalone-readable
    omit:
      - minor
    guidance: |
      One or two sentences a stranger understands with no context. Say what
      the product does and why anyone would want it. No history, no method
      words. Read it alone: if it is not interesting by itself, stop here.
  - name: to_be_world
    description: who does what in the to-be world, alive
    omit:
      - minor
    guidance: |
      Describe a working day AFTER the product exists. Name people by role.
      Present tense, a scene, not a feature list. The reader should be able
      to picture the screen and the hands on it.
  - name: goal_system
    description: goals, conflicts named openly, priority order ruled
    guidance: |
      List the goals the product serves, most important first. Where two
      goals pull against each other, say so openly and rule which one wins.
      A goal list without a named conflict is usually hiding one.
      The method: [[meth-goal-system]].
  - name: moore_pitch
    description: all five slots filled
    omit:
      - minor
    guidance: |
      Fill the five slots in this exact shape: FOR (target customer) WHO
      (need), THE (product name) IS A (category) THAT (key benefit).
      UNLIKE (main alternative), OUR PRODUCT (key differentiator).
      One phrase per slot, no slot skipped. The method: [[meth-moore-pitch]].
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
  ONE QUESTION SURVIVES AT THIS SIZE: the goal system. A minor cannot move
  the big idea, the to-be world or the pitch - a product whose identity
  changed is not a minor - so the form drops those three mechanically
  rather than asking anyone to answer them briefly.

  WHAT IS STILL WORTH ASKING: a delta can pull an existing goal against
  another one. Naming that conflict, and ruling which wins, is cheap here
  and expensive anywhere later.

  ESCALATE: a delta that needs a NEW goal is arguing for a new vision.
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

Vision FIRST. It is the stop-or-continue filter: if the vision alone is not
interesting, nothing downstream matters.

The method, start to pitch, is [[meth-motivation]].

- The big idea in one breath.
- The to-be world alive, not abstract.
- The goal system, with conflicts named openly ([[meth-goal-system]]).
- The pitch last ([[meth-moore-pitch]]).

The vision is axiomatic. Nothing derives it, and the gate adjudicates whether
it is worth having.

INHERIT where possible. If this iteration reuses an existing design and does
not deviate from the resident vision, satisfy this state with a pointer plus
the delta.

Do not re-derive the axiom.
