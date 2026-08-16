---
form: trace-design
by: agent
signed_off: 2026-08-16T18:34:50.276Z
reopened: "2026-08-16T18:31:20.351Z — the nearest passed state granting a write verb, so the owed-ref check can be fixed where verification cannot reach it"
authors: agent
files:
---

# Evidence form / trace-design

## current_situation

THE BUILD ADDED THREE CODE FILES, and the sweep is what says so rather than my memory.

engine/seed.ts holds the one demand both seed doors answer to. engine/machines/supply.ts holds the compile-time check that no state demands what it cannot supply. engine/bin/supply-gaps.ts is that check in reporting form, which ran before the check was allowed to refuse anything.

FOUR MORE LANDED EARLIER IN THIS ITERATION and were claimed at the last pass: guard.ts, rules.ts, vocabulary.ts and sweep.ts, all under dsp-write-guard.

NO ELEMENT MOVED. Every new file sits under a spec that already realized the element it belongs to.

## design_trace

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
| [[dsp-method-compilation]] | el-method-compiler | project/deliverable/engine/rigor-matrix.ts · project/deliverable/engine/canvas.ts · project/deliverable/engine/catalogs.ts · project/deliverable/engine/machines/compile.ts · project/deliverable/engine/expmachine.ts · project/deliverable/engine/machines/supply.ts · project/deliverable/engine/bin/supply-gaps.ts |
| [[dsp-mirror-render]] | el-mirror · if-account-to-mirror · if-front-desk-to-mirror · if-holding-pen-to-mirror · if-method-compiler-to-mirror · if-record-store-to-mirror · if-walk-engine-to-mirror | project/deliverable/engine/render.ts · project/deliverable/engine/mirror.ts · project/deliverable/engine/panel.ts · project/deliverable/engine/brand.ts · project/deliverable/engine/card-parts.ts · project/deliverable/engine/cards.ts · project/deliverable/engine/traceui.ts · project/deliverable/engine/gitgraph.ts · project/deliverable/engine/shoot.ts · project/deliverable/engine/bin/brand.ts · project/deliverable/engine/bin/mermaid-check.ts · project/deliverable/engine/bin/place-prompt-layer.ts |
| [[dsp-narration]] | el-walk-engine | project/deliverable/engine/decisions.ts · project/deliverable/engine/toll.ts · project/deliverable/engine/bin/render-decisions.ts |
| [[dsp-note-pen]] | el-holding-pen · if-holding-pen-to-front-desk | project/deliverable/engine/notes.ts · project/deliverable/engine/inbox.ts |
| [[dsp-quality-toolchain]] | el-test-runner · if-record-store-to-test-runner · if-test-runner-to-record-store | project/deliverable/engine/testreporters.ts · project/deliverable/engine/tools.ts · project/deliverable/engine/lint.ts · project/deliverable/engine/bin/grades-complete.ts · project/deliverable/engine/bin/backfill-minted.ts · project/deliverable/engine/lintfix.ts · project/deliverable/engine/bin/selftest.ts · project/deliverable/engine/bin/smoketest.ts · project/deliverable/engine/bin/preflight.ts · project/deliverable/engine/bin/red-observed.ts · project/deliverable/engine/bin/battery.ts · project/deliverable/engine/bin/test-timings.mjs |
| [[dsp-record-lifecycle]] | el-record-store · if-front-desk-to-record-store | project/deliverable/engine/iterations.ts · project/deliverable/engine/worktree.ts · project/deliverable/engine/seed.ts |
| [[dsp-resolution-seam]] | el-resolution-seam · if-satellite-to-resolution-seam · if-walk-engine-to-resolution-seam · if-satellite-supervisor-to-resolution-seam · if-resolution-seam-to-engine-delta · if-resolution-seam-to-method-compiler · if-record-store-to-resolution-seam · if-resolution-seam-to-account | project/deliverable/engine/paths.ts · project/deliverable/engine/resolve.ts · project/deliverable/engine/files.ts · project/deliverable/engine/run.ts · project/deliverable/engine/lint.ts · project/deliverable/engine/tools.ts |
| [[dsp-satellite-lifecycle]] | el-satellite-supervisor · if-satellite-supervisor-to-satellite · if-satellite-supervisor-to-record-store · if-satellite-supervisor-to-walk-engine · if-satellite-supervisor-to-test-runner · if-satellite-supervisor-to-mirror · if-front-desk-to-satellite-supervisor | project/deliverable/engine/supervisor.ts · project/deliverable/engine/worktree.ts |
| [[dsp-trace-corpus]] | el-account | project/deliverable/engine/trace.ts · project/deliverable/engine/traceschema.ts · project/deliverable/engine/frontmatter.ts · project/deliverable/engine/bin/backfill-minted.ts |
| [[dsp-unattended-entrypoint]] | el-entrypoint | project/deliverable/engine/bin/se-start.ts · project/deliverable/package.json |
| [[dsp-walk-machine]] | el-walk-engine · if-method-compiler-to-walk-engine · if-record-store-to-walk-engine | project/deliverable/engine/session.ts · project/deliverable/engine/machine.ts · project/deliverable/engine/pull.ts · project/deliverable/engine/route.ts · project/deliverable/engine/atamwalk.ts · project/deliverable/engine/conditions.ts · project/deliverable/engine/scale.ts |
| [[dsp-write-guard]] | el-walk-engine · if-satellite-to-walk-engine | project/deliverable/engine/guard.ts · project/deliverable/engine/rules.ts · project/deliverable/engine/vocabulary.ts · project/deliverable/engine/sweep.ts · project/deliverable/engine/files.ts · project/deliverable/engine/tools.ts |

