# M5 — Prove the riskiest unknowns (i0021_field_ux)

## Riskiest assumptions validated → i21-m5-assumptions

**Assumption 1 - the rigor source parses mechanically (C1, adr-seed-from-rigor-source).**
Probed live with a throwaway read-only script over
`method/rigor/systematic/checklist.md`:

- 8 milestones with their gate names (motivation ... release) extract from the header shape.
- 39 subtask lines extract; 7 carry the killer mark; 6 derived coverage rules extract
  (adr-traced, designs-realized, req-has-test, req-traced, tests-pass, tests-red).
- The shared-fragment import (`../_shared/implementation.md`) extracts.
- FINDING with teeth: the first probe read the file with the platform-default decoder and the
  em-dash mangled - 0 milestones matched. Explicit UTF-8 reading found all 8. The Go parser
  reads UTF-8 natively, so the engine is safe BY CONSTRUCTION - but test-seed-skeleton should
  keep a non-ASCII character in its fixture checklist so the class stays guarded.

**Assumption 2 - a register answer can ride the real ask path (B1,
adr-register-watch-answers).** Evidence from the executed suite (all green in tonight's full
battery, not re-run one by one - the verdict cache holds them): ask-dispatch, answer-apply
(answers validate and stamp actor+channel), answer-idempotent, first-wins-lanes (desk and
phone race resolves), adapter-zero-dep (the transport fakes cleanly in fixtures),
await-console-exit (the console reclaims the seam). The NEW surface (the watch endpoint) only
routes INTO this proven lane; the wedge risk (binary swap during an answer) stays the ADR's
recorded tripwire with command-emission as the fallback.

**Assumption 3 - a seeded skeleton passes lint on a fixture.** The shape proof exists in the
ledger: this very iteration's task set was hand-seeded to exactly the emitter's target shape
(41 checks, namespaced ids, milestone-monotonic wiring) and lints clean - the walk you are
reading is running on it. The emitter reproduces a shape the parser demonstrably accepts.

Killer review. Blessed by the driving agent under the owner's standing overnight grant
(2026-07-13); collected for the morning review.

## Design is buildable → i21-m5-buildable

No spike finding blocks the architecture. One finding sharpened a test (the UTF-8 fixture
character); none moved a requirement or an ADR. Non-killer review; blessed by the driving
agent.

## Spike results recorded → i21-m5-spike-recorded

This document is the record; the parse-probe numbers above are reproducible from the checklist
source with any UTF-8 reader. The throwaway probe script was not kept (it is a dependency of
nothing - determinizers-not-scripts law); its findings live here and in the sharpened test
statement. Non-killer review; blessed by the driving agent.

## Milestone review → i21-m5-gate

1. **Verify.** Three assumptions, three evidence classes: a live parse probe with counts, the
   green executed-suite mapping for the ask lane, and the ledger's own seeded set as the
   shape proof. Each referent is inspectable.
2. **Validate.** The spikes hit exactly the two recorded M4 tripwires (C1 parseability, B1
   lane safety) plus the seeding shape - the riskiest unknowns by the M4 record, not a
   convenience selection.
3. **Red-team.** Weakness owned honestly: assumption 2 leans on EXISTING tests rather than a
   new end-to-end probe of the not-yet-built endpoint - accepted because the endpoint is M6
   build content and the lane beneath it is the risky part; the wedge tripwire stays armed.
   No evidence contradicts buildability.

**Verdict: PASS.** Killer milestone gate. Blessed by the driving agent under the owner's
standing overnight grant (2026-07-13); collected for the morning review.
