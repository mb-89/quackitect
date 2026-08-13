---
form: verification
by: agent
signed_off: 2026-08-13T14:47:05.320Z
authors: agent
files:
---

# Evidence form / verification

## current_situation

A tester ran with fresh context, as the card requires, then re-verified each fix pass as the same gatekeeper across four rounds. It was resumed from its own transcript rather than respawned.

THE BATTERY IS GREEN at 1151 of 1151, preflight green, biome exit 0. The tester ran it itself rather than taking the builder's report.

FOUR SPECS ARE OBSERVED GREEN. FOUR ARE NOT, and the second box below says exactly which.

### Observed green

tsp-record-inspection. se_test recorded no question, against req-test-run-carries-its-question. It now takes one, refuses a scoped run without it under SE-C-136, and stores it on the verdict beside the scope. Observed: the refusal fires at the call with no handle; the question returns verbatim; .se/test-state.json carries it for a scoped run and for the battery.

tsp-derivation-analysis. 14 of 35 lane verbs were named nowhere in the trace. All 35 now sit in the use case whose work they do. Observed: the check has teeth, proven by running it at HEAD where no verb appears under spec/trace/use-case, so the assertion fails there and passes here.

tsp-autonomy-tiers. Two of four lines were red: five canvases carried numeric weights, four files said slider, and the feed drew the raw value. All fixed, plus a sixth canvas and an authoring page the first sweep missed. Observed line by line, each with its file.

tsp-prose-inspection. 7 of 8 items green, 1 not performed. Re-inspected after every prose change: se_lint over all 35 use-case files returned 115 findings, none in the new blocks; the personal-data sweep returned 10 hits, all rules naming the concept.

### What the tester caught in the builder

It refused the first fix as incomplete, correctly: naming a verb anywhere in the trace is a floor, and 18 verbs still had no use case.

It caught three false claims written into a requirement while explaining it - a date wrong by years, two unsourced misses, a wrong quantifier. It checked git. The builder had not.

It caught the blocked-priority guard matching one exact spelling, so `Blocked`, `BLOCKED` and the abbreviation `B` fell through to the ladder and resolved to 0 - the one value that makes a blocked state run at the blocked setting. It probed all six spellings rather than reading the code.

## claims

- [x] tsp-autonomy-tiers
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-record-inspection
- [x] tsp-tour-run

## follow_up

FOUR BOXES ARE CHECKED WITHOUT AN OBSERVATION, on the owner's ruling of 2026-08-13. They are carried by [[raid-debt-human-observed-demonstrations]].

THE FOUR, AND WHAT EACH NEEDS:

- tsp-panel-walkthrough - the panel on a screen, and a second host for the swap.
- tsp-first-run - a machine holding only an editor and a shell, and a first-time reader. Two of its claims are population measures over real newcomers.
- tsp-tour-run - a live desk session and a screen for the highlight.
- tsp-desk-and-gates - a live desk session, with five of its eight steps unobserved.

THEY COULD NOT CARRY THEIR STANDING VERDICTS EITHER, and the tester ruled against the builder's argument that they could. This delta touched all four: guidance/method/tour.md and README.md are modified, the six canvases are the drawn machines the panel shows, and the grey-verb change governs which desk doors are walkable. An observation from ordinary work carries no fingerprint of which build it saw, and this tree moved twice during the verification.

THE CARD'S LAW IS NOT BENT QUIETLY. It says a claim is an observation, never "should hold". That is overridden once, here, on the record, by the person whose call it is. The debt row carries the four to the consolidation pass.

### Open and not blocked

34 of 35 lane verbs are named in no requirement. req-reachable-capability-is-traced states it with the count and the date rather than closing it by naming it. Deciding which requirement demands each verb, 34 times, is judgment and wants its own piece of work.

### Three defects in the machinery, all noted at must

THIS STATE CANNOT FAIL. Its guidance says failure opens the fallback into fix-findings. Nothing in the engine ever completes a state as failed, so no fallback edge in any machine can open.

THE CHECKLIST CANNOT HOLD AN OBSERVATION. The card says every green claim names who observed what. The field matches the line exactly, so a box carrying its observation reads as unchecked.

THE AGENT SHOULD NOT WRITE FRONTMATTER. A field with six legal values was free text, and that is what the blocked-priority defect was. The engine should hand a schema and take a selection.

## anything_else

ONE THING ABOUT THE BATTERY, found by the tester and worth knowing before anyone treats it as an observation.

Its format step runs `biome check --write`. The battery is not read-only, so a green battery can be a green it created.

Not a defect today. It reported "Fixed 1 file" on one run.
