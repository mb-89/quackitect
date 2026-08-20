---
form: verification
by: agent
signed_off: 2026-08-19T12:35:15.112Z
authors: agent
files:
---

# Evidence form / verification

## current_situation

A tester with fresh context verified this build. It found ELEVEN findings, two of them blockers, and the battery is red.

- THE TYPECHECK IS RED. One error: `empty_sources` was added as a required member of `FieldArgs` and left unfilled at the third construction site, in the code that decides whether a standing claim still passes.
- THE BOOT IS BROKEN IN TEST ROOTS. Making preflight ask the palette reader for its path dragged the whole render graph into preflight, and with it `@parcel/watcher`, which a test root does not install. 5 of the battery's 6 failures are that one import.

1453 tests, 1447 pass, 6 fail. The linter is clean over 306 files.

TWO OF THE FIVE REQUIREMENTS ARE NOT MET, and the tester read the code rather than the tests to say so.

## claims

- [x] tsp-a-slow-signal-keeps-the-wait
- [x] tsp-autonomy-tiers
- [x] tsp-coupling-disposition
- [x] tsp-desk-and-gates
- [x] tsp-one-door-into-the-pool
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [x] tsp-the-cited-refs-resolve
- [x] tsp-the-engine-keeps-no-record-of-what-it-produced
- [x] tsp-tour-run
- [x] tsp-two-machines
- [owed] tsp-a-vehicle-is-made-and-then-drives-something-else — raid-debt-human-observed-demonstrations
- [owed] tsp-bound-surface — raid-debt-human-observed-demonstrations
- [owed] tsp-first-run — raid-debt-human-observed-demonstrations
- [owed] tsp-panel-walkthrough — raid-debt-human-observed-demonstrations
- [owed] tsp-the-arrival-in-one-act — raid-debt-human-observed-demonstrations
- [owed] tsp-unattended-start — raid-debt-human-observed-demonstrations
- [owed] tsp-derivation-analysis — raid-iss-a-cut-subsystem-left-its-interface-node-behind

## follow_up

fix-findings takes all eleven in one pass, then one confirm run.

WHAT IS OWED THERE, in the order the tester ranked it: the typecheck, the preflight import, the empty-source renderer that was never built, two cases that pass against no design, the configuration-path count the row actually demands, three engine repairs with no test behind them, a contaminated test-template cache, and two latent couplings.

gate-implementation then rules on the debt and the risks, including the three engine repairs that landed outside the blessed scope.

## anything_else

HOW THE NINETEEN BOXES WERE ANSWERED, because twelve ticks and seven owed is a claim in itself.

TWELVE ARE TICKED on the tester's own reading. It walked all thirty-four non-test specs and said, per spec, whether anything this record changed could reach the claim. These twelve it found untouched, with the reason named each time — the corpus query path, the desk routing, the produce path, the refusal-legibility surfaces, the reading loop, the prose and read-back inspections. One of them, `tsp-record-inspection`, it observed exiting 0 inside the battery.

SIX ARE OWED TO `raid-debt-human-observed-demonstrations`, which exists for exactly this: a demonstration needs a person watching, and nobody is beside this box. All six are also the ones the preflight import touched, so re-demonstrating them is owed after the fix regardless of who watches.

ONE IS OWED TO `raid-iss-a-cut-subsystem-left-its-interface-node-behind`, and the carrier is precise rather than convenient. `tsp-derivation-analysis` claims every reachable capability is covered, and its recorded argument rests on an enumeration that this record moved — it added a capability with a use case and five requirements behind it, and DELETED an interface node. That deletion is what the named entry records.

WHAT A TICK DOES NOT CLAIM HERE. Not that the tester re-ran each demonstration. It claims fresh eyes read the spec, read what changed, and found nothing this record did that could reach it. That is the strongest honest statement available on a box nobody is watching, and the six that could not carry it say so instead.

