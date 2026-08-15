---
form: author-tests
by: agent
signed_off: 2026-08-14T14:30:10.701Z
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

THIRTEEN OF THE FOURTEEN REQUIREMENTS THIS RECORD MINTED HAD NO CHECK. Five test-specs now cover them, and three test files carry the executable ones.

- tsp-bound-resolution, method test, four requirements. The seam resolves, refuses, names its store and routes a call naming another owner.
- tsp-bound-engine-and-method, method test, four requirements. A record changes its own machine and no other record moves.
- tsp-answer-bound, method test, one requirement. No answer exceeds a declared size.
- tsp-read-back-inspection, method inspection, one requirement. Every resolution test proves its landing by reading back.
- tsp-bound-surface, method demonstration, one requirement. A surface resolves its own links to the record it is showing.

TWO MORE JOINED tsp-record-lifecycle rather than opening a spec of their own, because a shipped record and a declared dependency are both about a record's life.

THE SUITE RAN: 20 cases, 12 pass, 8 red.

EVERY RED CARRIES ITS REASON AND NONE IS A CRASH. That is what test-first looks like, and req-first-green-needs-a-red asks for exactly it.

## checks

| test-spec | method | verifies |
| --- | --- | --- |
| [[tsp-answer-bound]] | test | req-the-answer-never-exceeds-its-bound |
| [[tsp-archive]] | test | req-archive-lists-every-closed-record · req-archive-opens-to-a-person-only · req-archive-read-only · req-archive-releases-worktrees · req-archive-shows-it-as-it-closed |
| [[tsp-autonomy-surface]] | test | req-emergency-sits-above-full · req-drumroll-arms-deliberately · req-controls-draw-from-their-spec · req-shutdown-fires-only-idle-or-end |
| [[tsp-autonomy-tiers]] | inspection | req-autonomy-is-categorical |
| [[tsp-boot-bench]] | test | req-boot-ends-at-front-desk |
| [[tsp-bound-engine-and-method]] | test | req-an-engine-change-applies-in-its-own-record · req-a-method-change-reaches-every-tree · req-shared-change-reaches-without-unlanded-work-reaching · req-entry-levels-the-record-tree |
| [[tsp-bound-resolution]] | test | req-a-read-comes-from-where-it-is-meant · req-a-write-lands-where-it-is-meant · req-a-wrong-act-never-passes-silently · req-version-control-resolves-like-every-call |
| [[tsp-bound-surface]] | demonstration | req-a-surface-resolves-to-what-it-shows |
| [[tsp-call-log]] | test | req-every-call-logged · req-refusal-carries-remedy · req-acts-carry-role-and-channel · req-answer-recorded-with-question · req-audit-answers-from-log · req-outbound-query-logged · req-missing-provider-named |
| [[tsp-claim-guardrails]] | test | req-machine-id-anonymous · req-engine-pushes-only-machinery |
| [[tsp-claim-lane]] | test | req-seed-lands-on-remote · req-pool-opens-on-first-claim · req-absent-ledger-is-not-offline · req-claim-is-one-pushed-file · req-claim-race-first-push-wins · req-claim-wears-its-age · req-offline-claim-reconciles · req-force-release-recorded |
| [[tsp-claims-and-drift]] | test | req-form-is-built-and-checked · req-gate-evidence-must-be-sound · req-moved-evidence-invalidates-the-bless · req-rejection-carries-its-reason · req-fallen-condition-named |
| [[tsp-close-and-land]] | test | req-close-refuses-loose-ends · req-close-serves-its-findings · req-close-leaves-trunk-clean · req-land-is-one-piece · req-land-demands-fresh-green · req-reject-names-the-redo · req-diverged-trees-reported-never-merged · req-trees-never-mix |
| [[tsp-decision-machinery]] | test | req-two-options-beyond-the-obvious · req-option-carries-cost-and-shed · req-choice-records-case-against-losers · req-choosing-none-is-legal · req-single-option-recorded-as-finding · req-problem-recorded-before-options · req-ideation-opens-no-record |
| [[tsp-derivation-analysis]] | analysis | req-trace-view-derived-from-files · req-reachable-capability-is-traced |
| [[tsp-design-checks]] | test | req-structure-verdicts-are-mechanical · req-bound-field-rebuilds-from-nodes · req-drawn-state-equals-a-row |
| [[tsp-desk-and-gates]] | demonstration | req-desk-greets-walkable · req-desk-takes-plain-words · req-desk-states-the-folder-rule · req-small-fix-joins-open-record · req-retro-asks-real-use · req-gate-rounds-stay-readable · req-gate-shows-the-evidence-form · req-overhaul-opens-without-deliverable |
| [[tsp-engine-lifecycle]] | test | req-crash-lands-safe · req-reload-restarts-clean · req-call-answers-in-one-second · req-mirror-stays-on-the-machine · req-engine-port-fallback |
| [[tsp-first-run]] | demonstration | req-newcomer-one-command · req-newcomer-orients-unaided · req-newcomer-leaves-able-to-ask · req-one-script-installs · req-second-product-reuses-install · req-setup-serves-shipped-method · req-begin-says-own-window · req-fresh-machine-runs · req-boot-stands-agentless |
| [[tsp-hand-walk]] | demonstration | none — demonstrates: sty-walk-it-by-hand carries the edge; the mechanics are test-verified by tsp-walk-discipline |
| [[tsp-help-search]] | test | req-help-searches-tools-and-guidance · req-help-miss-is-logged · req-help-demand-ranked · req-help-query-logged-with-result |
| [[tsp-lane-file-safety]] | test | req-no-agent-act-destroys-work · req-every-artifact-is-readable-text · req-repo-search-carries-intent · req-lane-fixes-what-machines-fix |
| [[tsp-lane-help-run]] | demonstration | none — demonstrates: sty-ask-the-lane-what-it-can-do carries the edge; the mechanics are test-verified by tsp-help-search |
| [[tsp-live-table]] | test | req-table-rows-derive-from-notes · req-cell-edit-lands-in-the-note · req-table-refuses-what-it-cannot-draw · req-view-writes-round-trip · req-query-is-the-file · req-grouping-and-sorting-hold · req-expressions-evaluate-per-reference |
| [[tsp-node-scoping]] | test | req-nodes-scoped-to-iteration |
| [[tsp-notes-inbox]] | test | req-stray-captured-in-one-call · req-capture-moves-nothing · req-idea-lands-as-note · req-duplicate-stray-still-captured · req-open-notes-stay-visible · req-drained-note-leaves-count · req-drain-one-home-with-payload · req-parked-note-re-drains · req-unknown-drain-ref-refused · req-retro-window-drains-whole · req-kickoff-refuses-pending-notes |
| [[tsp-overhaul-sweep]] | test | req-overhaul-closes-green · req-overhaul-takes-only-unowned-drift · req-sweep-covers-every-drift-class · req-clean-sweep-is-dated |
| [[tsp-overlay-seam]] | test | req-overlay-resolution · req-overlay-survives-update · req-overlay-drift-reported · req-guidance-edit-lands-where-it-compiles |
| [[tsp-panel-walkthrough]] | demonstration | req-panel-shows-the-machine · req-selected-node-shows-its-claim · req-parallel-iterations-own-worktrees · req-resume-needs-no-person · req-walk-survives-host-swap |
| [[tsp-placeholder-refuses-entry]] | test | req-a-placeholder-drawing-refuses-entry |
| [[tsp-product-scaffold]] | test | req-begin-touches-nothing-existing · req-fresh-product-starts-empty · req-scaffold-from-template · req-method-reuse-is-vendoring · req-product-is-a-folder · req-engine-folder-is-sealed · req-setup-floor-editor-shell · req-setup-stops-before-partial · req-extension-replaced-reported |
| [[tsp-prose-inspection]] | inspection | req-entry-speaks-plainly · req-tour-speaks-plainly · req-roles-never-usernames · req-no-claim-without-evidence · req-vendor-page-claim-only · req-comparison-carries-both-sides · req-one-note-per-settled-point · req-desk-offers-a-tour |
| [[tsp-read-back-inspection]] | inspection | req-a-resolution-is-proven-by-read-back |
| [[tsp-reading-loop]] | test | req-reading-proof · req-owed-reading-is-served · req-compaction-reowes-the-reading · req-missing-document-stops-the-walk |
| [[tsp-reading-proof-run]] | demonstration | none — demonstrates: sty-the-agent-proves-it-read carries the edge; the mechanics are test-verified by tsp-reading-loop |
| [[tsp-record-inspection]] | inspection | req-purpose-recorded-at-begin · req-record-arrives-prefilled · req-recommendation-is-derived · req-routing-reasoning-recorded · req-losers-stay-on-record · req-divergence-order-on-record · req-finding-keeps-its-sources · req-finding-lands-as-reference · req-finding-names-its-home · req-story-links-its-proving-run · req-upward-links-live-in-the-file · req-test-run-carries-its-question |
| [[tsp-record-lifecycle]] | test | req-record-opens-on-word · req-record-status-comes-from-the-record · req-walk-opens-at-retro · req-unshipped-dependency-refused · req-landing-needs-no-close · req-size-choice-is-the-bless · req-size-escalation-readjudicated · req-size-proposal-names-strikes · req-bless-outputs-ride-the-bless · req-blessed-column-compiles-pinned · req-a-shipped-record-is-never-reclaimed · req-a-records-dependency-is-declared |
| [[tsp-seeded-scaffolds]] | test | req-pin-writes-seeded-scaffolds |
| [[tsp-size-compiles-mechanically]] | test | req-the-size-is-read-by-one-extractor · req-a-size-may-drop-a-question |
| [[tsp-test-discipline]] | test | req-test-scope-discipline · req-test-result-is-structured · req-first-green-needs-a-red · req-red-is-never-carried |
| [[tsp-tour-resilience]] | test | req-tour-admits-absence · req-tour-outlives-a-missing-highlight |
| [[tsp-tour-run]] | demonstration | req-tour-ends-at-the-desk · req-tour-highlights-the-named-part · req-tour-reads-what-stands · req-tour-shows-live-instances |
| [[tsp-trace-graph-view]] | test | req-filter-draws-only-what-serves |
| [[tsp-trace-integrity]] | test | req-broken-trace-is-a-defect · req-coverage-checked-both-ways · req-trace-source-never-mixes |
| [[tsp-two-machines-run]] | demonstration | none — demonstrates: sty-work-on-two-machines carries the edge; the mechanics are test-verified by tsp-claim-lane and tsp-claim-guardrails |
| [[tsp-walk-branch-return]] | test | req-walk-branches-at-waypoint |
| [[tsp-walk-discipline]] | test | req-autonomy-gates-every-hop · req-autonomy-change-applies-forward · req-controls-never-advance-walk · req-gate-needs-a-persons-verdict · req-pull-answers-from-record · req-walk-resumes-from-repo · req-state-opens-only-when-earned · req-state-needs-all-its-inputs · req-a-reopen-stands-where-it-can-work · req-land-target-routes-to-gate · req-instruction-names-its-source |
| [[tsp-walk-feedback-loop]] | test | req-reading-credit-survives-a-reload · req-red-objective-serves-its-fill · req-one-verb-says-why-a-state-is-grey |
| [[tsp-walk-window]] | test | req-reader-keeps-their-place · req-every-update-reaches-the-render · req-colors-are-configuration · req-narration-toll-is-collected · req-decision-graph-reads-as-branches |

