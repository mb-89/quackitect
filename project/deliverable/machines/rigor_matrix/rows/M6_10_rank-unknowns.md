---
kind: matrix-row
name: rank-unknowns
statement: Rank the unknowns and timebox the spikes - seeded from RAID, tripwires and doubtful verify methods.
state_kind: work
filled_by: agent
depends_on:
  - gate-architecture
seeds: spikes
exit_script:
  - project/deliverable/engine/bin/grades-complete.ts
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
  - name: seeded
    template: exposure-pick
    of: raid
    description: the chosen unknowns picked over the exposure chart — the biggest blockers for the coming build that a timeboxed probe can settle; one register ref per line, each becoming one parallel spike state
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

THE RANKING IS A COMPUTATION, never typed (owner ruling 2026-08-10).
Exposure is damage times likelihood — `breaks_how_badly` and `how_likely`
off every open register entry, worst first. The what-if-wrong is the
entry's own `impact` field, on the node where it lives. The register view
shows the ranking; this form does not restate it.

WHAT IS DECIDED HERE is one thing: WHICH unknowns get a spike. That pick
is the `seeded` list — register refs, one per line, picked over the
exposure chart.

THE PICK METHOD, three filters in order:

- EXPOSURE — start at the chart's hot corner and work outward.
- SPIKEABILITY — a timeboxed probe must be able to settle it. An entry
  only living can answer (the machinery's youth, a population measure)
  is not a spike.
- NOT ALREADY PROBED — an entry the iteration's own goal or a standing
  mechanism already exercises gets no second probe.

Sources for the pick: the RAID register, the M5 tripwires, any
requirement whose verify_method is doubtful ([[meth-risk-based-testing]]).

THE SEEDED LIST SEEDS THE SPIKE DRAWING: the record's
`machines/spikes.md` gets one state per listed ref, all parallel, the
join waiting for every one — the same shape as the candidate drawing.
Each spike is timeboxed in its drawn statement ([[meth-spike-tracer]]).
