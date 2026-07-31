---
kind: matrix-row
name: gate-validation
statement: "GATE validation: meets the need - and this bless IS the sign-off."
state_kind: gate
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
    description: "every need's pass lines demonstrated, all iterations"
    killer: true
  - name: killers_demonstrated
    description: "each killer use case exercised end to end"
  - name: acceptance_converted
    description: "executable slices now permanent acceptance scenarios, or reasons"
  - name: consistency_swept
    description: "the surfaces agree with the behavior"
  - name: gaps_logged
    description: "validation gaps in RAID"
  - name: market_tier
    description: "(market) the real-world checks green - required only when the iteration is declared to market"
    required: false
---

## Guidance

Review per [[meth-gate-review]]. The bless is the acceptance act: hash-bound, channel-recorded - no second sign-off artifact. Market iterations only: the expensive real-world tier is mandatory before this gate.
