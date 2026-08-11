---
form: author-tests
amended: "2026-08-11T07:42:02.686Z by agent — the register grew under the signed claim: the 2026-08-11 backfill added 20 requirements and 4 specs, and the prose summarized the smaller register"
by: agent
signed_off: 2026-08-11T07:10:37.625Z
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

The backfill landed (owner ruling 2026-08-11): 2 new stories, 3 new use cases and 20 new requirements reverse-engineered from the orphan tests — the live table, the autonomy surface, the design-check machinery and the panel's watching contract. 4 new specs and 6 extended file lists claim them. 29 specs cover all 170 requirements, every one of the 91 test files is referenced by at least one spec, and the law, the conformance and the both-way coverage all answer zero.

## checks

| test-spec | method | verifies | files |
| --- | --- | --- | --- |
| [[tsp-archive]] | test | req-archive-lists-every-closed-record · req-archive-opens-to-a-person-only · req-archive-read-only · req-archive-releases-worktrees · req-archive-shows-it-as-it-closed | tests/archive.test.ts · tests/container.test.ts · tests/threshold.test.ts |
| [[tsp-call-log]] | test | req-every-call-logged · req-refusal-carries-remedy · req-acts-carry-role-and-channel · req-answer-recorded-with-question · req-audit-answers-from-log · req-outbound-query-logged · req-missing-provider-named | tests/mcp.test.ts · tests/mcp-http.test.ts · tests/logquery.test.ts · tests/nesting.test.ts · tests/outward.test.ts |
| [[tsp-claims-and-drift]] | test | req-form-is-built-and-checked · req-gate-evidence-must-be-sound · req-moved-evidence-invalidates-the-bless · req-rejection-carries-its-reason · req-fallen-condition-named | tests/forms.test.ts · tests/claimops.test.ts · tests/reopen.test.ts · tests/drift.test.ts · tests/suspect.test.ts · tests/stamp.test.ts · tests/reads.test.ts |
| [[tsp-close-and-land]] | test | req-close-refuses-loose-ends · req-close-serves-its-findings · req-close-leaves-trunk-clean · req-land-is-one-piece · req-land-demands-fresh-green · req-reject-names-the-redo · req-diverged-trees-reported-never-merged · req-trees-never-mix | tests/editsafety.test.ts · tests/gitlane.test.ts · tests/worktree.test.ts |
| [[tsp-decision-machinery]] | test | req-two-options-beyond-the-obvious · req-option-carries-cost-and-shed · req-choice-records-case-against-losers · req-choosing-none-is-legal · req-single-option-recorded-as-finding · req-problem-recorded-before-options · req-ideation-opens-no-record | tests/pugh.test.ts · tests/pareto.test.ts · tests/compare.test.ts · tests/morphbox.test.ts · tests/catalogs.test.ts · tests/ideation.test.ts |
| [[tsp-derivation-analysis]] | analysis | req-trace-view-derived-from-files · req-reachable-capability-is-traced | none — the model below is the definition; the recorded analysis is the evidence |
| [[tsp-desk-and-gates]] | demonstration | req-desk-greets-walkable · req-desk-takes-plain-words · req-desk-states-the-folder-rule · req-small-fix-joins-open-record · req-retro-asks-real-use · req-gate-rounds-stay-readable · req-gate-shows-the-evidence-form · req-overhaul-opens-without-deliverable | none — the procedure below is the definition; the observed sessions are the evidence |
| [[tsp-engine-lifecycle]] | test | req-crash-lands-safe · req-reload-restarts-clean · req-call-answers-in-one-second · req-mirror-stays-on-the-machine · req-engine-port-fallback | tests/ticks.test.ts · tests/lifetime.test.ts · tests/ptyend.test.ts · tests/stophook.test.ts · tests/mcp-http.test.ts · tests/latency.test.ts |
| [[tsp-first-run]] | demonstration | req-newcomer-one-command · req-newcomer-orients-unaided · req-newcomer-leaves-able-to-ask · req-one-script-installs · req-second-product-reuses-install · req-setup-serves-shipped-method · req-begin-says-own-window · req-fresh-machine-runs · req-boot-stands-agentless | none — the procedure below is the definition; the observed run is the evidence |
| [[tsp-lane-file-safety]] | test | req-no-agent-act-destroys-work · req-every-artifact-is-readable-text · req-repo-search-carries-intent | tests/files.test.ts · tests/patchguard.test.ts · tests/search.test.ts · tests/roots.test.ts · tests/gitlane.test.ts |
| [[tsp-notes-inbox]] | test | req-stray-captured-in-one-call · req-capture-moves-nothing · req-idea-lands-as-note · req-duplicate-stray-still-captured · req-open-notes-stay-visible · req-drained-note-leaves-count · req-drain-one-home-with-payload · req-parked-note-re-drains · req-unknown-drain-ref-refused · req-retro-window-drains-whole · req-kickoff-refuses-pending-notes | tests/feed.test.ts · tests/retro.test.ts · tests/surveywindow.test.ts |
| [[tsp-overhaul-sweep]] | test | req-overhaul-closes-green · req-overhaul-takes-only-unowned-drift · req-sweep-covers-every-drift-class · req-clean-sweep-is-dated | tests/overhaul.test.ts |
| [[tsp-overlay-seam]] | test | req-overlay-resolution · req-overlay-survives-update · req-overlay-drift-reported · req-guidance-edit-lands-where-it-compiles | tests/editsafety.test.ts · tests/drift.test.ts · tests/overlay.test.ts |
| [[tsp-panel-walkthrough]] | demonstration | req-panel-shows-the-machine · req-selected-node-shows-its-claim · req-parallel-iterations-own-worktrees · req-resume-needs-no-person · req-walk-survives-host-swap | none — the procedure below is the definition; the observed sessions are the evidence |
| [[tsp-product-scaffold]] | test | req-begin-touches-nothing-existing · req-fresh-product-starts-empty · req-scaffold-from-template · req-method-reuse-is-vendoring · req-product-is-a-folder · req-engine-folder-is-sealed · req-setup-floor-editor-shell · req-setup-stops-before-partial · req-extension-replaced-reported | tests/help.test.ts · tests/scaffold.test.ts · tests/setup.test.ts |
| [[tsp-prose-inspection]] | inspection | req-entry-speaks-plainly · req-tour-speaks-plainly · req-roles-never-usernames · req-no-claim-without-evidence · req-vendor-page-claim-only · req-comparison-carries-both-sides · req-one-note-per-settled-point · req-desk-offers-a-tour | none — the checklist below is the definition; the inspected artifacts are the evidence |
| [[tsp-reading-loop]] | test | req-reading-proof · req-owed-reading-is-served · req-compaction-reowes-the-reading · req-missing-document-stops-the-walk | tests/reading.test.ts · tests/reads.test.ts · tests/multiread.test.ts · tests/routereads.test.ts · tests/rowreads.test.ts |
| [[tsp-record-inspection]] | inspection | req-purpose-recorded-at-begin · req-record-arrives-prefilled · req-recommendation-is-derived · req-routing-reasoning-recorded · req-losers-stay-on-record · req-divergence-order-on-record · req-finding-keeps-its-sources · req-finding-lands-as-reference · req-finding-names-its-home · req-story-links-its-proving-run · req-upward-links-live-in-the-file · req-test-run-carries-its-question | none — the checklist below is the definition; the inspected records are the evidence |
| [[tsp-record-lifecycle]] | test | req-record-opens-on-word · req-entry-binds-worktree · req-walk-opens-at-retro · req-unshipped-dependency-refused · req-landing-needs-no-close · req-size-choice-is-the-bless · req-size-escalation-readjudicated · req-size-proposal-names-strikes · req-bless-outputs-ride-the-bless · req-blessed-column-compiles-pinned | tests/iterations.test.ts · tests/container.test.ts · tests/worktree.test.ts · tests/drift.test.ts · tests/sizes.test.ts · tests/floor.test.ts |
| [[tsp-test-discipline]] | test | req-test-scope-discipline · req-test-result-is-structured · req-first-green-needs-a-red · req-red-is-never-carried | tests/discipline.test.ts · tests/verdictlog.test.ts · tests/testlint.test.ts |
| [[tsp-tour-resilience]] | test | req-tour-admits-absence · req-tour-outlives-a-missing-highlight | tests/tour.test.ts |
| [[tsp-tour-run]] | demonstration | req-tour-ends-at-the-desk · req-tour-highlights-the-named-part · req-tour-reads-what-stands · req-tour-shows-live-instances | none — the procedure below is the definition; the observed tour is the evidence |
| [[tsp-trace-graph-view]] | test | req-filter-draws-only-what-serves | tests/trace.test.ts · tests/branching.test.ts · tests/sizing.test.ts |
| [[tsp-trace-integrity]] | test | req-broken-trace-is-a-defect · req-coverage-checked-both-ways · req-trace-source-never-mixes | tests/trace-coverage.test.ts · tests/refs.test.ts · tests/traceschema.test.ts · tests/frontmatter.test.ts |
| [[tsp-walk-discipline]] | test | req-autonomy-gates-every-hop · req-autonomy-change-applies-forward · req-controls-never-advance-walk · req-gate-needs-a-persons-verdict · req-pull-answers-from-record · req-walk-resumes-from-repo · req-state-opens-only-when-earned · req-state-needs-all-its-inputs · req-land-target-routes-to-gate · req-instruction-names-its-source | tests/pull.test.ts · tests/pull-offer.test.ts · tests/pull-seam.test.ts · tests/route.test.ts · tests/threshold.test.ts · tests/boot.test.ts · tests/tokens.test.ts · tests/branching.test.ts · tests/feed.test.ts · tests/gitlane.test.ts |

## follow_up

The planned test files land with their builds: ideation, latency (expected RED until the async round), scaffold, setup, overlay, overhaul, tour. The 20 backfilled rows owe their M4 criteria judgments (weighs_against), so derive-criteria greys until the pairs are walked. The test report generates from these specs crossed with the recorded verdicts — design owed.

## anything_else

