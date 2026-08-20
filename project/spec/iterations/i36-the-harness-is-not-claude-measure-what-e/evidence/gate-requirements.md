---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-19T11:01:19.596Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

The requirement register, function structure and assumption register all closed their own mechanical checks this pass. This gate reviews them together as the end of design input.

## round_0_verify

- evidence vs claims: pass; the requirement, function and flow files cited above all exist and were read.
- types: pass; every requirement declares kind in the fixed set, every function is shaped by [[function]], every flow by [[flow]].
- lint: pass; SE-C-046/101 checks on every write this pass landed clean, and a grep for TBD/TBC/TBR/??? across the seven requirements found zero.
- tests: no executable tests are owed at design-input size; verification is later milestones' work.

## round_1_validate

- exercised against the goal: pass — all five kickoff goals now have at least one requirement and one function.
- missing: none found in scope.
- wrong: the six early-authored quality requirements gate-inputs passed "with overrides" for procedural review are now reviewed by this normal M3 pass; their ISO taxonomy held and their wording stands, so that override is closed rather than carried forward.
- out of scope: the HTML mirror decision (iteration 23) and expedition-archive visibility (backlog token) remain untouched, as scope-non-goals named.
- prior art: not asked at this gate (no state_of_the_art field on gate-requirements); the live scan already ran at gate-motivation and gate-inputs.

## goals_served

- Measure what every supported host actually provides.: req-supported-harness-serves-one-lane-contract and fn-arrive-on-a-machine.identify-the-harness give the lane a profiled harness to measure against.
- Close the five measured harness breaks in the prepared brief.: all seven requirements and eight functions together cover cage, stop, payload, boot metadata, interruption, host-profile and repeated-failure demands.
- Make the lane report which harness it is talking to.: req-supported-harness-serves-one-lane-contract, served by fn-arrive-on-a-machine.identify-the-harness.
- Make future boots quicker by removing the test-metadata recovery step from the manual boot path.: req-boot-needs-no-manual-test-metadata-repair, served by fn-run-a-governed-walk.tolerate-old-test-records.
- Make oversized pull results recoverable through the lane instead of host files.: req-oversized-results-remain-recoverable-through-the-lane, served by the extended fn-run-a-governed-walk.serve-a-step.

## bound_breaches

- if-agent-harness-to-entrypoint: breached during this session (the ECONNRESET report on a cancelled se_pull call). The seven i36 requirements and eight functions now name the required responses and measures for it — harness identity, cage boundary, payload bounding, boot metadata tolerance, interruption diagnosis, premature-stop prevention, and repeated-failure routing. Implementation repayment remains open as raid-debt-harness-fallback-and-bounds-need-implementation-proof.

## round_2_red_team

- Opposing case: seven requirements is thin for a major iteration's design input => answer: coverage is complete both directions and matches exactly the five measured breaks plus the live findings scope-non-goals named; thinness would show as an uncovered use case or an orphaned function, and neither exists.
- Opposing case: reusing resident functions (place-the-cage, serve-a-step, keep-the-record) instead of deriving fresh ones could hide a missing capability => answer: reuse is legitimate only where the resident function already does the described work; five genuinely new concerns got five genuinely new functions, and the flow-closure exit script verified both-direction closure mechanically rather than by argument.
- Kill criterion: any i36 requirement or use case fails the coverage check => answer: not found; write-requirements and derive-functions both closed clean.
- Kill criterion: the live ECONNRESET incident has no requirement/function pair addressing it => answer: not found; req-interrupted-call-names-the-stopping-layer and fn-run-a-governed-walk.name-the-stopping-layer both stand, alongside req-stop-hook-yields-only-at-a-machine-stop and fn-run-a-governed-walk.hold-the-session-through-work for the prevention half.

## raid_additions

- raid-asm-documented-harness-limits-stay-stable
- raid-asm-unflagged-typescript-execution-is-universal
- raid-asm-a-cancelled-call-is-a-request-abort-not-a-crash
- raid-asm-the-stop-hook-fires-the-same-on-posix
- raid-asm-the-harness-scan-still-matches-current-releases
- raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today

## verdict

pass — design input for i36 is complete. The register covers all three journeys and five touched ISO quality characteristics, the function structure closes both ways under the exit script, and every assumption this pass could reach is either probed or honestly parked with a named reason. No overrides: the one open override from gate-inputs closed during this pass's own requirement review.

## follow_up

Proceed into solution space: partition-functions next, then M4 candidate enumeration.

## anything_else

