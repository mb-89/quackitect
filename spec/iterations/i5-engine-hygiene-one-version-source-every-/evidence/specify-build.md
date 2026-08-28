---
form: specify-build
by: agent
signed_off: 2026-08-19T11:59:39.571Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

The design of every change is written into the spec that owns its files, and the build is drawn as five chunks.

NO NEW DESIGN SPEC WAS MINTED. Every change lands in code an existing spec already claims, so minting one would fork a design rather than record it.

ONE DANGLING EDGE WAS CLEARED. dsp-write-guard named the interface this record removed at decompose-structure, and a spec whose edges do not resolve fails this state's own law.

## design_specs

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
| [[dsp-the-outside-boundaries-and-their-bounds]] | if-agent-harness-to-entrypoint · if-engineer-to-mirror · if-vscode-to-mirror · if-test-runner-to-toolchain · if-bootstrap-to-toolchain · if-account-to-git · if-record-store-to-git · if-record-store-to-origin-remote · if-account-to-obsidian · if-walk-engine-to-web · if-mirror-to-output-tools | project/deliverable/machines/items/interface.md · project/deliverable/engine/trace.ts · project/deliverable/engine/elematrix.ts |
| [[dsp-the-producing-acts]] | el-vehicle-producer · el-project-producer · if-project-producer-to-resolution-seam · el-mirror | project/deliverable/engine/produce.ts · project/deliverable/engine/paths.ts · project/deliverable/engine/tools.ts · project/deliverable/vscode/src/extension.ts |
| [[dsp-the-update-channel]] | el-update-runner · el-change-reporter · if-change-reporter-to-update-runner | project/deliverable/engine/update.ts |
| [[dsp-trace-corpus]] | el-account | project/deliverable/engine/trace.ts · project/deliverable/engine/traceschema.ts · project/deliverable/engine/frontmatter.ts · project/deliverable/engine/bin/backfill-minted.ts |
| [[dsp-unattended-entrypoint]] | el-entrypoint | project/deliverable/engine/bin/se-start.ts · project/deliverable/package.json |
| [[dsp-walk-machine]] | el-walk-engine · if-method-compiler-to-walk-engine · if-record-store-to-walk-engine | project/deliverable/engine/session.ts · project/deliverable/engine/machine.ts · project/deliverable/engine/pull.ts · project/deliverable/engine/route.ts · project/deliverable/engine/atamwalk.ts · project/deliverable/engine/conditions.ts · project/deliverable/engine/scale.ts · project/deliverable/engine/readproof.ts · project/deliverable/engine/sessionreads.ts · project/deliverable/engine/sessionviews.ts · project/deliverable/engine/sessionscript.ts |
| [[dsp-write-guard]] | el-walk-engine | project/deliverable/engine/guard.ts · project/deliverable/engine/rules.ts · project/deliverable/engine/vocabulary.ts · project/deliverable/engine/sweep.ts · project/deliverable/engine/bin/sweep.ts · project/deliverable/engine/files.ts · project/deliverable/engine/tools.ts |

## promotions

| experiment | promote | chunk |
| --- | --- | --- |

## follow_up

observe-red is next and it runs the five files. Nine cases must fail, each for the reason its spec names.

build-steps then walks the five chunks in the drawn order.

THE ORDER IS NOT A DESIGN COUPLING and the drawing says so in its own words. Three chunks share `engine/render.ts` and are chained for that reason alone. A later reader taking those edges for a design dependency would be reading something that is not there.

## anything_else

WHICH SPEC TOOK WHICH CHANGE, so no later state has to work it out.

- dsp-lane-door — the version flag. It already claims `bin/se-mcp.ts`.
- dsp-quality-toolchain — preflight asking the reader. It already claims `bin/preflight.ts`.
- dsp-call-log — the actor stamp. It already claims `calllog.ts`, and its own statement has always said "every call appended with role and channel", which is the demand this record found unmet.
- dsp-evidence-forms — the empty live source. It already claims `stateform.ts`.
- dsp-mirror-render — the paint decider. It already claims `render.ts`.
- dsp-radial-layout — the table-header fix. It already claims `trace.ts`.

THE LAST ONE IS OUTSIDE THE BLESSED SCOPE and is written down as such, on the register and at gate-implementation. It is recorded here because a fix in the tree with no design behind it is exactly what the dead-code sweep catches later, and answering it now costs one section.

NO PROMOTION TO ASSIGN. No spike ran in this record, so the promotions table is empty and that is a result rather than a blank.

