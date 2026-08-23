---
kind: matrix-row
name: gate-requirements
statement: "GATE requirements: the end of design input - the binding register blessed."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - derive-functions
  - probe-assumptions
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
  - se_web_search
  - se_web_fetch
evidence: []
major: full
minor: full
patch: none
product: full
specification: tailored
major_note: |
  Applies in full. End of design input; everything after is solution
  space. The set criteria are argued for the register as it now stands.
minor_note: |
  APPLIES IN FULL, scoped to the delta. The new rows are verifiable,
  traced and function-covered, and probed. The SET criteria are re-argued for
  the register as extended - a delta can break the whole set's
  consistency, so the set-level check never shrinks. End of design input,
  at this size too.
patch_note: |
  Does not apply. A clarification edit does not reopen the register's
  bless; the repaired wording rides the patch record and the owner sees it
  at the leave. STRIKE PROPOSAL - owner adjudicates.

  ESCALATE: if the clarification turns out to change meaning, the register
  DID move - that is a minor, and this gate returns with it.
product_note: |
  The product-level bless of the register: design input closed. Standing
  obligation: the register stays blessed as extended - every minor's
  delta re-earns the set criteria, and a suspect ripple reopens exactly
  what it invalidates.
specification_note: |
  DOCUMENT FORM: the gate record into the derived milestone table. The
  blessed register itself is the artifact; the gate leaves only its
  acceptance.
---

## Guidance

Design input ends here. The requirements and the function structure stand blessed. Everything after is solution space.

THIS GATE CARRIES NO FIELDS OF ITS OWN, and that is deliberate (owner ruling 2026-08-07). Six stood here. Each was already settled elsewhere:

- verifiable: the requirement template demands a `verify_method` from a fixed set.
- traced: the register declares `covers: use-case`, checked both ways.
- functions_cover: derive-functions declares `covers: requirement`, checked both ways.
- set_holds: write-requirements asks all eight set questions. It said six while the state asked seven, corrected 2026-08-19 when the ninth-characteristic sweep made it eight.
- breaks_if_removed: the requirement template refuses an empty one.
- assumptions_probed: probe-assumptions refuses a submit while any probe is missing.

A GATE THAT RE-ASKS A MECHANICAL CHECK TEACHES PEOPLE TO SKIM. A field that can only say yes trains the reader to stop reading. The fields that could have said no get skimmed with the rest.

ONE THING THIS GATE DOES ASK, and it is an adjudication rather than a re-check (owner instruction 2026-08-19). Read `quality_groups_swept` from write-requirements. It carries one line per ISO/IEC 25010:2023 characteristic, nine in all.

Rule on every gap it names. Each one stays open with a stated reason, or a row is owed before this gate blesses.

THIS IS NOT THE SKIM-TEACHING SHAPE. The sweep can say no, and it says which of the nine it says no about. What the 2026-08-07 ruling removed was a field that could only ever say yes.

What is left is the four standard rounds. Review per [[meth-gate-review]].