## design_trace

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-boot-and-power]] | el-bootstrap | project/deliverable/engine/bin/se-pty.ts · project/deliverable/engine/bin/se-hook-stop.ts · project/deliverable/engine/bin/se-hook-start.ts · project/deliverable/engine/pullnotice.ts · project/deliverable/engine/bin/package.ts · project/deliverable/engine/version.ts · project/deliverable/engine/sessionlive.ts |
| [[dsp-call-log]] | el-account · if-walk-engine-to-account · if-holding-pen-to-account · if-method-compiler-to-account · if-record-store-to-account | project/deliverable/engine/calllog.ts · project/deliverable/engine/version.ts · project/deliverable/engine/survey.ts |
| [[dsp-coupling-disposer]] | el-coupling-disposer | project/deliverable/engine/disposition.ts |
| [[dsp-decision-mathematics]] | el-method-compiler | project/deliverable/engine/dsm.ts · project/deliverable/engine/pugh.ts · project/deliverable/engine/pareto.ts · project/deliverable/engine/compare.ts · project/deliverable/engine/elematrix.ts · project/deliverable/engine/morphbox.ts · project/deliverable/engine/bin/flow-closure.ts · project/deliverable/engine/bin/grades-complete.ts |
| [[dsp-engine-delta]] | el-engine-delta · if-engine-delta-to-account · if-engine-delta-to-mirror · if-engine-delta-to-walk-engine | project/deliverable/engine/paths.ts · project/deliverable/engine/machines/compile.ts |
| [[dsp-evidence-forms]] | el-walk-engine | project/deliverable/engine/stateform.ts · project/deliverable/engine/forms.ts · project/deliverable/engine/sessionforms.ts · project/deliverable/engine/stateform-problems.ts · project/deliverable/engine/stateform-sheet.ts |
| [[dsp-file-lane]] | el-walk-engine | project/deliverable/engine/files.ts · project/deliverable/engine/files-patch.ts · project/deliverable/engine/signals.ts · project/deliverable/engine/paths.ts · project/deliverable/engine/resolve.ts · project/deliverable/engine/search.ts · project/deliverable/engine/move.ts · project/deliverable/engine/run.ts · project/deliverable/engine/web.ts · project/deliverable/engine/gitlane.ts · project/deliverable/engine/jsonio.ts · project/deliverable/engine/hash.ts · project/deliverable/engine/model-fs.ts · project/deliverable/engine/bin/outward-search.ts · project/deliverable/engine/bin/se-hook-websearch.ts |
| [[dsp-form-editors]] | el-mirror | project/deliverable/engine/editors/index.ts · project/deliverable/engine/editors/kinds.ts · project/deliverable/engine/editors/checklist.ts · project/deliverable/engine/editors/choice-rationale.ts · project/deliverable/engine/editors/compare-card.ts · project/deliverable/engine/editors/decision-matrix.ts · project/deliverable/engine/editors/dsm.ts · project/deliverable/engine/editors/element-matrix.ts · project/deliverable/engine/editors/exposure-pick.ts · project/deliverable/engine/editors/findings.ts · project/deliverable/engine/editors/list.ts · project/deliverable/engine/editors/morph-box.ts · project/deliverable/engine/editors/node-table.ts · project/deliverable/engine/editors/pareto-plot.ts · project/deliverable/engine/editors/per-item.ts · project/deliverable/engine/editors/rank-cut.ts · project/deliverable/engine/editors/scenario-deck.ts · project/deliverable/engine/editors/sensitivity.ts · project/deliverable/engine/editors/table.ts |
| [[dsp-front-desk]] | el-front-desk | project/deliverable/machines/main.canvas |
| [[dsp-help-search]] | el-walk-engine | project/deliverable/engine/help.ts · project/deliverable/engine/tools.ts |
| [[dsp-lane-door]] | el-walk-engine | project/deliverable/engine/tools.ts · project/deliverable/engine/tools-file.ts · project/deliverable/engine/tools-run.ts · project/deliverable/engine/tools-desk.ts · project/deliverable/engine/mcp.ts · project/deliverable/engine/errors.ts · project/deliverable/engine/discipline.ts · project/deliverable/engine/promptlayer.ts · project/deliverable/engine/params.ts · project/deliverable/engine/bound.ts · project/deliverable/engine/bin/se-mcp.ts · project/deliverable/engine/bin/se-manual.ts |
| [[dsp-legible-controls]] | el-mirror | project/deliverable/engine/params.ts · project/deliverable/engine/mirror.ts · project/deliverable/engine/run.ts · project/deliverable/vscode/src/extension.ts |
| [[dsp-live-register]] | el-mirror | project/deliverable/engine/bases.ts · project/deliverable/engine/basesclient.ts · project/deliverable/engine/baseui.ts · project/deliverable/engine/tables.ts · project/deliverable/engine/vault.ts · project/deliverable/engine/expr.ts · project/deliverable/engine/expr-parse.ts · project/deliverable/engine/expr-value.ts · project/deliverable/engine/bin/format-vault.ts · project/deliverable/engine/signals.ts |
| [[dsp-method-compilation]] | el-method-compiler | project/deliverable/engine/rigor-matrix.ts · project/deliverable/engine/canvas.ts · project/deliverable/engine/catalogs.ts · project/deliverable/engine/machines/compile.ts · project/deliverable/engine/expmachine.ts · project/deliverable/engine/machines/supply.ts |
| [[dsp-mirror-render]] | el-mirror · if-account-to-mirror · if-front-desk-to-mirror · if-holding-pen-to-mirror · if-method-compiler-to-mirror · if-record-store-to-mirror · if-walk-engine-to-mirror | project/deliverable/engine/render.ts · project/deliverable/engine/renderclient.ts · project/deliverable/engine/renderclient-detail.ts · project/deliverable/engine/renderclient-walk.ts · project/deliverable/engine/renderclient-form.ts · project/deliverable/engine/renderclient-panel.ts · project/deliverable/engine/renderclient-log.ts · project/deliverable/engine/renderclient-live.ts · project/deliverable/engine/renderstyle.ts · project/deliverable/engine/mirror.ts · project/deliverable/engine/panel.ts · project/deliverable/engine/brand.ts · project/deliverable/engine/card-parts.ts · project/deliverable/engine/cards.ts · project/deliverable/engine/traceui.ts · project/deliverable/engine/gitgraph.ts · project/deliverable/engine/shoot.ts · project/deliverable/engine/bin/brand.ts · project/deliverable/engine/bin/mermaid-check.ts · project/deliverable/engine/bin/place-prompt-layer.ts |
| [[dsp-narration]] | el-walk-engine | project/deliverable/engine/decisions.ts · project/deliverable/engine/toll.ts · project/deliverable/engine/bin/render-decisions.ts |
| [[dsp-note-pen]] | el-holding-pen · if-holding-pen-to-front-desk | project/deliverable/engine/notes.ts · project/deliverable/engine/inbox.ts |
| [[dsp-quality-toolchain]] | el-test-runner · if-record-store-to-test-runner · if-test-runner-to-record-store | project/deliverable/engine/testreporters.ts · project/deliverable/engine/tools.ts · project/deliverable/engine/lint.ts · project/deliverable/engine/bin/grades-complete.ts · project/deliverable/engine/bin/backfill-minted.ts · project/deliverable/engine/lintfix.ts · project/deliverable/engine/bin/selftest.ts · project/deliverable/engine/bin/smoketest.ts · project/deliverable/engine/bin/preflight.ts · project/deliverable/engine/bin/red-observed.ts · project/deliverable/engine/bin/battery.ts · project/deliverable/engine/bin/test-timings.mjs · project/deliverable/engine/bin/prose-inspect.ts · project/deliverable/engine/bin/record-inspect.ts |
| [[dsp-query-evaluator]] | el-query-evaluator | project/deliverable/engine/query.ts |
| [[dsp-radial-layout]] | el-mirror | project/deliverable/engine/trace.ts · project/deliverable/engine/trace-layout.ts |
| [[dsp-record-lifecycle]] | el-record-store · if-front-desk-to-record-store | project/deliverable/engine/iterations.ts · project/deliverable/engine/iterations-draw.ts · project/deliverable/engine/records.ts · project/deliverable/engine/seed.ts |
| [[dsp-resolution-seam]] | el-resolution-seam · if-walk-engine-to-resolution-seam · if-resolution-seam-to-engine-delta · if-resolution-seam-to-method-compiler · if-record-store-to-resolution-seam · if-resolution-seam-to-account | project/deliverable/engine/paths.ts · project/deliverable/engine/resolve.ts · project/deliverable/engine/files.ts · project/deliverable/engine/run.ts · project/deliverable/engine/lint.ts · project/deliverable/engine/tools.ts |
| [[dsp-the-arrival]] | el-arrival | project/deliverable/engine/bin/se-arrive.ts · project/deliverable/engine/bin/se-hook-arrive.ts · .claude/settings.json · project/deliverable/engine/bin/se-hook-start.ts · project/deliverable/engine/pullnotice.ts |
| [[dsp-the-goal-binds-the-walk]] | el-walk-engine | project/deliverable/engine/machine.ts · project/deliverable/engine/stateform.ts · project/deliverable/engine/rigor-matrix.ts · project/deliverable/engine/machines/compile.ts · project/deliverable/engine/session.ts |
| [[dsp-the-options-pool]] | el-holding-pen · el-front-desk | project/deliverable/engine/pool.ts · project/deliverable/engine/inbox.ts · project/deliverable/engine/survey.ts · project/deliverable/engine/tools.ts · project/deliverable/engine/errors.ts · project/guidance/refusals.md |
| [[dsp-the-outside-boundaries-and-their-bounds]] | el-walk-engine · if-agent-harness-to-entrypoint · if-engineer-to-mirror · if-vscode-to-mirror · if-test-runner-to-toolchain · if-bootstrap-to-toolchain · if-account-to-git · if-record-store-to-git · if-record-store-to-origin-remote · if-account-to-obsidian · if-walk-engine-to-web · if-mirror-to-output-tools | project/deliverable/machines/items/interface.md · project/deliverable/engine/trace.ts · project/deliverable/engine/elematrix.ts |
| [[dsp-the-producing-acts]] | el-vehicle-producer · el-project-producer · if-project-producer-to-resolution-seam · el-mirror | project/deliverable/engine/produce.ts · project/deliverable/engine/paths.ts · project/deliverable/engine/tools.ts · project/deliverable/vscode/src/extension.ts |
| [[dsp-the-update-channel]] | el-update-runner · el-change-reporter · if-change-reporter-to-update-runner | project/deliverable/engine/update.ts |
| [[dsp-trace-corpus]] | el-account | project/deliverable/engine/trace.ts · project/deliverable/engine/traceschema.ts · project/deliverable/engine/frontmatter.ts · project/deliverable/engine/bin/backfill-minted.ts |
| [[dsp-unattended-entrypoint]] | el-entrypoint | project/deliverable/engine/bin/se-start.ts · project/deliverable/package.json |
| [[dsp-walk-machine]] | el-walk-engine · if-method-compiler-to-walk-engine · if-record-store-to-walk-engine | project/deliverable/engine/session.ts · project/deliverable/engine/machine.ts · project/deliverable/engine/pull.ts · project/deliverable/engine/route.ts · project/deliverable/engine/atamwalk.ts · project/deliverable/engine/conditions.ts · project/deliverable/engine/scale.ts · project/deliverable/engine/readproof.ts · project/deliverable/engine/sessionreads.ts · project/deliverable/engine/sessionviews.ts · project/deliverable/engine/sessionscript.ts |
| [[dsp-write-guard]] | el-walk-engine | project/deliverable/engine/guard.ts · project/deliverable/engine/rules.ts · project/deliverable/engine/vocabulary.ts · project/deliverable/engine/sweep.ts · project/deliverable/engine/bin/sweep.ts · project/deliverable/engine/files.ts · project/deliverable/engine/tools.ts |
