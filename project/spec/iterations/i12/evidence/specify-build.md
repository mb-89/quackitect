---
form: specify-build
by: agent
signed_off: 2026-08-15T12:38:30.856Z
reopened: "2026-08-15T12:36:56.450Z — The owner ruled the implementation gate failed and named two changes: strike the cubic clause from the goal, since record.md line 85 already measured it as not a problem,…"
authors: agent
files:
---

# Evidence form / specify-build

## current_situation

No design spec is added. The build lands inside dsp-quality-toolchain, which already realizes el-test-runner and already names the two files the defect lives in: engine/bin/selftest.ts and engine/bin/test-timings.mjs.

One file is added to that spec: engine/tools.ts, where the scoped runner builds its argv. The scoped path was never named on the spec that owns test running, which is a small part of why the gap survived.

No spike is promoted. This iteration ran none, because the defects were found by checks rather than by exploration.

## design_specs

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-boot-and-power]] | el-bootstrap | project/deliverable/engine/bin/bench-boot.ts · project/deliverable/engine/bin/se-pty.ts · project/deliverable/engine/bin/se-hook-stop.ts · project/deliverable/engine/bin/package.ts |
| [[dsp-call-log]] | el-account · if-walk-engine-to-account · if-holding-pen-to-account · if-method-compiler-to-account · if-record-store-to-account | project/deliverable/engine/calllog.ts · project/deliverable/engine/survey.ts |
| [[dsp-claim-lane]] | el-claim-ledger · if-claim-ledger-to-record-store | project/deliverable/engine/claims.ts · project/deliverable/engine/gitlane.ts · project/deliverable/engine/tools.ts |
| [[dsp-decision-mathematics]] | el-method-compiler | project/deliverable/engine/dsm.ts · project/deliverable/engine/pugh.ts · project/deliverable/engine/pareto.ts · project/deliverable/engine/compare.ts · project/deliverable/engine/elematrix.ts · project/deliverable/engine/morphbox.ts · project/deliverable/engine/bin/flow-closure.ts · project/deliverable/engine/bin/grades-complete.ts |
| [[dsp-evidence-forms]] | el-walk-engine | project/deliverable/engine/stateform.ts · project/deliverable/engine/forms.ts |
| [[dsp-file-lane]] | el-walk-engine | project/deliverable/engine/files.ts · project/deliverable/engine/signals.ts · project/deliverable/engine/paths.ts · project/deliverable/engine/search.ts · project/deliverable/engine/move.ts · project/deliverable/engine/run.ts · project/deliverable/engine/web.ts · project/deliverable/engine/gitlane.ts · project/deliverable/engine/jsonio.ts · project/deliverable/engine/hash.ts · project/deliverable/engine/model-fs.ts · project/deliverable/engine/bin/outward-search.ts · project/deliverable/engine/bin/se-hook-websearch.ts |
| [[dsp-form-editors]] | el-mirror | project/deliverable/engine/editors/index.ts · project/deliverable/engine/editors/kinds.ts · project/deliverable/engine/editors/checklist.ts · project/deliverable/engine/editors/choice-rationale.ts · project/deliverable/engine/editors/compare-card.ts · project/deliverable/engine/editors/decision-matrix.ts · project/deliverable/engine/editors/dsm.ts · project/deliverable/engine/editors/element-matrix.ts · project/deliverable/engine/editors/exposure-pick.ts · project/deliverable/engine/editors/findings.ts · project/deliverable/engine/editors/list.ts · project/deliverable/engine/editors/morph-box.ts · project/deliverable/engine/editors/node-table.ts · project/deliverable/engine/editors/pareto-plot.ts · project/deliverable/engine/editors/per-item.ts · project/deliverable/engine/editors/rank-cut.ts · project/deliverable/engine/editors/scenario-deck.ts · project/deliverable/engine/editors/sensitivity.ts · project/deliverable/engine/editors/table.ts |
| [[dsp-front-desk]] | el-front-desk | project/deliverable/machines/main.canvas |
| [[dsp-help-search]] | el-walk-engine | project/deliverable/engine/help.ts · project/deliverable/engine/tools.ts |
| [[dsp-lane-door]] | el-walk-engine | project/deliverable/engine/tools.ts · project/deliverable/engine/mcp.ts · project/deliverable/engine/errors.ts · project/deliverable/engine/discipline.ts · project/deliverable/engine/promptlayer.ts · project/deliverable/engine/params.ts · project/deliverable/engine/bin/se-mcp.ts · project/deliverable/engine/bin/se-manual.ts |
| [[dsp-live-register]] | el-mirror | project/deliverable/engine/bases.ts · project/deliverable/engine/basesclient.ts · project/deliverable/engine/baseui.ts · project/deliverable/engine/tables.ts · project/deliverable/engine/vault.ts · project/deliverable/engine/expr.ts · project/deliverable/engine/bin/bench-vault.ts · project/deliverable/engine/bin/format-vault.ts · project/deliverable/engine/signals.ts |
| [[dsp-method-compilation]] | el-method-compiler | project/deliverable/engine/rigor-matrix.ts · project/deliverable/engine/canvas.ts · project/deliverable/engine/catalogs.ts · project/deliverable/engine/machines/compile.ts · project/deliverable/engine/expmachine.ts |
| [[dsp-mirror-render]] | el-mirror · if-account-to-mirror · if-front-desk-to-mirror · if-holding-pen-to-mirror · if-method-compiler-to-mirror · if-record-store-to-mirror · if-walk-engine-to-mirror | project/deliverable/engine/render.ts · project/deliverable/engine/mirror.ts · project/deliverable/engine/panel.ts · project/deliverable/engine/brand.ts · project/deliverable/engine/card-parts.ts · project/deliverable/engine/cards.ts · project/deliverable/engine/traceui.ts · project/deliverable/engine/gitgraph.ts · project/deliverable/engine/shoot.ts · project/deliverable/engine/bin/brand.ts · project/deliverable/engine/bin/mermaid-check.ts · project/deliverable/engine/bin/place-prompt-layer.ts |
| [[dsp-narration]] | el-walk-engine | project/deliverable/engine/decisions.ts · project/deliverable/engine/toll.ts · project/deliverable/engine/bin/render-decisions.ts |
| [[dsp-note-pen]] | el-holding-pen · if-holding-pen-to-front-desk | project/deliverable/engine/notes.ts · project/deliverable/engine/inbox.ts |
| [[dsp-quality-toolchain]] | el-test-runner · if-record-store-to-test-runner · if-test-runner-to-record-store | project/deliverable/engine/tools.ts · project/deliverable/engine/lint.ts · project/deliverable/engine/bin/grades-complete.ts · project/deliverable/engine/bin/backfill-minted.ts · project/deliverable/engine/lintfix.ts · project/deliverable/engine/bin/selftest.ts · project/deliverable/engine/bin/smoketest.ts · project/deliverable/engine/bin/preflight.ts · project/deliverable/engine/bin/test-timings.mjs |
| [[dsp-record-lifecycle]] | el-record-store · if-front-desk-to-record-store | project/deliverable/engine/iterations.ts · project/deliverable/engine/claims.ts · project/deliverable/engine/worktree.ts |
| [[dsp-trace-corpus]] | el-account | project/deliverable/engine/trace.ts · project/deliverable/engine/traceschema.ts · project/deliverable/engine/frontmatter.ts · project/deliverable/engine/bin/backfill-minted.ts · project/deliverable/engine/puml_mindmap.ts |
| [[dsp-walk-machine]] | el-walk-engine · if-method-compiler-to-walk-engine · if-record-store-to-walk-engine | project/deliverable/engine/session.ts · project/deliverable/engine/machine.ts · project/deliverable/engine/pull.ts · project/deliverable/engine/route.ts · project/deliverable/engine/atamwalk.ts · project/deliverable/engine/conditions.ts · project/deliverable/engine/scale.ts |