TWO MORE ENGINE DEFECTS BLOCKED THIS STATE, both in the same check and both the same family as the header one. The reference check was written for a dash-led list and later pointed at bound tables, so every assumption it makes about a line fails for a register the engine builds itself.

- IT READ THE SECOND CELL. A node-table's row is one node and then that node's own frontmatter, which the table WRITES rather than resolves. Reading the second cell turned every element id in a design spec's `realizes` column into a reference of the wrong type — twenty complaints, none of them about the corpus.
- IT DEMANDED A `none` NOBODY COULD WRITE. A bound table over an empty live source has a header and no rows. The rows are not the author's to choose, so there is no line for them to write.

BOTH ARE ON THE REGISTER as raid-iss-the-refs-check-reads-a-node-tables-written-cells, and both are outside the blessed scope. gate-implementation rules on all three engine fixes together.

## checks

| test-spec | method | verifies |
| --- | --- | --- |
| [[tsp-a-breached-bound-reaches-a-reviewer]] | test | req-a-breached-bound-is-put-in-front-of-a-reviewer |
| [[tsp-a-configuration-path-lives-in-one-place]] | inspection | req-a-preflight-check-asks-the-reader-where-it-looked |
| [[tsp-a-control-is-legible]] | test | req-a-refused-act-says-why-and-what-next · req-a-surface-shows-the-state-an-act-produced · req-a-control-that-undoes-on-a-second-press-says-so-first |
| [[tsp-a-copy-is-owned-and-still-takes-what-we-learn]] | demonstration | none — demonstrates: carries the edge; the producing half is verify_method: test and is carried by tsp-a-vehicle-is-made-and-then-drives-something-else |
| [[tsp-a-decline-is-legible-to-the-person]] | demonstration | none — demonstrates: carries the edge; the three requirements behind this story are verify_method: test and are carried by tsp-a-control-is-legible |
| [[tsp-a-long-wait-is-never-a-guess]] | demonstration | none — demonstrates: carries the edge; req-work-past-its-bound-says-it-is-working is verify_method: test and is carried by tsp-work-past-its-bound-signals |
| [[tsp-a-parked-finding-reaches-another-clone]] | demonstration | none — this spec demonstrates a story end to end; no requirement is verified through it |
| [[tsp-a-produced-tree-is-bounded-and-named]] | test | req-an-act-writes-only-the-tree-it-produced · req-the-product-name-is-one-fact · req-where-each-artifact-lands-when-driving |
| [[tsp-a-recorded-act-carries-its-actor]] | test | req-the-actor-is-recorded-where-the-call-is-served · req-acts-carry-role-and-channel |
| [[tsp-a-repeatable-answer-earns-its-trust]] | demonstration | none — this spec demonstrates a story end to end; no requirement is verified through it |
| [[tsp-a-slow-signal-keeps-the-wait]] | demonstration | req-a-slowness-signal-never-shortens-the-wait |
| [[tsp-a-structured-query-answers-what-a-decision-touches]] | demonstration | none — demonstrates: carries the edge; the evaluator's own mechanics are test-verified by tsp-query-answers over tests/query.test.ts |
| [[tsp-a-vehicle-cannot-reach-what-it-came-from]] | demonstration | none — demonstrates: carries the edge; the containment rules are verify_method: test and are carried by tsp-a-produced-tree-is-bounded-and-named |
| [[tsp-a-vehicle-is-made-and-then-drives-something-else]] | demonstration | req-one-command-produces-a-complete-copy · req-the-system-runs-in-a-tree-that-is-not-its-own |
| [[tsp-an-amend-leaves-the-tree-standing]] | test | req-an-amend-leaves-the-tree-standing |
| [[tsp-an-empty-offer-says-so]] | test | req-an-empty-live-source-names-itself |
| [[tsp-an-install-answers-what-it-is]] | test | req-the-entrypoint-answers-its-version-without-starting |
| [[tsp-answer-bound]] | test | req-the-answer-never-exceeds-its-bound |
| [[tsp-archive]] | test | req-archive-lists-every-closed-record · req-archive-opens-to-a-person-only · req-archive-read-only · req-archive-shows-it-as-it-closed · req-a-closed-records-folder-stays-on-trunk |
| [[tsp-assertion-red]] | test | req-a-red-is-an-assertion-not-a-crash |
| [[tsp-autonomy-surface]] | test | req-emergency-sits-above-full · req-drumroll-arms-deliberately · req-controls-draw-from-their-spec · req-shutdown-fires-only-idle-or-end |
| [[tsp-autonomy-tiers]] | inspection | req-autonomy-is-categorical |
| [[tsp-boot-bench]] | test | req-boot-ends-at-front-desk |
| [[tsp-bound-engine-and-method]] | test | req-an-engine-change-applies-in-its-own-record · req-a-method-change-reaches-every-tree |
| [[tsp-bound-resolution]] | test | req-a-read-comes-from-where-it-is-meant · req-a-write-lands-where-it-is-meant · req-a-wrong-act-never-passes-silently · req-version-control-resolves-like-every-call |
| [[tsp-bound-rules]] | test | req-a-check-binds-without-engine-code · req-an-unbound-rule-is-reported |
| [[tsp-bound-surface]] | demonstration | req-a-surface-resolves-to-what-it-shows |
| [[tsp-call-log]] | test | req-every-call-logged · req-refusal-carries-remedy · req-acts-carry-role-and-channel · req-answer-recorded-with-question · req-audit-answers-from-log · req-outbound-query-logged · req-missing-provider-named |
| [[tsp-candidate-couplings-are-disposed-one-by-one]] | demonstration | none — demonstrates: carries the edge; the ranker's own mechanics are test-verified over tests/coupling-rank.test.ts |
| [[tsp-carry-a-finding]] | demonstration | none — this spec demonstrates a story end to end; no requirement is verified through it |
| [[tsp-claims-and-drift]] | test | req-form-is-built-and-checked · req-gate-evidence-must-be-sound · req-moved-evidence-invalidates-the-bless · req-rejection-carries-its-reason · req-fallen-condition-named |
| [[tsp-close-and-land]] | test | req-close-refuses-loose-ends · req-close-serves-its-findings · req-close-leaves-trunk-clean · req-land-demands-fresh-green · req-reject-names-the-redo · req-trees-never-mix |
| [[tsp-conformance-at-the-write]] | demonstration | none — demonstrates: carries the edge; both requirements are verify_method: test and are carried by tsp-bound-rules and tsp-write-guard |
| [[tsp-coupling-disposition]] | inspection | req-bm25-candidates-need-disposition |
| [[tsp-coupling-rank]] | test | req-bm25-returns-ranked-candidates · req-bm25-below-threshold-returns-empty |
| [[tsp-coverage-computes-both-sides]] | test | req-a-coverage-check-computes-both-sides |
| [[tsp-decision-machinery]] | test | req-two-options-beyond-the-obvious · req-option-carries-cost-and-shed · req-choice-records-case-against-losers · req-choosing-none-is-legal · req-single-option-recorded-as-finding · req-problem-recorded-before-options · req-ideation-opens-no-record |
| [[tsp-derivation-analysis]] | analysis | req-trace-view-derived-from-files · req-reachable-capability-is-traced |
| [[tsp-design-checks]] | test | req-structure-verdicts-are-mechanical · req-bound-field-rebuilds-from-nodes · req-drawn-state-equals-a-row |
| [[tsp-desk-and-gates]] | demonstration | req-desk-greets-walkable · req-desk-takes-plain-words · req-desk-states-the-folder-rule · req-small-fix-joins-open-record · req-retro-asks-real-use · req-gate-rounds-stay-readable · req-gate-shows-the-evidence-form · req-overhaul-opens-without-deliverable |
| [[tsp-engine-lifecycle]] | test | req-surface-answers-in-one-second · req-crash-lands-safe · req-reload-restarts-clean · req-call-answers-in-one-second · req-mirror-stays-on-the-machine · req-engine-port-fallback · req-the-lane-runs-without-a-console |
| [[tsp-fallback-outcome]] | test | req-a-fallback-fires-when-its-condition-fails |
| [[tsp-first-run]] | demonstration | req-newcomer-one-command · req-newcomer-orients-unaided · req-newcomer-leaves-able-to-ask · req-one-script-installs · req-second-product-reuses-install · req-setup-serves-shipped-method · req-begin-says-own-window · req-fresh-machine-runs · req-boot-stands-agentless |
| [[tsp-hand-walk]] | demonstration | none — demonstrates: sty-walk-it-by-hand carries the edge; the mechanics are test-verified by tsp-walk-discipline |
| [[tsp-help-search]] | test | req-help-searches-tools-and-guidance · req-help-miss-is-logged · req-help-demand-ranked · req-help-query-logged-with-result |
| [[tsp-lane-cost]] | test | req-the-full-battery-runs-where-the-method-says · req-a-deletion-names-what-points-at-the-node |
| [[tsp-lane-file-safety]] | test | req-no-agent-act-destroys-work · req-every-artifact-is-readable-text · req-repo-search-carries-intent · req-lane-fixes-what-machines-fix |
| [[tsp-lane-help-run]] | demonstration | none — demonstrates: sty-ask-the-lane-what-it-can-do carries the edge; the mechanics are test-verified by tsp-help-search |
| [[tsp-live-table]] | test | req-table-rows-derive-from-notes · req-cell-edit-lands-in-the-note · req-table-refuses-what-it-cannot-draw · req-view-writes-round-trip · req-query-is-the-file · req-grouping-and-sorting-hold · req-expressions-evaluate-per-reference |
| [[tsp-node-scoping]] | test | req-nodes-scoped-to-iteration |
| [[tsp-notes-inbox]] | test | req-stray-captured-in-one-call · req-capture-moves-nothing · req-idea-lands-as-note · req-duplicate-stray-still-captured · req-open-notes-stay-visible · req-drained-note-leaves-count · req-drain-one-home-with-payload · req-parked-note-re-drains · req-unknown-drain-ref-refused · req-retro-window-drains-whole · req-kickoff-refuses-pending-notes |
| [[tsp-one-door-into-the-pool]] | inspection | req-the-crossing-is-the-same-act-for-a-person-and-an-agent |
| [[tsp-one-operation-reads-its-input-once]] | test | req-one-operation-reads-its-input-once |
| [[tsp-overhaul-sweep]] | test | req-overhaul-closes-green · req-overhaul-takes-only-unowned-drift · req-sweep-covers-every-drift-class · req-clean-sweep-is-dated |
| [[tsp-overlay-seam]] | test | req-overlay-resolution · req-overlay-survives-update · req-overlay-drift-reported · req-guidance-edit-lands-where-it-compiles |
| [[tsp-panel-walkthrough]] | demonstration | req-panel-shows-the-machine · req-selected-node-shows-its-claim · req-resume-needs-no-person · req-walk-survives-host-swap |
| [[tsp-placeholder-refuses-entry]] | test | req-a-placeholder-drawing-refuses-entry |
| [[tsp-product-scaffold]] | test | req-begin-touches-nothing-existing · req-fresh-product-starts-empty · req-scaffold-from-template · req-method-reuse-is-vendoring · req-product-is-a-folder · req-nothing-a-copy-does-reaches-its-source · req-setup-floor-editor-shell · req-setup-stops-before-partial · req-extension-replaced-reported |
| [[tsp-prose-inspection]] | inspection | req-entry-speaks-plainly · req-tour-speaks-plainly · req-roles-never-usernames · req-no-claim-without-evidence · req-vendor-page-claim-only · req-comparison-carries-both-sides · req-one-note-per-settled-point · req-desk-offers-a-tour |
| [[tsp-query-answers]] | test | req-query-returns-named-fields · req-query-refuses-unknown-field · req-query-empty-result-explicit · req-query-is-deterministic |
| [[tsp-read-back-inspection]] | inspection | req-a-resolution-is-proven-by-read-back · req-every-record-path-resolves-in-one-tree |
| [[tsp-reading-loop]] | test | req-reading-proof · req-owed-reading-is-served · req-compaction-reowes-the-reading · req-missing-document-stops-the-walk |
| [[tsp-reading-proof-run]] | demonstration | none — demonstrates: sty-the-agent-proves-it-read carries the edge; the mechanics are test-verified by tsp-reading-loop |
| [[tsp-record-inspection]] | inspection | req-purpose-recorded-at-begin · req-record-arrives-prefilled · req-recommendation-is-derived · req-routing-reasoning-recorded · req-losers-stay-on-record · req-divergence-order-on-record · req-finding-keeps-its-sources · req-finding-lands-as-reference · req-finding-names-its-home · req-story-links-its-proving-run · req-upward-links-live-in-the-file · req-test-run-carries-its-question |
| [[tsp-record-lifecycle]] | test | req-container-offers-its-records · req-survey-counts-only-open-records · req-record-opens-on-word · req-record-status-comes-from-the-record · req-walk-opens-at-retro · req-unshipped-dependency-refused · req-landing-needs-no-close · req-size-choice-is-the-bless · req-size-escalation-readjudicated · req-size-proposal-names-strikes · req-bless-outputs-ride-the-bless · req-blessed-column-compiles-pinned · req-a-shipped-record-is-never-reclaimed · req-a-records-dependency-is-declared · req-a-records-own-status-decides-whether-it-is-open · req-entering-repairs-itself-or-names-the-remedy · req-work-starts-without-a-reachable-remote |
| [[tsp-ripple-root]] | test | req-a-ripple-names-its-root |
| [[tsp-seed-dependency]] | test | req-a-seed-states-its-dependency |
| [[tsp-seeded-scaffolds]] | test | req-pin-writes-seeded-scaffolds |
| [[tsp-size-compiles-mechanically]] | test | req-the-size-is-read-by-one-extractor · req-a-size-may-drop-a-question |
| [[tsp-supply-gap]] | test | req-no-state-demands-what-it-cannot-supply |
| [[tsp-test-discipline]] | test | req-scoped-run-records-its-timings · req-test-scope-discipline · req-test-result-is-structured · req-first-green-needs-a-red · req-red-is-never-carried |
| [[tsp-the-arrival]] | test | req-the-arrival-never-costs-the-session · req-the-declared-runtime-floor-is-read-never-edited |
| [[tsp-the-arrival-in-one-act]] | demonstration | req-one-command-takes-a-fresh-clone-to-a-live-lane · req-arriving-twice-changes-nothing |
| [[tsp-the-bucket]] | test | req-a-harmless-finding-is-carried-not-stopped-on · req-a-harmless-finding-names-an-open-entry · req-close-refuses-loose-ends |
| [[tsp-the-cited-refs-resolve]] | demonstration | req-every-ref-the-corpus-cites-resolves-on-arrival |
| [[tsp-the-driving-calls-come-back-inside-a-second]] | demonstration | none — demonstrates: carries the edge; the one-second demand is verify_method: test and is carried by the bound checks on the modelled interfaces |
| [[tsp-the-engine-keeps-no-record-of-what-it-produced]] | inspection | req-the-source-keeps-no-record-of-a-copy |
| [[tsp-the-graph-answers-what-a-change-touches]] | demonstration | none — this spec demonstrates a story end to end; no requirement is verified through it |
| [[tsp-the-mint-crosses-the-boundary]] | test | req-draining-to-the-pool-mints-an-option-on-trunk · req-a-minted-option-is-authored-never-the-note-s-own-text · req-a-minted-option-says-what-it-is-and-when-it-comes-back · req-the-raw-note-stays-local-and-is-marked-drained |
| [[tsp-the-paint-tells-three-greens-apart]] | test | req-the-panel-s-paint-says-which-kind-of-green-it-is |
| [[tsp-the-pool-is-what-is-offered]] | test | req-open-work-is-answered-from-the-repository-not-a-local-store · req-a-windowed-pool-answer-says-that-it-was-windowed · req-the-pool-answers-a-person-and-an-agent-from-one-source |
| [[tsp-tour-resilience]] | test | req-tour-admits-absence · req-tour-outlives-a-missing-highlight |
| [[tsp-tour-run]] | demonstration | req-tour-ends-at-the-desk · req-tour-highlights-the-named-part · req-tour-reads-what-stands · req-tour-shows-live-instances |
| [[tsp-trace-graph-view]] | test | req-filter-draws-only-what-serves |
| [[tsp-trace-integrity]] | test | req-broken-trace-is-a-defect · req-coverage-checked-both-ways · req-trace-source-never-mixes |
| [[tsp-two-machines]] | demonstration | req-one-command-starts-an-unattended-machine |
| [[tsp-unattended-start]] | demonstration | req-one-command-starts-an-unattended-machine |
| [[tsp-walk-branch-return]] | test | req-walk-branches-at-waypoint |
| [[tsp-walk-discipline]] | test | req-a-clear-jump-is-one-call · req-answer-pages-never-overflows · req-autonomy-gates-every-hop · req-autonomy-change-applies-forward · req-controls-never-advance-walk · req-gate-needs-a-persons-verdict · req-pull-answers-from-record · req-walk-resumes-from-repo · req-state-opens-only-when-earned · req-state-needs-all-its-inputs · req-a-reopen-stands-where-it-can-work · req-land-target-routes-to-gate · req-instruction-names-its-source · req-a-pull-carrying-no-choice-enters-no-iteration |
| [[tsp-walk-feedback-loop]] | test | req-reading-credit-survives-a-reload · req-red-objective-serves-its-fill · req-one-verb-says-why-a-state-is-grey |
| [[tsp-walk-window]] | test | req-reader-keeps-their-place · req-every-update-reaches-the-render · req-colors-are-configuration · req-narration-toll-is-collected · req-decision-graph-reads-as-branches |
| [[tsp-work-past-its-bound-signals]] | test | req-work-past-its-bound-says-it-is-working |
| [[tsp-write-guard]] | test | req-a-write-that-breaks-the-corpus-refuses · req-a-value-outside-its-vocabulary-refuses · req-a-standing-break-reports-and-lands · req-a-check-names-its-way-forward · req-a-check-too-slow-for-the-write-moves-to-the-sweep |
