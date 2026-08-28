---
form: specify-build
by: agent
signed_off: 2026-08-23T18:50:40.442Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

TWO DESIGN SPECS COVER THE TWO ELEMENTS THIS ROUND MINTED, and the chunk machine is seeded with ten steps.

NO STANDING SPEC REALIZED EITHER ELEMENT. A search over all 41 design specs found zero mentions of the view resolver or the widget guard, which is expected — both were minted this round.

THE COMPUTED VIEW carries the resolver and its nine crossings. It lands in a new `deliverable/engine/viewmodel.ts` and in `deliverable/engine/mirror.ts`, which is where the derivation is removed from.

THE WIDGET GUARD carries the guard and its two crossings. It lands in a new `deliverable/engine/widgets.ts`. The wiring into the write guard and the sweep is the write guard's own design and is unchanged.

THE GUARD'S ELEMENT CARD WAS WRONG AND IS NOW CORRECT. It said one exported entry point may emit widgets. The probe killed that reading: twenty registered form editors each emit their own markup and have to. The card now says only a module the editor registry names may emit, and its "not established" section now records what the probe settled.

NOTHING WAS PROMOTED. Three spikes ran and all three were throwaway probes. Their answers are written into the nodes rather than into the build.

THE TREE DOES NOT TYPECHECK, ON PURPOSE. `tests/widget-emitters.test.ts` imports `../engine/widgets.ts`, which the first chunk creates. That is the red, and inlining a copy of the predicate into the test to make it compile would put the rule in two places.

## design_specs

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-the-computed-view]] | el-view-resolver · if-account-to-view-resolver · if-engine-delta-to-view-resolver · if-front-desk-to-view-resolver · if-holding-pen-to-view-resolver · if-method-compiler-to-view-resolver · if-mirror-to-view-resolver · if-record-store-to-view-resolver · if-view-resolver-to-mirror · if-walk-engine-to-view-resolver | deliverable/engine/viewmodel.ts · deliverable/engine/mirror.ts |
| [[dsp-the-widget-guard]] | el-widget-guard · if-walk-engine-to-widget-guard · if-widget-guard-to-account | deliverable/engine/widgets.ts |

## promotions

| experiment | promote | chunk |
| --- | --- | --- |

## follow_up

TEN CHUNKS, TWO CHAINS THAT MEET AT THE LAST STEP. The drawing is at `spec/iterations/i4-the-panel-round-the-archived-iteration-b/machines/build-chunks.md`.

FOUR START TOGETHER, depending on nothing:

- the widget predicate
- the view model
- the spawn state as a no-op at zero walkers
- the marker sweep made mechanical

THE LAST TWO WERE DEFERRED HERE BY EARLIER STATES of this round, and they touch neither chain.

THE REDRAW ROUTE IS THE ONE DECISION THE BUILD MUST NOT SPLIT. Six sites preserve focus, scroll or an unsubmitted edit today. Either the model carries all three or the surface keeps all three. Two places holding one truth is the failure this round found four separate times, and splitting the redraw would be the fifth.

THE EIGHTEEN ARE THE KILL CRITERION. Eighteen flagged files are not on the registry, and each is either part of the one surface or part of a second one. The check goes green when that is decided, and it is the last chunk on purpose.

TWO ITEMS ARE STILL THE OWNER'S, and neither blocks the build:

- which record owns the five behaviours shipped this session — walker-only counting, reviewer-never-weaker, references-as-links, self-grading estimates, role-matched liveness
- three retro items — the git-derived change list, corpus-wide item sources sighted twice, and brief sizes over the wire

## anything_else

