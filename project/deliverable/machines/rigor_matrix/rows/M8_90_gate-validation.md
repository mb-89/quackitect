---
kind: matrix-row
name: gate-validation
statement: "GATE validation: meets the need - and this bless IS the sign-off."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - fill-story-evidence
  - sweep-consistency
  - log-gaps
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_test
evidence:
  - name: meets_need
    description: every need's pass lines demonstrated, all iterations
  - name: killers_demonstrated
    description: each killer use case exercised end to end
  - name: acceptance_converted
    description: executable slices now permanent acceptance scenarios, or reasons
  - name: consistency_swept
    description: the surfaces agree with the behavior
  - name: gaps_logged
    description: validation gaps in RAID
  - name: market_tier
    description: (market) the real-world checks green - required only when the iteration is declared to market
    required: false
major: full
minor: tailored
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: every need's pass lines demonstrated, killers
  exercised end to end, acceptance scenarios converted, sweep done, gaps
  logged. The bless is the sign-off.
minor_note: |
  The killer holds scoped: the DELTA's pass lines demonstrated, its
  killer use cases exercised end to end, sweep done, gaps logged. The
  bless is the acceptance, as ever. The full all-stories walk belongs to
  product cadence, not to every minor.
patch_note: |
  Does not apply. The green battery, the refreshed slide and the sweep
  carry the validation burden at this size; the owner's look at the leave
  form is the acceptance. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  The product-level acceptance: every need's pass lines demonstrated
  across all iterations. Standing: the demonstrations are repeatable -
  the killer demos live as runnable scenarios, not as one-time theater.
specification_note: |
  DOCUMENT FORM: the gate record - the bless IS the sign-off, hash-bound,
  no second artifact. Renders into the derived milestone table.
---

## Guidance

Review per [[meth-gate-review]]. The bless is the acceptance act: hash-bound, channel-recorded - no second sign-off artifact. Market iterations only: the expensive real-world tier is mandatory before this gate.
