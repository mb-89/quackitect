---
kind: matrix-row
name: gate-release
statement: "GATE release: the package stands and works - the bless ships it."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - package
floor: true
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
  - se_git
evidence:
  - name: market_block
    description: (market) real-world validation green - blocks the ship only for to-market iterations
    required: false
major: full
minor: full
patch: tailored
product: full
specification: tailored
major_note: |
  FLOOR - applies in full: packaged and checked working. The bless ships
  it.
minor_note: |
  FLOOR - applies in full: packaged and checked working. The bless ships
  it.
patch_note: |
  FLOOR - never struck. Tailored to its one make-or-break check: the
  patch version is packaged and the bless on the record ships it.
product_note: |
  FLOOR, standing: every shipped version passed this gate - packaged,
  checked, blessed. The release history IS the list of these blesses.
specification_note: |
  DOCUMENT FORM: the ship record - the release bless, hash-bound,
  closing the version. The release history derives from these records.
---

## Guidance

Review per [[meth-gate-review]]. The retro waits beyond the terminal - its field-feedback question opens the next start. Market iterations: no ship without the real-world checks green.

TWO ROWS WAIT OUTSIDE THE MATRIX (owner ruling 2026-08-11): finalize-docs returns when the emitted book exists, and ship-review returns when the vendoring and dependency-ruling system does. Their gate fields (docs_match, dependencies_ruled) left with them, and handover_accepted folded into the bless itself.

NO packaged FIELD EITHER (owner ruling 2026-08-11). The package state cannot be left until its own claim stands: the ZIP on disk, and the works check answered yes. This gate depends on that state, so restating it here would be a second copy of a signed claim.
