# M7 — Validate & accept (i0003_engine_vehicle_go)

Validate the build against the original need and the M1 Chapter-1 success criteria.

## Meets the need  -> i3-m7-meets-need  (killer)

Each M1 success criterion, demonstrated by a green check the engine runs on itself:

| # | M1 success criterion | check (green) |
|---|---|---|
| 1 | single binary runs on a fresh machine, no Python/uv/network, from an unzipped folder | test-binary-deps (`selftest:deps`) |
| 2 | the report determinism root reproduces the baseline byte-for-byte | test-parity-golden (`selftest:parity`) |
| 3 | a vehicle run resolves engine+vehicle via one overlay chain, engine read-only | test-split-readonly (`selftest:split`) |
| 4 | no node id is declared twice; lint fails on a collision | test-unique-ids (`selftest:ids`) |
| 5 | every subcommand answers -h/--help/-? with no side effects; `-`-ids rejected | test-cli-help (`selftest:help`) |
| 6 | a dependency-check prompt lists each build dep + winget path | test-dep-prompt (`selftest:deps-prompt`) |
| 7 | the report graph filters live (one box) and relayouts, HTML unchanged | test-trace-filter (`selftest:report`) |
| 8 | a vehicle integrates via a documented path; `gather` resolves engine resources through the overlay chain | test-integrate (`selftest:integrate`) — **demonstrated** by scaffolding a throwaway vehicle and running `quack gather` (5 folders resolved) |
| + | feedback under 1s on a 2025 mid-range laptop (responsiveness) | test-responsiveness (`selftest:perf`) |

All green. The need — a reusable, dependency-free engine that vehicles vendor and that runs from an
unzipped folder — is met: a single static Go binary, shipped as source, that verifies itself with no
external toolchain. quackitect now dogfoods its own Go engine; Python is gone.

## Acceptance obtained  -> i3-m7-acceptance-obtained

The human walked M1–M6 and blessed each gate in increasing-scrutiny rounds. The working engine
(`quack status/next/start/bless/note/gather/ship/lint/report/verify/selftest`), the parity-proven
core, and the tuned report are the acceptance evidence. `status`: 105 gates, 0 suspect.

## Validation gaps (RAID)  -> i3-m7-validation-gaps

- **req-signed-release (carry forward).** To run an UNSIGNED binary on someone else's SAC/WDAC machine,
  it must be code-signed. Ship-source sidesteps this (the vehicle builds locally), but a signed
  release binary is the proper answer for non-builders. A release/M8 or follow-on concern.
- **Parity is now a self-regression.** Byte-identical-to-Python was validated during the port (three
  build hashes matched Python exactly) but Python is deleted, so it is no longer continuously checked;
  `selftest:parity` now guards the engine against itself (golden root).
- **Scope deferred (by design).** `drive_as_engine` / `integrate_as_engine` — the vehicle manifest and
  the documented extension API — were deferred to a later version. The overlay resolver exists; the
  full vehicle-onboarding flow does not yet.
- **Full-HTML determinism** is implied by deterministic data + static template and proven across renders
  during M6, but is not asserted byte-for-byte in a standing check (only the integrity root is).
