---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-12T21:28:53.462Z
authors: agent
files: null
---

# Evidence form / gate-requirements

## current_situation

M3's own gate: design input closes here. The requirements register and function tree extend by one small delta; everything after is solution space.

## round_0_verify

- evidence vs claims: read write-requirements, derive-functions, identify-assumptions and probe-assumptions evidence — matches. The four new requirements (req-help-searches-tools-and-guidance, req-help-miss-is-logged, req-help-demand-ranked, req-help-query-logged-with-result) each carry verify_method: test, a filled breaks_if_removed, and refines: uc-find-the-right-lane-tool, confirmed by reading all four files directly. Every new requirement traces; derive-functions adds fn-run-a-governed-walk.help-find-a-capability plus flow-help-query, flow-help-result and flow-call-log — all three flow nodes exist on disk. Both open assumptions now carry a probe result.
- types: not run from this gate — se_run and the type-check tools are not legal in this read-only gate state; owed before build-steps, same standing note as the two gates before it in this iteration.
- lint: not run from this gate, same reason as types — not legal here; owed before build-steps.
- tests: tests/sehelp.test.ts (job test-msqkf74m-1) still showed "running" at the last confirmable check (21:06:20, 843s elapsed) — anomalously long, flagged as note-bf519286c7c8. se_test is illegal in this read-only state so it cannot be re-checked from here. Does not block THIS gate: M3 is the design-input gate, and build verification belongs to M6/M7.

## round_1_validate

- exercised against the goal: the register matches record.md's vision and its moore_pitch — search ranks matches, every miss is logged, the demand log ranks by shape, every call rides the standing call log.
- missing: none against uc-find-the-right-lane-tool — steps 1-4 and extensions 2a/4a all trace to a requirement (write-requirements.md set_criteria: complete).
- wrong: none found.
- out of scope: the two vision companions (the introspection verb, the missing-capability enumeration) and any redesign of se_run itself — named non-goals at scope-non-goals, unchanged.
- prior art: positioned at gate-motivation (M1) — v2's keyword-search-plus-demand-log shape and v1's lazy-loaded catalog, neither shipped, both cited as unreachable at this ref (note-616cdd16f195). This gate does not re-scan: M3 is the requirements gate, and the prior-art round belongs to M1 per this iteration's own precedent (gate-inputs.md, gate-motivation.md).

## round_2_red_team

- one story and one use case still form the whole base for four 'must' requirements => acceptable at minor size per meth-cockburn-use-case, carried forward from the M2 gate's own red-team finding; nothing in the M3 delta widens that base.
- the vocabulary-overlap assumption (raid-asm-help-query-vocabulary-overlaps) stays unprobed, and it is the real kill-criterion for this whole register => if an agent's plain words rarely overlap a tool's actual name or description, req-help-searches-tools-and-guidance's keyword approach under-delivers however clean the register reads; watched via the assumption's own trigger, not resolved here.
- self-blessing this gate => logged as an OVERRIDE per meth-review-rounds.md, same as the two gates before it in this iteration.

## raid_additions

- none beyond raid-risk-se-help-search-half-unproven and the two now-probed assumptions, all already open.

## verdict

pass with overrides — the requirements register and function tree hold against the M1/M2 frame; self-blessed at autonomy 0.8 per contract rule 3, logged as an override per meth-review-rounds.md since no adversarial substitute for milestone self-certification exists yet.

## follow_up

M4 next — candidate generation and convergence, or its minor-tailored equivalent, per derive-functions' own follow_up.

## anything_else

Nothing.
