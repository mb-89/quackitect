---
kind: matrix-row
name: gate-release
statement: "GATE release: docs match the surface, the handover is accepted - the bless ships it."
state_kind: gate
filled_by: agent
depends_on:
  - ship-review
floor: true
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_git
evidence:
  - name: docs_match
    description: "docs complete and matching the actual surface"
    killer: true
  - name: packaged
    description: "versioned, configuration baselined, entry script in place"
  - name: dependencies_ruled
    description: "the ship review done, sticky rulings honored"
  - name: handover_accepted
    description: "the bless is the acceptance"
    killer: true
  - name: market_block
    description: "(market) real-world validation green - blocks the ship only for to-market iterations"
    required: false
---

## Guidance

Review per [[meth-gate-review]]. The retro waits beyond the terminal - its field-feedback question opens the next start. Market iterations: no ship without the real-world checks green.
