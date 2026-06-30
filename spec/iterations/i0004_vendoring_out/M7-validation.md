# M7 — Validate & accept (i0004_vendoring_out)

## Meets the need  → i4-m7-meets-need  *(killer)*
need-workspace-drive met: one engine drives a selectable workspace. Demonstrated — the duckpond vehicle
drove a separate dummy workspace via `--base`, engine resources resolving from the vehicle while ALL
project state (attest ledger, gather, snapshot) wrote under the workspace. Validated against all needs
across every iteration (global): 136 gates, 0 suspect.

## Killer use-case demonstrated end-to-end  → i4-m7-killer-ucs-demonstrated  *(killer)*
The acceptance bar, done for real (not "tests green"):
1. `quack start init` scaffolded a vehicle (duckpond) with the new engine.
2. The vehicle created a DUMMY workspace (ws-dummy) — its own state root.
3. The vehicle's engine drove that workspace through a FULL systematic iteration (M1–M8) on EMPTY
   content — every milestone argued as a machinery exercise — and ALL 17 gates went DONE, 0 suspect.
   Derived coverage (req-traced) auto-passed vacuously; review gates blessed with machinery rationale.
4. State (attest.json, gather, state.json) lives under the workspace; the engine stayed read-only.

## Acceptance obtained  → i4-m7-acceptance-obtained
The human walked M1–M7 and blessed each gate. The working engine (workspace base selector, quack build,
white-label, .claude vendoring, the unified evaluators, 22 green selftests) is the evidence.

## Validation gaps (RAID)  → i4-m7-validation-gaps
- The verdict-link shows the milestone evidence doc, not yet the raw bless attestation (who/when/hash);
  the deeper attestation view is a follow-on.
- selftest:workspace asserts the ENGINE/ROOT split wiring; the full --base drive is proven by the live
  M7 demonstration rather than a standing in-process check.
- Signed-release binary still carried forward from i3.
