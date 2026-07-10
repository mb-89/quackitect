# M7 - Validation (i0016_structural_models, systematic)

TL;DR: All six M1 success criteria are demonstrated - four by executed selftests, two by proof-by-use during the walk itself (the sky-fall lint caught two unallocated regions live, including the conformance checker's own). The M4 tripwire (authoring comfort in anger) fired real authoring all day and the owner drove every ruling - the text-first decision held. One recorded gap rides to the pruning iteration by owner ruling.

## Meets the need  -> i16-m7-need
Validated against the M1 success criteria, each with its referent:
1. **Catalog >= 5 kinds, each with question, admission tests, heuristic** - method/models/ carries five kind files; selftest:model-kinds green.
2. **views-chosen covers every model; an uncovered model lints** - adr-views-engine covers the three live models; selftest:views-chosen green; the live lint stays silent.
3. **The extractor reads a REAL model and reproduces its graph** - beyond the M5 spike: the live engine model carries ~150 region elements across six subgraphs and extracts clean on every lint.
4. **Cosmetic edits leave verdicts standing; semantic edits flip** - selftest:semantic-hash green; the ledger folds Node.ModelHash (computed at load, kernel-pure).
5. **The engine's own structure declared and conforming** - the reflexion diff ran 65 findings to ZERO with no waved-through exemptions; the no-flow judgment resolved via the ambient band (owner physics); PROOF BY USE: sky-fall caught go-model-asbuilt (the checker's own region) and go-guidance-split live during the walk.
6. **The book renders declared models** - the onion renders from model-engine-layers (regions as blocks, theme clusters); fig-model renders any model node (selftest:models-in-book green). RECORDED GAP by owner ruling: the real book's manifest lines for the two other models are DESCOPED to the pruning iteration.
Backward-cumulative: the full battery (every iteration's tests) is green; no earlier need's verification reopened during the walk.

## Killer use cases demonstrated end to end  -> i16-m7-killer-ucs
- **uc-declare-models**: the owner declared the engine's structure BEFORE the restructuring; elements were allocated ahead; the build followed the model (b10-b12 restructured code TO the declaration).
- **uc-model-conformance**: drift detection fired for real, twice, on the walk's own new code - the strongest possible demonstration (the mechanism caught its own author).
- **uc-model-in-book**: the owner reviewed the region-block onion live and refined it (theme clusters) - the reading loop ran in anger.
- **The M4 tripwire verdict**: model authoring in anger happened all day (three models, ~20 revisions through the rulings) in text, with the owner co-designing the syntax he then approved. No authoring-comfort complaint surfaced; the fallback (canvas hybrid) stays dormant with its requirements deferred.

## Acceptance obtained  -> i16-m7-acceptance
- The owner adjudicated every milestone gate personally (M1 via phone tap, M2-M6 via console y or explicit instruction, each recorded --by user or under the rule-3 exception with its record line).
- The owner drove the M3 matrix revision, the M4 format decision, the b9 physics rulings, and the b14 cluster refinement - the deliverable is co-designed, not merely reviewed.
- The i16 theme ruling ("introduce the models and render them, all changes in this iteration") was met within the iteration.

## Validation gaps captured  -> i16-m7-gaps
- RAID (carried): the real book's fig-model manifest lines for model-check-states and model-product-tree - owner-descoped to the pruning iteration (NOTE-20260710-084157).
- RAID (carried): the conformance diff is lint-visible but not yet a coverage rule flipping a check SUSPECT by itself - a pruning-iteration lead (recorded at M6 risks).
- RAID (carried): two checker blind spots (builder-Fprintf false positives; zero-reference regions invisible) - class guards owed at next checker touch (NOTE-20260710-092021).
- The deferred canvas lane (tray, groom) stays healthy: requirements deferred with ready_when, tests owe nothing (the extended deferral law), the M4 fallback recorded.

## Milestone review  -> i16-m7-gate

**Verify.** Every criterion above names a green selftest, a live lint state, or a dated walk event; the acceptance section lists the owner's actual adjudications.

**Validate.** The iteration's need - structure declared before code, checked mechanically, rendered for reading - is not just met but SELF-demonstrated: the machinery validated its own construction while being built.

**Red-team.** Attack: "proof by use" leans on one day's dogfood - will the discipline hold when the novelty fades? Defense: the discipline is not voluntary - sky-fall, rank checks, and the SUSPECT ripple fire mechanically on every lint and build; rot requires actively ignoring a red board. Attack: the owner co-designed everything, so acceptance is self-serving - true and intended: the adjudicator IS the product owner; external validation arrives with the field loop, as always. **Verdict: PASS** - hand-off for the combined killer + gate.
