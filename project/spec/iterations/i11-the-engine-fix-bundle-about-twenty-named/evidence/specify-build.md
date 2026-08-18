---
form: specify-build
by: agent
signed_off: 2026-08-16T11:38:30.153Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

NO NEW DESIGN SPEC. Twenty-three stand and every file this delta touches is already claimed by one of them. That is the escalate test passing a third time — no new function at derive-functions, no new element or interface at decompose-structure, and no new design concern here.

THE DELTA IS SPREAD ACROSS SEVEN EXISTING SPECS rather than concentrated in one, which is what "the lane costs too much" means as a design statement: the cost is everywhere the lane touches.

NO SPIKE RAN AND NONE IS PROMOTED. Every unknown this iteration had was settled by a probe at M3, in minutes rather than by a spike.

## design_specs

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-boot-and-power]] | el-bootstrap | project/deliverable/engine/bin/bench-boot.ts · project/deliverable/engine/bin/se-pty.ts · project/deliverable/engine/bin/se-hook-stop.ts · project/deliverable/engine/bin/package.ts · project/deliverable/engine/version.ts |
| [[dsp-call-log]] | el-account · if-walk-engine-to-account · if-holding-pen-to-account · if-method-compiler-to-account · if-record-store-to-account | project/deliverable/engine/calllog.ts · project/deliverable/engine/version.ts · project/deliverable/engine/survey.ts |
| [[dsp-core-and-satellite]] | el-core · el-satellite · if-core-satellite · if-core-to-mirror · if-satellite-to-account · if-record-store-to-satellite · if-method-compiler-to-satellite · if-engine-delta-to-satellite | project/deliverable/engine/core.ts · project/deliverable/engine/satellite.ts · project/deliverable/engine/channel.ts · project/deliverable/engine/transports.ts · project/deliverable/engine/supervisor.ts · project/deliverable/engine/delta.ts · project/deliverable/engine/mode.ts · project/deliverable/engine/bin/se-satellite.ts · project/deliverable/engine/bin/se-mcp.ts |
| [[dsp-decision-mathematics]] | el-method-compiler | project/deliverable/engine/dsm.ts · project/deliverable/engine/pugh.ts · project/deliverable/engine/pareto.ts · project/deliverable/engine/compare.ts · project/deliverable/engine/elematrix.ts · project/deliverable/engine/morphbox.ts · project/deliverable/engine/bin/flow-closure.ts · project/deliverable/engine/bin/grades-complete.ts |
| [[dsp-engine-delta]] | el-engine-delta · if-engine-delta-to-account · if-engine-delta-to-mirror · if-engine-delta-to-walk-engine | project/deliverable/engine/delta.ts · project/deliverable/engine/paths.ts · project/deliverable/engine/machines/compile.ts |
| [[dsp-evidence-forms]] | el-walk-engine | project/deliverable/engine/stateform.ts · project/deliverable/engine/forms.ts |
| [[dsp-file-lane]] | el-walk-engine | project/deliverable/engine/files.ts · project/deliverable/engine/signals.ts · project/deliverable/engine/paths.ts · project/deliverable/engine/resolve.ts · project/deliverable/engine/search.ts · project/deliverable/engine/move.ts · project/deliverable/engine/run.ts · project/deliverable/engine/web.ts · project/deliverable/engine/gitlane.ts · project/deliverable/engine/jsonio.ts · project/deliverable/engine/hash.ts · project/deliverable/engine/model-fs.ts · project/deliverable/engine/bin/outward-search.ts · project/deliverable/engine/bin/se-hook-websearch.ts |
| [[dsp-form-editors]] | el-mirror | project/deliverable/engine/editors/index.ts · project/deliverable/engine/editors/kinds.ts · project/deliverable/engine/editors/checklist.ts · project/deliverable/engine/editors/choice-rationale.ts · project/deliverable/engine/editors/compare-card.ts · project/deliverable/engine/editors/decision-matrix.ts · project/deliverable/engine/editors/dsm.ts · project/deliverable/engine/editors/element-matrix.ts · project/deliverable/engine/editors/exposure-pick.ts · project/deliverable/engine/editors/findings.ts · project/deliverable/engine/editors/list.ts · project/deliverable/engine/editors/morph-box.ts · project/deliverable/engine/editors/node-table.ts · project/deliverable/engine/editors/pareto-plot.ts · project/deliverable/engine/editors/per-item.ts · project/deliverable/engine/editors/rank-cut.ts · project/deliverable/engine/editors/scenario-deck.ts · project/deliverable/engine/editors/sensitivity.ts · project/deliverable/engine/editors/table.ts |
| [[dsp-front-desk]] | el-front-desk | project/deliverable/machines/main.canvas |
| [[dsp-help-search]] | el-walk-engine | project/deliverable/engine/help.ts · project/deliverable/engine/tools.ts |
| [[dsp-lane-door]] | el-walk-engine | project/deliverable/engine/tools.ts · project/deliverable/engine/mcp.ts · project/deliverable/engine/errors.ts · project/deliverable/engine/discipline.ts · project/deliverable/engine/promptlayer.ts · project/deliverable/engine/params.ts · project/deliverable/engine/bound.ts · project/deliverable/engine/bin/se-mcp.ts · project/deliverable/engine/bin/se-manual.ts |
| [[dsp-live-register]] | el-mirror | project/deliverable/engine/bases.ts · project/deliverable/engine/basesclient.ts · project/deliverable/engine/baseui.ts · project/deliverable/engine/tables.ts · project/deliverable/engine/vault.ts · project/deliverable/engine/expr.ts · project/deliverable/engine/bin/bench-vault.ts · project/deliverable/engine/bin/format-vault.ts · project/deliverable/engine/signals.ts |
| [[dsp-method-compilation]] | el-method-compiler | project/deliverable/engine/rigor-matrix.ts · project/deliverable/engine/canvas.ts · project/deliverable/engine/catalogs.ts · project/deliverable/engine/machines/compile.ts · project/deliverable/engine/expmachine.ts |
| [[dsp-mirror-render]] | el-mirror · if-account-to-mirror · if-front-desk-to-mirror · if-holding-pen-to-mirror · if-method-compiler-to-mirror · if-record-store-to-mirror · if-walk-engine-to-mirror | project/deliverable/engine/render.ts · project/deliverable/engine/mirror.ts · project/deliverable/engine/panel.ts · project/deliverable/engine/brand.ts · project/deliverable/engine/card-parts.ts · project/deliverable/engine/cards.ts · project/deliverable/engine/traceui.ts · project/deliverable/engine/gitgraph.ts · project/deliverable/engine/shoot.ts · project/deliverable/engine/bin/brand.ts · project/deliverable/engine/bin/mermaid-check.ts · project/deliverable/engine/bin/place-prompt-layer.ts |
| [[dsp-narration]] | el-walk-engine | project/deliverable/engine/decisions.ts · project/deliverable/engine/toll.ts · project/deliverable/engine/bin/render-decisions.ts |
| [[dsp-note-pen]] | el-holding-pen · if-holding-pen-to-front-desk | project/deliverable/engine/notes.ts · project/deliverable/engine/inbox.ts |
| [[dsp-quality-toolchain]] | el-test-runner · if-record-store-to-test-runner · if-test-runner-to-record-store | project/deliverable/engine/testreporters.ts · project/deliverable/engine/tools.ts · project/deliverable/engine/lint.ts · project/deliverable/engine/bin/grades-complete.ts · project/deliverable/engine/bin/backfill-minted.ts · project/deliverable/engine/lintfix.ts · project/deliverable/engine/bin/selftest.ts · project/deliverable/engine/bin/smoketest.ts · project/deliverable/engine/bin/preflight.ts · project/deliverable/engine/bin/test-timings.mjs |
| [[dsp-record-lifecycle]] | el-record-store · if-front-desk-to-record-store | project/deliverable/engine/iterations.ts · project/deliverable/engine/worktree.ts |
| [[dsp-resolution-seam]] | el-resolution-seam · if-satellite-to-resolution-seam · if-walk-engine-to-resolution-seam · if-satellite-supervisor-to-resolution-seam · if-resolution-seam-to-engine-delta · if-resolution-seam-to-method-compiler · if-record-store-to-resolution-seam · if-resolution-seam-to-account | project/deliverable/engine/paths.ts · project/deliverable/engine/resolve.ts · project/deliverable/engine/files.ts · project/deliverable/engine/run.ts · project/deliverable/engine/lint.ts · project/deliverable/engine/tools.ts |
| [[dsp-satellite-lifecycle]] | el-satellite-supervisor · if-satellite-supervisor-to-satellite · if-satellite-supervisor-to-record-store · if-satellite-supervisor-to-walk-engine · if-satellite-supervisor-to-test-runner · if-satellite-supervisor-to-mirror · if-front-desk-to-satellite-supervisor | project/deliverable/engine/supervisor.ts · project/deliverable/engine/worktree.ts |
| [[dsp-trace-corpus]] | el-account | project/deliverable/engine/trace.ts · project/deliverable/engine/traceschema.ts · project/deliverable/engine/frontmatter.ts · project/deliverable/engine/bin/backfill-minted.ts |
| [[dsp-unattended-entrypoint]] | el-entrypoint | project/deliverable/engine/bin/se-start.ts · project/deliverable/package.json |
| [[dsp-walk-machine]] | el-walk-engine · if-method-compiler-to-walk-engine · if-record-store-to-walk-engine | project/deliverable/engine/session.ts · project/deliverable/engine/machine.ts · project/deliverable/engine/pull.ts · project/deliverable/engine/route.ts · project/deliverable/engine/atamwalk.ts · project/deliverable/engine/conditions.ts · project/deliverable/engine/scale.ts |

