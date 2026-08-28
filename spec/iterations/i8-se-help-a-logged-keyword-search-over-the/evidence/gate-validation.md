---
form: gate-validation
bless: blessed by agent
by: agent
signed_off: 2026-08-13T10:20:11.072Z
authors: agent
files: null
---

# Evidence form / gate-validation

## current_situation

i8 built two things: the owed checkbox (a third checklist state so an agent can record an honestly-unmet claim instead of fabricating or stalling) and se_help (a logged, ranked keyword search over the lane's own tools and guidance). Both are built, tested, and wired. Gate-implementation already passed and is blessed. This is the final M8 validation gate before close.

## meets_need

- vp-rigor-without-toil: touched — the owed checkbox lets an agent record an honest gap instead of fabricating a green tick or silently stalling, directly serving rigor without toil.
- vp-autonomy-range: touched — se_help lets an agent at any autonomy tier discover tools and guidance itself instead of needing a person to point, useful across the whole range.
- vp-qualities: touched — types, lint and tests are all clean; the owed checkbox and se_help are tested to the same standard as everything else (tests/requirement-checks.test.ts, tests/sehelp.test.ts).
- vp-the-ledger: touched — an owed box points at an open raid register entry, so an unresolved claim stays visible in the ledger instead of reading as done.
- vp-systematic-engineering: untouched — no change to that surface this iteration.
- vp-the-engine: untouched — no change to the engine's core walk mechanics beyond the two scoped features.
- vp-vendoring: untouched — no vendoring work this iteration.

## musts_demonstrated

- sty-ramp-up: owed — genuine demonstration needs the owner's own screen; raid-issue-must-demos-owed.
- sty-start-a-new-product: owed — same reason, raid-issue-must-demos-owed.
- sty-walk-it-by-hand: owed — same reason, raid-issue-must-demos-owed.
- sty-review-a-gate: demonstrated — resident report citation, unchanged this iteration.
- sty-hand-over-and-walk-away: demonstrated — resident report citation, unchanged this iteration.
- sty-the-agent-proves-it-read: demonstrated — resident report citation; the reading-proof mechanic was exercised repeatedly through this very session.
- sty-work-on-two-machines: mostly demonstrated — resident report citation, one sub-slide owed against raid-issue-must-demos-owed.
- sty-ask-the-lane-what-it-can-do: demonstrated fresh this iteration — tests/sehelp.test.ts (5 tests), se_help confirmed wired and working by the real battery run (job test-msrcohsf-11), not only scoped tests.

## market_tier


## round_0_verify

- evidence vs claims: holds — the owed checkbox has tests/requirement-checks.test.ts (4 new tests: good ref passes, no-ref refuses, unresolvable-ref refuses, count reaches the report); se_help's wiring gap was caught by the full battery and fixed, then reconfirmed.
- types: clean — confirmed at gate-implementation, unchanged since.
- lint: clean — confirmed at gate-implementation; sweep-consistency (M8, this iteration) additionally found and fixed 2 more stale "slider" strings and one YAML-breaking bug in a raid entry, both landed.
- tests: full battery 1115/1126 pass, 11 failures all pre-existing and unrelated to i8 (drawnsub x2, editsafety x1, nesting x1, route x3, shoot x3 — environmental, no headless Chromium, threshold x1), reconciled against the prior 13-failure baseline.

## round_1_validate

- exercised against the goal: both features run live — the owed checkbox is exercised by tests/requirement-checks.test.ts, se_help by tests/sehelp.test.ts and by the full battery job test-msrcohsf-11, not read from source alone.
- missing: none against the value props argued above — every touched prop has a citable demonstration, and untouched props carry an honest "untouched" line rather than a fabricated one.
- wrong: none found. The one real defect this iteration surfaced — se_help built and gated but never actually wired into tools.ts — was caught by running the real battery instead of only scoped tests, then fixed and reconfirmed.
- out of scope: unchanged — this iteration scoped se_help plus the owed checkbox. Panel/UI rendering for the owed state stays out, filed as debt (raid-debt-checklist-panel-lacks-owed-state).
- prior art: positioned at M1 per this iteration's own established precedent (the `none` door in engine/stateform.ts, 2026-08-09), unchanged since gate-implementation.

## round_2_red_team

- se_help's ranking is plain word-overlap, no synonym or stem matching => named directly in the tool's own description; carried forward as a known limitation, not a regression.
- trace-design's sweep checks file existence only, not that the file's content matches a design spec's claims => filed this iteration as raid-issue-trace-design-checks-existence-not-content; the se_help wiring gap is direct evidence this gap is real.
- the checklist panel's UI has no visual state or ref-entry affordance for the new owed line form => filed this iteration as raid-debt-checklist-panel-lacks-owed-state; the owed logic and its tests are complete, only the panel rendering trails.
- this gate is self-blessed at dial 0.8 (strategic) => sanctioned per owner ruling 2026-08-09; named here per meth-review-rounds.md discipline rather than taken silently.

## raid_additions

- none new this round beyond what M7/M8 already minted this iteration (raid-issue-must-demos-owed extended, raid-issue-trace-design-checks-existence-not-content, raid-debt-checklist-panel-lacks-owed-state) — carried here, not freshly added.

## verdict

pass with overrides — 4 of 8 must-stories are owed against raid-issue-must-demos-owed because they need the owner's own screen to demonstrate honestly; no blocking defect stands, and everything else checks green on its own evidence.

## follow_up

- the 4 owed must-stories need the owner's screen to close out raid-issue-must-demos-owed.
- raid-issue-trace-design-checks-existence-not-content: trace-design's sweep should check content, not just existence.
- raid-debt-checklist-panel-lacks-owed-state: the checklist panel's UI needs a third visual state for owed lines.

## anything_else

Nothing.
