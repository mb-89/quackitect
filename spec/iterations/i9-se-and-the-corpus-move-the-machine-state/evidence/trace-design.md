---
form: trace-design
by: agent
signed_off: 2026-08-20T10:58:51.579Z
reopened: "2026-08-20T10:58:39.015Z — it answered older ground: every chunk was re-signed after it, and two more files joined the corpus reader"
authors: agent
files:
---

# Evidence form / trace-design

## current_situation

The two reopened chunks fell through this state, and two more files joined the corpus reader.

The mirror renders a node's body by stripping its frontmatter, and the form stamper inserts a line after the opening fence. Both carried a private split; both now share the engine's one, and both are claimed here.

The dead-code sweep found nothing else at its grain.

## design_trace

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-boot-and-power]] | el-bootstrap | deliverable/engine/lifecycle.ts · deliverable/engine/stopping-layer.ts · deliverable/engine/cage-inventory.ts · deliverable/engine/bin/se-pty.ts · deliverable/engine/bin/se-hook-stop.ts · deliverable/engine/bin/se-hook-start.ts · deliverable/engine/pullnotice.ts · deliverable/engine/bin/package.ts · deliverable/engine/version.ts · deliverable/engine/sessionlive.ts |
| [[dsp-call-log]] | el-account · if-walk-engine-to-account · if-holding-pen-to-account · if-method-compiler-to-account · if-record-store-to-account | deliverable/engine/failure-shapes.ts · deliverable/engine/calllog.ts · deliverable/engine/version.ts · deliverable/engine/survey.ts |
| [[dsp-coupling-disposer]] | el-coupling-disposer | deliverable/engine/disposition.ts |
| [[dsp-decision-mathematics]] | el-method-compiler | deliverable/engine/dsm.ts · deliverable/engine/pugh.ts · deliverable/engine/pareto.ts · deliverable/engine/compare.ts · deliverable/engine/elematrix.ts · deliverable/engine/morphbox.ts · deliverable/engine/bin/flow-closure.ts · deliverable/engine/bin/grades-complete.ts |
| [[dsp-engine-delta]] | el-engine-delta · if-engine-delta-to-account · if-engine-delta-to-mirror · if-engine-delta-to-walk-engine | deliverable/engine/paths.ts · deliverable/engine/machines/compile.ts |
| [[dsp-evidence-forms]] | el-walk-engine | deliverable/engine/stateform.ts · deliverable/engine/forms.ts · deliverable/engine/sessionforms.ts · deliverable/engine/stateform-problems.ts · deliverable/engine/stateform-sheet.ts |
| [[dsp-file-lane]] | el-walk-engine | deliverable/engine/files.ts · deliverable/engine/files-patch.ts · deliverable/engine/signals.ts · deliverable/engine/paths.ts · deliverable/engine/resolve.ts · deliverable/engine/search.ts · deliverable/engine/move.ts · deliverable/engine/run.ts · deliverable/engine/web.ts · deliverable/engine/gitlane.ts · deliverable/engine/jsonio.ts · deliverable/engine/hash.ts · deliverable/engine/model-fs.ts · deliverable/engine/bin/outward-search.ts · deliverable/engine/bin/se-hook-websearch.ts |
| [[dsp-form-editors]] | el-mirror | deliverable/engine/editors/index.ts · deliverable/engine/editors/kinds.ts · deliverable/engine/editors/checklist.ts · deliverable/engine/editors/choice-rationale.ts · deliverable/engine/editors/compare-card.ts · deliverable/engine/editors/decision-matrix.ts · deliverable/engine/editors/dsm.ts · deliverable/engine/editors/element-matrix.ts · deliverable/engine/editors/exposure-pick.ts · deliverable/engine/editors/findings.ts · deliverable/engine/editors/list.ts · deliverable/engine/editors/morph-box.ts · deliverable/engine/editors/node-table.ts · deliverable/engine/editors/pareto-plot.ts · deliverable/engine/editors/per-item.ts · deliverable/engine/editors/rank-cut.ts · deliverable/engine/editors/scenario-deck.ts · deliverable/engine/editors/sensitivity.ts · deliverable/engine/editors/table.ts |
| [[dsp-front-desk]] | el-front-desk | deliverable/machines/main.canvas |
| [[dsp-help-search]] | el-walk-engine | deliverable/engine/help.ts · deliverable/engine/tools.ts |
| [[dsp-lane-door]] | el-walk-engine | deliverable/engine/harness.ts · deliverable/engine/payload-limit.ts · deliverable/engine/tools.ts · deliverable/engine/tools-file.ts · deliverable/engine/tools-run.ts · deliverable/engine/tools-desk.ts · deliverable/engine/mcp.ts · deliverable/engine/errors.ts · deliverable/engine/discipline.ts · deliverable/engine/promptlayer.ts · deliverable/engine/params.ts · deliverable/engine/bound.ts · deliverable/engine/bin/se-mcp.ts · deliverable/engine/bin/se-manual.ts |
| [[dsp-legible-controls]] | el-mirror | deliverable/engine/params.ts · deliverable/engine/mirror.ts · deliverable/engine/run.ts · deliverable/vscode/src/extension.ts |
| [[dsp-live-register]] | el-mirror | deliverable/engine/bases.ts · deliverable/engine/basesclient.ts · deliverable/engine/baseui.ts · deliverable/engine/tables.ts · deliverable/engine/vault.ts · deliverable/engine/expr.ts · deliverable/engine/expr-parse.ts · deliverable/engine/expr-value.ts · deliverable/engine/bin/format-vault.ts · deliverable/engine/signals.ts |
| [[dsp-method-compilation]] | el-method-compiler | deliverable/engine/rigor-matrix.ts · deliverable/engine/canvas.ts · deliverable/engine/catalogs.ts · deliverable/engine/machines/compile.ts · deliverable/engine/expmachine.ts · deliverable/engine/machines/supply.ts |
| [[dsp-mirror-render]] | el-mirror · if-account-to-mirror · if-front-desk-to-mirror · if-holding-pen-to-mirror · if-method-compiler-to-mirror · if-record-store-to-mirror · if-walk-engine-to-mirror | deliverable/engine/render.ts · deliverable/engine/renderclient.ts · deliverable/engine/renderclient-detail.ts · deliverable/engine/renderclient-walk.ts · deliverable/engine/renderclient-form.ts · deliverable/engine/renderclient-panel.ts · deliverable/engine/renderclient-log.ts · deliverable/engine/renderclient-live.ts · deliverable/engine/renderstyle.ts · deliverable/engine/mirror.ts · deliverable/engine/panel.ts · deliverable/engine/brand.ts · deliverable/engine/card-parts.ts · deliverable/engine/cards.ts · deliverable/engine/traceui.ts · deliverable/engine/gitgraph.ts · deliverable/engine/shoot.ts · deliverable/engine/bin/brand.ts · deliverable/engine/bin/mermaid-check.ts · deliverable/engine/bin/place-prompt-layer.ts |
| [[dsp-narration]] | el-walk-engine | deliverable/engine/decisions.ts · deliverable/engine/toll.ts · deliverable/engine/bin/render-decisions.ts |
| [[dsp-note-pen]] | el-holding-pen · if-holding-pen-to-front-desk | deliverable/engine/notes.ts · deliverable/engine/inbox.ts |
| [[dsp-quality-toolchain]] | el-test-runner · if-record-store-to-test-runner · if-test-runner-to-record-store · if-test-runner-to-walk-engine | deliverable/engine/testreporters.ts · deliverable/engine/tools.ts · deliverable/engine/lint.ts · deliverable/engine/bin/grades-complete.ts · deliverable/engine/bin/backfill-minted.ts · deliverable/engine/lintfix.ts · deliverable/engine/bin/selftest.ts · deliverable/engine/bin/smoketest.ts · deliverable/engine/bin/preflight.ts · deliverable/engine/bin/red-observed.ts · deliverable/engine/bin/battery.ts · deliverable/engine/bin/test-timings.mjs · deliverable/engine/bin/prose-inspect.ts · deliverable/engine/bin/record-inspect.ts |
| [[dsp-query-evaluator]] | el-query-evaluator | deliverable/engine/query.ts |
| [[dsp-radial-layout]] | el-mirror | deliverable/engine/trace.ts · deliverable/engine/trace-layout.ts |
| [[dsp-record-lifecycle]] | el-record-store · if-front-desk-to-record-store | deliverable/engine/iterations.ts · deliverable/engine/iterations-draw.ts · deliverable/engine/records.ts · deliverable/engine/seed.ts |
| [[dsp-resolution-seam]] | el-resolution-seam · if-walk-engine-to-resolution-seam · if-resolution-seam-to-engine-delta · if-resolution-seam-to-method-compiler · if-record-store-to-resolution-seam · if-resolution-seam-to-account | deliverable/engine/paths.ts · deliverable/engine/resolve.ts · deliverable/engine/tools.ts |
| [[dsp-the-arrival]] | el-arrival · if-arrival-to-walk-engine | deliverable/engine/bin/se-arrive.ts · deliverable/engine/bin/se-hook-arrive.ts · .claudesettings.json · deliverable/engine/bin/se-hook-start.ts · deliverable/engine/pullnotice.ts |
| [[dsp-the-goal-binds-the-walk]] | el-walk-engine | deliverable/engine/machine.ts · deliverable/engine/stateform.ts · deliverable/engine/rigor-matrix.ts · deliverable/engine/machines/compile.ts · deliverable/engine/session.ts |
| [[dsp-the-install-preflight]] | el-preflight · if-preflight-to-entrypoint | deliverable/engine/bin/install-preflight.ts |
| [[dsp-the-one-corpus-reader]] | el-corpus-reader | deliverable/engine/corpusreaders.ts · deliverable/engine/notes.ts · deliverable/engine/frontmatter.ts · deliverable/engine/sweep.ts · deliverable/engine/guard.ts · deliverable/engine/lint.ts · deliverable/engine/model-fs.ts · deliverable/engine/bin/record-inspect.ts · deliverable/engine/bin/backfill-minted.ts · deliverable/engine/trace.ts · deliverable/engine/stateform.ts |
| [[dsp-the-options-pool]] | el-holding-pen · el-front-desk | deliverable/engine/pool.ts · deliverable/engine/inbox.ts · deliverable/engine/survey.ts |
| [[dsp-the-outside-boundaries-and-their-bounds]] | el-walk-engine · if-agent-harness-to-entrypoint · if-engineer-to-mirror · if-vscode-to-mirror · if-test-runner-to-toolchain · if-bootstrap-to-toolchain · if-account-to-git · if-record-store-to-git · if-record-store-to-origin-remote · if-account-to-obsidian · if-walk-engine-to-web · if-mirror-to-output-tools | deliverable/machines/items/interface.md · deliverable/engine/trace.ts · deliverable/engine/elematrix.ts |
| [[dsp-the-producing-acts]] | el-vehicle-producer · el-project-producer · if-project-producer-to-resolution-seam · el-mirror | deliverable/engine/actbound.ts · deliverable/engine/produce.ts · deliverable/engine/paths.ts · deliverable/engine/tools.ts · deliverable/vscode/src/extension.ts |
| [[dsp-the-state-declaration]] | el-state-declaration · if-walk-engine-to-state-declaration · if-record-store-to-state-declaration · if-project-producer-to-state-declaration · if-state-declaration-to-account · if-state-declaration-to-engine-delta · if-state-declaration-to-method-compiler | deliverable/engine/statedecl.ts · deliverable/engine/statedecl-check.ts · deliverable/engine/rootcheck.ts · deliverable/engine/paths.ts · deliverable/engine/produce.ts · deliverable/engine/search.ts · deliverable/engine/tables.ts · deliverable/engine/vault.ts |
| [[dsp-the-update-channel]] | el-update-runner · el-change-reporter · if-change-reporter-to-update-runner | deliverable/engine/update.ts |
| [[dsp-trace-corpus]] | el-account | deliverable/engine/trace.ts · deliverable/engine/traceschema.ts · deliverable/engine/frontmatter.ts · deliverable/engine/bin/backfill-minted.ts |
| [[dsp-unattended-entrypoint]] | el-entrypoint · if-bootstrap-to-entrypoint · if-project-producer-to-entrypoint | deliverable/engine/bin/se-start.ts · deliverable/package.json |
| [[dsp-walk-machine]] | el-walk-engine · if-method-compiler-to-walk-engine · if-record-store-to-walk-engine | deliverable/engine/session.ts · deliverable/engine/sessionclaims.ts · deliverable/engine/machine.ts · deliverable/engine/pull.ts · deliverable/engine/route.ts · deliverable/engine/atamwalk.ts · deliverable/engine/conditions.ts · deliverable/engine/scale.ts · deliverable/engine/readproof.ts · deliverable/engine/sessionreads.ts · deliverable/engine/sessionviews.ts · deliverable/engine/sessionscript.ts |
| [[dsp-write-guard]] | el-walk-engine | deliverable/engine/guard.ts · deliverable/engine/rules.ts · deliverable/engine/vocabulary.ts · deliverable/engine/sweep.ts · deliverable/engine/bin/sweep.ts · deliverable/engine/files.ts · deliverable/engine/tools.ts |

## follow_up

### The corpus reader is realized across thirteen files

It began as two. Collapsing nine private splits reached the linter, the page render, two stampers, a migration script and the record inspector.

SEVERAL ARE CLAIMED BY TWO SPECS EACH, which is a link being a contribution rather than a mistake. A change to `mirror.ts` touches both the render and the reader, and somebody following one claim would miss half of what they are about to break.

### The grain is still the file

A reader living inside a claimed file is invisible here, and that is how six of the nine splits survived a pass that reported nothing. `splitsItself` answers that particular shape at a grain the trace cannot reach.

IT IS ONE SHAPE, NOT THE CLASS. Dead code and duplicated logic inside claimed files remain unseen, which the state's own guidance says and accepts.

### The shipped bundle is covered by checks rather than by a claim

The editor loads `extension.js`, and no spec names it. Two checks cover it instead: the drift comparison reads both its constants, and the stamp says whether it was built from the source beside it.

THAT IS DELIBERATE. Claiming a generated file under its source's spec would say a person edits it, and the next person to read the claim would edit the wrong file.

## anything_else

