---
id: adr-no-quack-data-home
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
statement: The .quack folder is eliminated everywhere — recorded truth (attest ledger, ears baseline, iteration settings) moves under spec/ (spec/ledger/, spec/project.toml, which also becomes the workspace root marker), every regenerable cache and raw note moves to a workspace-first user data home (one dir per workspace with kind subfolders, path canonicalized before hashing and slugging), and machine-local overrides move to one global user config — chosen over keeping .quack as plumbing (the 2026-06-30 decision, superseded by the owner 2026-07-04) and over a kind-first data layout (scatters the amnesia test).
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Sort criterion: recorded adjudication truth vs regenerable. Invariants gained, both selftest-able: git status clean after any non-truth command; deleting the data home loses nothing adjudicated. Migration (state, 30+ notes, two split log homes) rides the M6 build with the i8 verified-move pattern.
