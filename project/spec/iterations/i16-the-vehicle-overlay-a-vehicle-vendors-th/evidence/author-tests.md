---
form: author-tests
by: agent
signed_off: 2026-08-18T17:51:33.775Z
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

M7 OPENS, AND THE FIRST STATE FOUND SIX REQUIREMENTS WITH NO CHECK AT ALL.

EIGHTY-TWO SPECS NOW STAND. Seventy-nine were authored by earlier iterations; three were written here, and they are the first checks this iteration's own rows have ever had.

### What was uncovered

EVERY REQUIREMENT i16 MINTED. A search across the whole test-spec folder for the six ids returned zero matches. The design input was written, gated and blessed, and nothing said how any of it would be verified.

THAT IS WHAT TEST-FIRST IS FOR and it did not happen at M3. The spec is meant to be written when the requirement is, before the build. These arrive late rather than never.

### The three specs, grouped by method as the law demands

A spec's method must equal the verify_method of every requirement it names, so the six rows fall into three groups rather than one.

- tsp-a-produced-tree-is-bounded-and-named, method TEST, covering the act that writes only its own tree, the name that is one fact, and where each artifact lands when driving. Three containment rules that fail the same way.
- tsp-a-vehicle-is-made-and-then-drives-something-else, method DEMONSTRATION, covering the two capabilities the owner asked for, end to end, in one sitting.
- tsp-the-engine-keeps-no-record-of-what-it-produced, method INSPECTION, covering the one row that is a negative: after a vehicle is made, nothing anywhere names it.

### The test spec carries the spike's finding forward

THE SPIKE MEASURED THAT tests/roots.test.ts HAS FOUR CASES and none asserts either containment rule. Both are implemented in engine/paths.ts and neither is proved.

SO THE FIRST TWO STEPS OF tsp-a-produced-tree-is-bounded-and-named describe behaviour that already exists, and should pass on the unchanged engine. A red there means the guard was never real, which is the cheapest thing anybody could learn before building on it.

## checks

| test-spec | method | verifies |
| --- | --- | --- |
| [[tsp-a-breached-bound-reaches-a-reviewer]] | test | req-a-breached-bound-is-put-in-front-of-a-reviewer |
| [[tsp-a-control-is-legible]] | test | req-a-refused-act-says-why-and-what-next · req-a-surface-shows-the-state-an-act-produced · req-a-control-that-undoes-on-a-second-press-says-so-first |
| [[tsp-a-decline-is-legible-to-the-person]] | demonstration | none — demonstrates: carries the edge; the three requirements behind this story are verify_method: test and are carried by tsp-a-control-is-legible |
| [[tsp-a-long-wait-is-never-a-guess]] | demonstration | none — demonstrates: carries the edge; req-work-past-its-bound-says-it-is-working is verify_method: test and is carried by tsp-work-past-its-bound-signals |
| [[tsp-a-produced-tree-is-bounded-and-named]] | test | req-an-act-writes-only-the-tree-it-produced · req-the-product-name-is-one-fact · req-where-each-artifact-lands-when-driving |
| [[tsp-a-repeatable-answer-earns-its-trust]] | demonstration | [] |
| [[tsp-a-slow-signal-keeps-the-wait]] | demonstration | req-a-slowness-signal-never-shortens-the-wait |
| [[tsp-a-structured-query-answers-what-a-decision-touches]] | demonstration | none — demonstrates: carries the edge; the evaluator's own mechanics are test-verified by tsp-query-answers over tests/query.test.ts |
| [[tsp-a-vehicle-is-made-and-then-drives-something-else]] | demonstration | req-one-command-produces-a-complete-copy · req-the-system-runs-in-a-tree-that-is-not-its-own |
| [[tsp-an-amend-leaves-the-tree-standing]] | test | req-an-amend-leaves-the-tree-standing |
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
| [[tsp-carry-a-finding]] | demonstration | [] |
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
| [[tsp-the-graph-answers-what-a-change-touches]] | demonstration | [] |
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

## follow_up

IMMEDIATELY: specify-build, then observe-red, which is where the two guard cases must go red before anything is written.

### The order the specs imply

THE FIRST TWO STEPS OF tsp-a-produced-tree-is-bounded-and-named DESCRIBE BEHAVIOUR THAT ALREADY EXISTS. resolveInRoot refuses a root-ref; resolveDeclaredRoot refuses a climb-out. Writing them first answers a question nobody has asked in the engine's whole life, and it is the cheapest question available.

THEY SHOULD PASS ON THE UNCHANGED ENGINE, which makes them a strange red to observe. observe-red wants a red before a green, and these two are green from the start because they are characterising a guard rather than driving a change. The state's own script will rule on that; naming it here means nobody is surprised.

THE THIRD AND FOURTH STEPS ARE GENUINELY RED. A writable declared target does not exist, and a declared target that is the engine's own tree is not refused because nothing can be declared writable yet.

### What the demonstration spec needs that does not exist

A VEHICLE, AND A MACHINE WITH NOTHING OF THE ENGINE ON IT. tsp-a-vehicle-is-made-and-then-drives-something-else cannot run until the producers are built, and its step four wants a second machine.

THAT IS NOT A REASON TO WEAKEN IT. A demonstration that runs on the machine that produced the vehicle proves less than the row asks, and saying so now is cheaper than discovering it at validation.

### One thing the inspection spec admits about itself

AN ABSENCE HAS NO GUARD. tsp-the-engine-keeps-no-record-of-what-it-produced is re-run per producing act rather than signed once, because nothing stops a later change reintroducing a record. Inspection is the cheapest method that would catch it, and it is genuinely weaker than a test.

### Parked, each with what makes it ready

- THE TWO GUARD CASES THEMSELVES, which are the first thing specify-build should schedule.
- THE REOPEN QUESTION, note-beac84587cd9, still the owner's and still not blocking.
- THE RETIRED WORKTREE SWEEP, note-7432b8a852f6, its own iteration on the owner's word.
- THE SCOPED RUN handed off as job test-msyun0bj-2, whose verdict records itself.
- THE CONFIRM RUN on the retro's window fix, owed at verification since this morning.

## anything_else

