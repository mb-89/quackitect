---
kind: matrix-row
name: derive-functions
statement: Derive the solution-neutral function structure from the requirements.
state_kind: work
filled_by: agent
depends_on:
  - write-requirements
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
entry_read:
  - deliverable/machines/methods/meth-function-structures.md
exit_script:
  - deliverable/engine/bin/flow-closure.ts
evidence:
  - name: functions
    template: refs
    of: function
    covers: requirement
    description: every function derived here, as a function node reference
    guidance: |
      One function per line.

      The coverage is checked BOTH WAYS, and neither is your judgment.

      - Every function listed serves at least one requirement.
      - Every standing requirement is served by at least one function.

      A hole on either side refuses the submit and names the orphans.

      The tree lives in the ids, through dots. `fn-a.b` sits under `fn-a`.
  - name: flows
    template: refs
    of: flow
    description: every flow the functions move, as a flow node reference
    guidance: |
      One flow per line, minted from the flow template where it does not
      exist yet.

      A FLOW IS A NODE SO THAT NAMES CANNOT MISS. Two functions naming one
      flow are connected by construction, and M4 partitions on exactly
      those connections.

      The closure is checked BOTH WAYS by the exit script, and neither
      side is your judgment.

      - Every flow is produced by at least one function.
      - Every flow is consumed by at least one function.

      A flow with one end is a hole in the structure. Either a function is
      missing, or the flow is not needed.

      A flow that crosses the system's edge SAYS SO, with `crosses: in`
      or `crosses: out`, and is excused the half that faces the world.
  - name: neutrality
    template: free-form
    description: the solution-neutral check — the one thing here no check catches
    guidance: |
      Coverage is mechanical. This is not.

      For each function, ask one question. Could two honestly different
      designs both do this?

      Name any function where the answer was no, and say what you changed.

      Say `none` where every function passed on the first pass.
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies in full for the change's cone: new functions derived
  solution-neutral, coverage closed. The resident structure inherits
  outside the cone.
minor_note: |
  The function structure EXTENDS: new requirements map to new or existing
  functions, solution-neutral, coverage closed for the delta. The
  structure is not re-derived.

  ESCALATE: a new function that fits no existing cluster is the
  architecture moving - the tell that this is a major.
patch_note: |
  Does not apply. No new requirements means no new functions. STRIKE
  PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the solution-neutral function structure, every
  requirement mapped, every use-case step covered. The coverage matrix
  shows no holes at rest.
specification_note: |
  DOCUMENT FORM: function nodes with requires edges; the function
  structure as a DERIVED FIGURE, the coverage matrix as a DERIVED TABLE.
  The design-output chapter holds both, each with its one what-to-see
  line.
---

## Guidance

STANDING ARTIFACT: the solution-neutral function structure. At rest every requirement is served by a function, every function serves a requirement, and no function names a technology.

WHAT A FUNCTION IS: something the system must do for a requirement. Verb plus noun. The node is shaped by [[function]]; the derivation is [[meth-function-structures]], which the entry read demands before this state opens.

THE ORDER IS THE METHOD'S. Requirements first, then functions, then concepts. Pahl & Beitz and VDI 2221 both put task clarification before concepting; NASA and INCOSE both put logical decomposition after the requirements baseline. Deriving functions early means deriving them from a guess.

SOLUTION-NEUTRAL IS THE HARD PART, and it is the one thing no check catches. The test is one question: could two honestly different designs both do this? M4 enumerates its candidate space from these functions, so a function naming a technology has collapsed that space to one point before anybody compared anything.

THE TREE LIVES IN THE IDS. `fn-a.b` sits under `fn-a`.

A node's parent is its id with the last segment removed. The structure is
readable from a list of ids, and it cannot disagree with a separate parent
field.

USE CASES ARE NOT THIS STEP'S BUSINESS. A function serves a REQUIREMENT and
nothing else.

The chain runs use case, then requirement, then function.
write-requirements already closed the first link in both directions.

Re-walking the use cases here would re-ask a question already answered.

EXPECT THE REQUIREMENTS TO MOVE. Deriving functions exposes requirements that were vague, missing or wrong. Go back and fix them ([[meth-twin-peaks]]). A function tracing to nothing is either unnecessary or missing its requirement, and both are findings.
