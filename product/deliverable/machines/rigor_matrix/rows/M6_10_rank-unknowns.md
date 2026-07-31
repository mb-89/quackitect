---
kind: matrix-row
name: rank-unknowns
statement: Rank the unknowns and timebox the spikes - seeded from RAID, tripwires and doubtful verify methods.
state_kind: work
filled_by: agent
depends_on:
  - gate-architecture
seeds: spikes
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
  - name: ranking
    description: "the unknowns ranked, with what-if-wrong"
  - name: seeded
    description: "the spike list with timeboxes"
major: full
minor: tailored
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: RAID, tripwires and doubtful verify methods feed the
  ranking; the spike machine seeds one timeboxed spike per chosen
  unknown. A major with zero spikes is legal but rare - record the "none"
  argument carefully.
minor_note: |
  Applies where the delta carries unknowns: rank them, spike the ones
  that would hurt most if wrong, timeboxed. NONE IS A NORMAL OUTCOME -
  record "no unknowns worth a spike" and move on; do not invent spikes
  to fill the state.
patch_note: |
  Does not apply. An unknown big enough to spike is bigger than a patch.
  STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the ranked unknowns with what-if-wrong. At rest the
  list is honest: settled unknowns marked settled with their evidence,
  open ones carried in RAID.
specification_note: |
  DOCUMENT FORM: the ranking as a short table in the iteration record -
  unknown, what-if-wrong, spike or none. The book does not carry it;
  RAID carries the survivors.
---

## Guidance

Sources: the RAID register, the M5 tripwires, any requirement whose verify_method is doubtful. Rank by exposure - risk-based testing's probability times consequence ([[meth-risk-based-testing]]). This state SEEDS the iteration's spike machine: one parallel spike per chosen unknown, each timeboxed ([[meth-spike-tracer]]).
