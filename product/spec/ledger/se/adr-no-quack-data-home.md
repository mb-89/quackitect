---
id: se.adr-no-quack-data-home
kind: decision
statement: "The .quack folder is eliminated everywhere. Recorded truth, meaning the attest ledger, ears baseline, and iteration settings, moves under spec/ (spec/ledger/, spec/project.toml), which also becomes the workspace root marker. Every regenerable cache and raw note moves to a workspace-first user data home: one dir per workspace with kind subfolders, path canonicalized before hashing and slugging. Machine-local overrides move to one global user config. This was chosen over keeping .quack as plumbing, the 2026-06-30 decision superseded by the owner on 2026-07-04, and over a kind-first data layout, which scatters the amnesia test."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0009_contract_attestation
v1_type: adr
v1_adjudicated_by: human
v1_depends_on: []
v1_class: review
v1_killer: "true"
---

## Rationale (not load-bearing)
Sort criterion: recorded adjudication truth vs regenerable. Invariants gained, both selftest-able: git status clean after any non-truth command; deleting the data home loses nothing adjudicated. Migration (state, 30+ notes, two split log homes) rides the M6 build with the i8 verified-move pattern.
