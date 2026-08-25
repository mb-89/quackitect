---
kind: matrix-row
name: write-requirements
statement: "Write the requirements in full: EARS, four kinds, detail included - verify_method named on every one."
state_kind: work
filled_by: agent
patch: tailored
minor: full
major: full
product: full
specification: full
patch_note: |-
  CLARIFICATION ONLY, the same law as frame-delta at this size: an unclear
  requirement whose wording produced the wrong output is repaired in place.
  EARS shape and verify_method survive the edit; breaks_if_removed stays.
  No new requirement rows.

  ESCALATE: a repair that changes what the requirement DEMANDS - not how
  clearly it says it - is a minor. The diff is the tell: a reworded line
  is a patch, a new or deleted line is not.
minor_note: |-
  APPLIES IN FULL for the delta - this row is what a minor IS. Every new
  or changed requirement: EARS shape, its kind, verify_method named,
  breaks_if_removed filled, source_refs to the new stories. No TBD
  survives, exactly as at product size. The resident register is extended,
  never forked.
major_note: |
  Applies in full: the change's requirements complete - EARS, kinds,
  verify_method, breaks_if_removed, source_refs - AND the standing rows
  the architectural move touches are re-read for continued truth. No TBD.
product_note: |
  STANDING ARTIFACT: the requirement register - EARS, four kinds,
  verify_method and breaks_if_removed on every row, sourced to
  stakeholders and stories. This is the spec's load-bearing table at
  rest is complete and consistent. No TBD survives, and no row is an orphan.
specification_note: |
  DOCUMENT FORM: requirements as NODES, one file each - EARS statement,
  the kind and the verify method in frontmatter, beside what breaks and its sources. The
  book's requirements table DERIVES via query (v1's .base pattern); the
  design-input chapter transcludes the register. Never a hand-maintained
  table.
depends_on:
  - spawn-for-requirements
entry_read:
  - deliverable/machines/methods/meth-requirement-authoring.md
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
  - name: register
    template: refs
    of: requirement
    covers: use-case
    description: the requirements THIS delta touched, one node reference per line — the corpus answers which exist, and only you know which this record moved
  - name: set_criteria
    template: per-item
    items:
      - complete
      - consistent
      - affordable
      - bounded
      - comprehensible
      - no_tbd
      - behaviour_modelled
      - quality_groups_swept
    description: the set-level questions, each answered with the argument that makes it true — a bare yes is not an answer
---

## Guidance

How to write one row is [[meth-requirement-authoring]], which the entry read demands before this state opens. The statement shapes are [[meth-ears]]; quality scenarios are [[meth-quality-scenarios]]. The rows are NODES shaped by [[requirement]] - the register field carries references, never prose.

Derive from the use-case steps and extensions. `refines` names the use cases; a cross-cutting quality names every use case whose pass it protects. `source_refs` carries the rest: stakeholders, norm clauses, decisions. COVERAGE IS CHECKED, NEVER WRITTEN DOWN. The field declares `covers: use-case`. The engine refuses this state while any requirement refines no use case. It refuses too while any use case is covered by no requirement.

Every row fills its duties:

- kind picked
- verify_method named
- breaks_if_removed filled
- priority set (MoSCoW - the must rows gate M4's candidates, the should and could rows become its scored criteria)

Detail now. No TBD survives this milestone.

THE SET QUESTIONS, one argument each:

- complete - every use-case step and extension has a covering row; name what has none.
- consistent - no two rows conflict, and every term means one thing everywhere.
- affordable - the set is buildable and verifiable together, within the project's means.
- bounded - every row sits inside scope and answers to a source; nothing gold-plated.
- comprehensible - a reader from any involved discipline can say what the system must do, from the set alone.
- no_tbd - the sweep for TBD | TBC | TBR | ??? found zero, and you ran it.
- behaviour_modelled - the LOOK is owed, never the model.
  - Name the rows where a sequence, a state model or a lifecycle earned its place in `## Behaviour`, and name the rows where one would have been noise.
  - "None here wanted one" is a complete answer.
  - A model on every row is slop and worse than the gap it closes (owner correction 2026-08-13). The test and the shapes are in [[meth-requirement-authoring]].
- quality_groups_swept - walk the nine ISO/IEC 25010:2023 characteristics and answer every one.
  - Name the rows that cover it, or say plainly that this change does not touch it.
  - The nine are listed whole in [[sty-what-a-quality-is]] and stand as nodes in spec/trace/use-case/.

THE SWEEP IS NINE ANSWERS, NEVER NINE SCENARIOS (owner instruction 2026-08-19). Walking the whole tree INTO scenarios produces confusion rather than coverage, and that rule stands unchanged in [[meth-requirement-authoring]]. This asks for one line per characteristic saying whether the change touches it. An untouched characteristic is a recorded answer, not a hole to fill.

WHY IT LIVES HERE AND NOT ON THE GATE. The gate carries no fields of its own by owner ruling 2026-08-07. A check already settled elsewhere teaches people to skim when it is asked a second time. The sweep is answered here and ADJUDICATED at gate-requirements, which is where the owner asked to see it.

Position the concrete set against the standard checklists for this deliverable kind ([[meth-state-of-the-art]]). Expect iteration with the functions ([[meth-twin-peaks]]).

## Trial — this row only

The five cells live here as frontmatter instead of in `cells/`. Their files
are still in place and unchanged, so nothing is lost and the old shape still
works. Judge the Bases view, then we convert the other 47 or fall back.

WHAT TO LOOK FOR. The five column values must render and edit as ordinary
table cells. The five `_note` keys are the real question: a block scalar may
show as an editable text field, or it may show as one long unwrapped line.

IF THE NOTES DO NOT RENDER WELL, the fallback is already proven — the voice
matrix keeps the scalar in frontmatter and the prose in the body under a
heading naming the column. The grid stays editable either way.