## promotions

| experiment | promote | chunk |
| --- | --- | --- |

## follow_up

OBSERVE-RED WATCHES SIX CASES FAIL across two files, and one fails for a reason worth reading: tsp-the-bucket's third case tests req-close-refuses-loose-ends, a must graded fatal minted in i1 that has never had an implementation.

THE BUILD ORDER IS CONSTRAINED BY TWO PAIRING RULES, both already on the register and neither negotiable at build time.

- se_test blocking and the full-battery refusal land in ONE chunk. raid-dec-blocking-and-the-battery-refusal-ship-together carries the ruling and its rejected options. The block alone removes the accidental deterrent and makes the measured problem worse.
- The bucket's permission and its guard land in ONE chunk, and the close-side reader lands with them or the chunk does not close. A permission whose guard is missing is strictly weaker than the unchecked box it replaces.

THE FOURTEEN UNCHECKED DEFECTS ARE READ AT THE BUILD, not fixed on sight. Anything already done is struck WITH its evidence; anything live but outside the call-cost surface is recorded and left. That rule is what keeps the bundle closable.

## anything_else

### Where the delta lands, spec by spec

THE TABLE ABOVE IS COMPUTED AND UNCHANGED. This is the reading of it that matters for the build.

- dsp-walk-machine — session.ts, machine.ts, pull.ts, route.ts. The pull payload's trim, the router aiming at a state that is not a legal door, `reentry: restart` on the containers, and se_why naming the root in one answer. Four of the twelve items, in one spec.
- dsp-evidence-forms — stateform.ts, forms.ts. The bucket's permission and its guard, and se_amend patching instead of taking a field whole.
- dsp-record-lifecycle — worktree.ts. The close-side reader, which is the piece with no implementation today.
- dsp-quality-toolchain — tools.ts and the test scripts. se_test blocking, and the full battery refused outside verification.
- dsp-file-lane and dsp-trace-corpus — files.ts, trace.ts. The deletion warning, and it needs BOTH: the graph lives in trace.ts, the act happens in files.ts.
- dsp-mirror-render — render.ts, panel.ts. The freeze and bless buttons.
- dsp-narration — decisions.ts, toll.ts. The stall rule's grace, and correcting a chained `fork` brief the way a chained `update` brief already is.

### The one design decision this state settles

THE DELETION WARNING IS TWO READS, NOT ONE, and that is a design constraint rather than a preference. raid-asm-the-trace-graph-holds-every-reference probed FALSE IN PART: the graph found i34's frontmatter orphans and missed seventeen prose citations plus three engine comments.

SO THE WARNING READS THE FRONTMATTER EDGES AND SWEEPS THE TEXT FOR THE ID. The first is already computed for the coverage laws; the second is one search. A warning built on the graph alone would report a clean list and be believed, which is worse than no warning — and tsp-lane-cost's third case is written so that implementation still fails.