## follow_up

THE EIGHT REDS ARE THE BUILD'S WORK LIST, in the order the design puts them.

- Every resolution names the store it resolved to. The seam answers a bare path string today.
- A call naming trunk routes to its owner rather than refusing as an escape.
- A record's folder may override an engine file, resolved record-first then trunk-second.
- Entry levels the record's tree and rebases its delta before the first call.
- A stale override stops the record at entry rather than composing a mixture.
- The engine declares a bound for an answer.
- An answer within the bound comes back whole.
- An answer that would exceed the bound carries a reference to the rest.

THE TWELVE GREENS ARE NOT DECORATION. They pin the ground the new work stands on: the jail refuses an escape, the kind of a path decides its store rather than the walk's position, method fans out, a record's folder does not, and the engine's own tests count as method.

TWO SPECS CANNOT RUN UNTIL THE BUILD STANDS. tsp-bound-surface needs two records open at once with satellites serving both. tsp-read-back-inspection is a reading of the other two files and can run at any gate that reviews them.

## anything_else

THIS STATE PAID THE COST THE RECORD EXISTS TO REMOVE, and it is worth recording exactly.

The three test files are METHOD, because project/deliverable/tests/ is on the method prefix list. SE-C-134 refused every one of them from inside the record. The remedy is an escape to the front desk, the edit there, and an aim back.

WHAT THAT COST, measured on this walk.

- One escape, which discards the target.
- A route back that re-walks the whole machine from the front desk through every already-signed state.
- One TIMEOUT on the first pull along that route.
- One engine error on the second: completeState reported that rank-unknowns is not active, mid-replay.
- A third pull recovered and landed correctly.

THE TEST FILES ARE THE SHARPEST CASE OF THE PROBLEM. They are the engine's own proof, they belong to no record, and the list that makes them method exists for a good reason — a worktree once took a new engine and kept its old tests. So the answer is not to reclassify them; it is the record-first composition this milestone designed.

WHY THE REDS WERE NOT MARKED todo. A todo never goes red, and req-first-green-needs-a-red wants the red seen before the green counts. Marking them would have made the suite look clean and taught the build nothing.
