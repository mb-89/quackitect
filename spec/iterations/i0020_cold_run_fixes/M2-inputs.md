# L2 - Delta map · i0020_cold_run_fixes

## Fix-to-requirement delta  → i20-m2-delta
Each fix names what it repairs. No fix adds a new user-facing capability, so **no new requirement is minted** - every step amends behavior an existing requirement or doc already claims (the bugfix rule: the test verifies the EXISTING requirement the bug violated).

| fix step | repairs |
|---|---|
| i20-m4-shim | `req-go-port.5` (dependency prompt/fallback promise in dependencies.md) - the documented go-bin lane actually works: dogfood launcher, scaffolded launchers, and the engine's internal `go build` (ratchet) resolve the shim |
| i20-m4-edges-default | `req-connections-lanes` intent - `start init` scaffolds `edges=connections` like `start stubs` already does; compose-reference wording says JSONL is the lane for new work |
| i20-m4-template-clean | `start stubs` template contract - example nodes must not flip a live board red or hard-refuse the strict graph (observed: ex-need/ex-usecase coverage holes + dangling ex-connections after cleanup) |
| i20-m4-defer-port | AGENTS.md/engage.md documented reaches (`defer`, `retire`) - docs promise them; the Go engine refuses them |
| i20-m4-schema-home | vehicle resolution (`req-engine-vehicle-overlay`) - lint's schema home resolves vehicle->engine instead of the hardcoded dogfood path |
| i20-m4-seed | compose toil (method promise: "bake the checklist") - cheap slice or explicit defer |
| i20-m4-guard | integrate.md bootstrap flow - the vehicle-spec-vs-driven-workspace confusion gets a doc warning + a cheap lint (vehicle with iterations, empty product/) |
| i20-m4-docs-batch | doc drift: vehicle/overlay guide missing; project_types/classes/ mislabeled; README walkthrough-link placement (already edited locally, folds in); NFR ISO-quality-use-case convention into compose-reference |

## Requirements traced  → i20-m2-req-traced (derived)
No new requirements in scope i0020 - computes trivially green.

**Verdict:** delta complete; nothing new to trace. Gate blessed actor=agent per the owner's explicit L2/L3 authorization (this session, after the L1 pager).