## follow_up

THREE FILES JOINED TWO STANDING SPECS, each placed where the element already lived rather than under a new spec.

- seed.ts to dsp-record-lifecycle, which realizes el-record-store and already claimed both record writers.
- machines/supply.ts and bin/supply-gaps.ts to dsp-method-compilation, which realizes el-method-compiler and already claimed both compile paths the check is wired into.

EACH SPEC GAINED A CONSTRAINT LINE, because a file list says what code exists and not what rule it holds.

TWO STALE STATEMENTS GO TO sweep-consistency, both found by reading these specs rather than by looking for them.

- dsp-record-lifecycle's statement says records are "carried by one worktree per open record". i34 deleted worktrees; there is one tree.
- Its constraint "Two open records never share a tree" is now false in the same way, and what replaced it is an assumption with a trigger rather than a rule.

NEITHER IS FIXED HERE. Rewriting a standing spec's statement is an unasked refactor under contract rule 2, and sweep-consistency is the state that owns exactly this.

VERIFICATION IS NEXT, and it fires the battery that covers every run owed since chunk six.

## anything_else

### Why this state was reopened, and what the reopen changed

NOTHING IN THE TABLE. The design trace still holds exactly as signed.

VERIFICATION BLOCKED ON A DEFECT IT COULD NOT REACH. Its claims checklist refused two boxes whose owed reference resolves to an ACCEPTED debt entry, because engine/stateform.ts tested `status === "open"` while its own comment named a different rule: closed, decided or missing refuse, "because there is nobody left holding the claim".

VERIFICATION GRANTS NO WRITE VERB, on purpose. The engine's own remedy for going back is to reopen a passed state, and this is the nearest one that grants se_file_patch. That is why an evidence-form fix carries a design-trace reopen, and saying so here is the honest bookkeeping.

THE FIX IS INSIDE A FILE THIS TABLE ALREADY CLAIMS. stateform.ts stands under dsp-evidence-forms and has since i1, so no row moved. tests/owed-ref.test.ts is new and joins tsp-the-bucket, which is the spec that already owned this question — it names it in its own "deliberately out" section.

### It was not scope creep, and the register says so

raid-asm-an-entry-status-says-whether-it-is-open ASKED FOR EXACTLY THIS PROBE: "read the eight status values and rule which count as open for this guard". It predicted the failing case too — "the interesting cases are `accepted` and `deferred`" — and `accepted` is the one that bit.

THE ENTRY NOW CARRIES ITS RESULT and stays open, because its second half is unchanged: there is no close-side reader to compare the list against.
