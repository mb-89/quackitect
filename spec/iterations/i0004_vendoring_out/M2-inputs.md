# M2 — Requirements (i0004_vendoring_out)

## Inputs captured  → i4-m2-inputs-captured
- The 6 i3-retro inbox notes (quack build, M7 killer-uc demo, report verdict-link, graph nesting, tests-pass/gateState unify, no-trace-gate invariant).
- The vendoring-out work shipped this session (vendor model, start init, white-label, .claude vendoring).
- Prior art: sebot tools take a `base`; all project state under it (engine stateless). git -C.
- The user's acceptance bar: vehicle → dummy workspace → full systematic iteration on empty content → all green.

## Requirements traced  → i4-m2-requirements-traced  *(derived: coverage:req-traced — DONE)*
Every requirement refines a use-case that refines need-workspace-drive.

## Requirements verifiable  → i4-m2-requirements-verifiable  *(derived: coverage:req-has-test — DONE)*
Each of the 10 requirements has a verifying test (selftest:* or an existing one).

## Stakeholder coverage  → i4-m2-stakeholder-coverage
- Builders shipping branded engines → uc-ship-branded-engine.
- Users driving other projects → uc-drive-other-workspace.
- Dogfood / self → uc-self-workspace. Board reader → uc-review-board. Maintainer ergonomics → req-quack-build.