## promotions

| experiment | promote | chunk |
| --- | --- | --- |

## follow_up

- THE ORDER IS RISK FIRST, and the risk is that the measurement is wrong rather than that the code is hard. The instrument is repaired before anything it would justify.
- BUILD ONE: the scoped run attaches the timings reporter, sharing one argv builder with the battery so the two cannot drift.
- BUILD TWO: every run reports how many cases it timed. A bookkeeping write that may never fail the suite must still be able to say it failed.
- BUILD THREE: cap the test fan-out from the core count read at run time, never from a constant, so the engine keeps a core while a run is in flight.
- THEN RE-TAKE THE RANKING. Everything the kickoff ordered is provisional until a measurement exists that was taken today.
- The container routing and survey defects follow, and neither is blocked by the instrument.
- BUILD SEVEN, added 2026-08-15 after the owner failed the implementation gate: a record gets ONE name, the short id. It leans on nothing and starts beside the other independent lots. It is not tidying — the record-scoping fallback that keeps two laws honest is load-bearing today and fails silently into the bug this record removed, and one name closes that by construction rather than documenting it.

## anything_else

ON THE BUILD ORDER, AND WHICH LENSES SHAPED IT.

TWO LENSES, and the method says a good plan usually shows two.

RISK FIRST is the dominant one, and the risk here is unusual. It is not that a piece might prove infeasible. It is that the RANKING deciding what to build is derived from numbers nobody can refresh. Every other item in this record is chosen by that ranking, so the ranking is the riskiest thing in the plan and it goes first.

SPINE FIRST is the second, and it falls out rather than being chosen. The instrument fix touches the whole seam it needs to touch: the reporter, the scoped path, the battery path, and the verdict that reports what was recorded. That is the thinnest slice that exercises every part of the measurement chain, and everything after it is flesh.

WHAT THE ORDER REFUSES. Fixing the tallest test file first would have been the obvious move, and the record's own plan named it. It is deliberately not first, because the figure that makes it the tallest is from 2026-08-14 and cannot currently be re-taken.

THE THIRD BUILD ITEM CARRIES THE OWNER'S OBJECTION, recorded as note-5fc54baed71c. The cap is sized from the machine at run time. The number is not written into the design, which is the part they objected to rather than any particular value.
