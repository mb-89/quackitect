---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-19T08:22:43.410Z
authors: agent
files: null
---

# Evidence form / gate-kickoff

## current_situation

Iteration 36 is prepared and started.

The onboarding retro signed.

The owner routed two urgent boot findings into this iteration:

- the latest test record can block boot when it lacks `question` and `scope`
- oversized pull results can force host-file recovery during boot

The prepared record points to the harness portability report and its references as the design input.

## retro_drained

- note-f04d6415041e: carried to iteration 36 for boot metadata recovery.
- note-3be35944c9d2: carried to iteration 36 for oversized pull result recovery.
- note-c8342909e0cd: carried to iteration 23 for the UI mirror decision.
- note-88fac5292848: minted as backlog token `wt-expedition-archive-coverage-needs-a-pass-so-closed-expeditio`.

## goals

- Measure what every supported host actually provides.
- Close the five measured harness breaks in the prepared brief.
- Make the lane report which harness it is talking to.
- Make future boots quicker by removing the test-metadata recovery step from the manual boot path.
- Make oversized pull results recoverable through the lane instead of host files.

## pulled_in

- project/spec/harness-portability.md: prepared harness portability report.
- project/spec/references/ref-agent-harness-portability-2026.md: outward scan and citations.
- project/deliverable/cage/copilot-cage.json: Copilot cage input.
- project/spec/trace/interface/if-agent-harness-to-entrypoint.md: interface bound under review.
- project/spec/trace/raid/raid-obsidian-and-harness.md: host dependency carry-forward.
- project/spec/trace/raid/raid-harness-half-life.md: harness scaffolding half-life risk.
- note-f04d6415041e: boot record-inspect metadata blocker.
- note-3be35944c9d2: oversized pull-result recovery blocker.

## left_out

- UI mirror removal stays in iteration 23.
- Expedition archive visibility is backlog token `wt-expedition-archive-coverage-needs-a-pass-so-closed-expeditio`.
- Product-wide process measurement stays in iterations 31 and 32 unless iteration 36 needs a local counter.

## change_size

major — The work touches host contracts, boot behavior, lane tool descriptions, cage files, hook behavior and measurement. It is not product-sized because the product vision and stakeholder model already stand; this iteration changes the harness layer under that baseline.

## round_0_verify

- evidence vs claims: pass; the kickoff cites the prepared record, the signed onboard-retro evidence and the two carried boot notes.
- types: pass for kickoff; no code has been changed in this gate.
- lint: pass for kickoff; no code has been changed in this gate.
- tests: pass for kickoff; the latest `se_test` battery passed and recorded scope.

## round_1_validate

- exercised against the goal: pass; the scope names host measurement, five breaks, harness identification and faster boot recovery.
- missing: prior-art scan was not run because this gate state does not grant `se_web_search` or `se_web_fetch`.
- wrong: none found in the prepared goal.
- out of scope: UI mirror removal and expedition archive visibility are deliberately parked elsewhere.
- prior art: not scanned here; the gate method requires live web comparison, but this state grants no web tools.

## bound_breaches

- if-agent-harness-to-entrypoint: breached in today's boot; oversized pull results and latest-test metadata recovery both slowed the entrypoint path, and iteration 36 owns the fixes.

## round_2_red_team

- Strong opposing case: this is too large for one iteration because it spans tool descriptions, boot reads, hooks, cage files and token accounting => answer: keep it as major and let downstream gates cut if the seeded machine exposes independent slices.
- Kill criterion: the five breaks are not reproducible on current hosts => answer: the prepared record already contains measured byte counts, and today's boot reproduced two host-overflow and boot-metadata symptoms.
- Risk: making boot faster by skipping `record-inspect` could hide bad test records => answer: the target is mechanical recovery or correct filtering, not dropping the check.

## raid_additions

- project/spec/trace/raid/raid-obsidian-and-harness.md

## verdict

pass with overrides — The kickoff is sound and should seed the iteration. The override is explicit: prior art was not scanned at this gate because the gate does not grant web tools. The existing harness dependency RAID entry carries that external-host risk.

## follow_up

Seed the iteration as a major change.

The first implementation slice should make future boot faster:

- make `record-inspect` ignore stale malformed test records or create a valid boot-scoped metadata record mechanically
- make oversized pull results recoverable from the lane without host-file fallback
- keep the existing boot checks rather than weakening them

## anything_else

The owner feedback is carried: boot was not smooth.
