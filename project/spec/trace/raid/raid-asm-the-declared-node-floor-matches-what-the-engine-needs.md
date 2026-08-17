---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: raid-asm-the-declared-node-floor-matches-what-the-engine-needs
type: "[[raid]]"
kind: assumption
statement: "The runtime floor the engine declares is the floor it actually needs, so the verify step's refusal is meaningful rather than arbitrary."
owner: the owner
trigger: "already fired — measured false at the edge on 2026-08-17"
status: open
impact: "A floor set above what the engine needs refuses hosts that would have run it. Measured: this box's default runtime is 22.22, the pin demands 24, and the engine's full battery passes on 22."
breaks_how_badly: annoying
how_likely: certain
probe: "MEASURED FALSE AT THE EDGE, 2026-08-17. package.json declares >=24.0.0 and tests/unattended-start.test.ts hardcodes want >= 24, both on the recorded reason that unflagged TypeScript execution is not what node 22.6 buys. TRUE OF 22.6, FALSE OF 22.18+, which shipped type stripping unflagged. On node v22.22.2 the full battery runs 1391 tests, 1387 green — and the only extra failures against node 24 are the two assertions about the floor itself. The floor the evidence supports is >=22.18.0. NOT CHANGED: lowering a declared pin is the owner's act, and cloud-runner.md forbids editing engines.node to make verify pass."
probed: 2026-08-17
source_refs:
  - i35-the-cloud-run-s-findings-land-the-fix-fi
weighs_with: none
weighs_against: none
---

## Probe

THE REASON EXPIRED, NOT THE RULE. The pin was raised from >=22.6 to >=24
for a good reason that was true when it was written: `node <file>.ts` with
no flag was not the default on 22.6. Node 22.18 made it the default, and
nothing went back to look.

WHAT WAS MEASURED, on this box, on 2026-08-17:

| runtime | tests | pass | fail |
| --- | --- | --- | --- |
| v24.8.0 | 1391 | 1390 | 1 |
| v22.22.2 | 1391 | 1387 | 4 |

THE THREE EXTRA FAILURES ARE NOT ENGINE BEHAVIOUR. Two are the floor
assertions themselves, which fail BECAUSE the runtime is 22 — they are the
pin asserting itself, not the engine breaking. The third is the emergency
flake, which also went red once under 24.

## Repayment

Three lines, if the owner wants it: `engines.node` to `>=22.18.0`, the
`want >= 24` assertion to `want >= 22`, and this probe line. The cost of
leaving it is every cloud box whose default node is 22 needing a runtime
installed before the engine will start.
