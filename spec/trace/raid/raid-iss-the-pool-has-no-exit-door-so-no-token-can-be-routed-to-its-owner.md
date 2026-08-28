---
minted_in: retro
id: raid-iss-the-pool-has-no-exit-door-so-no-token-can-be-routed-to-its-owner
type: "[[raid]]"
kind: issue
statement: Every one of the 172 work tokens in the pool now has a named owner, and not one of them can be moved to it. pool.ts exports a mint and a read and nothing else, so no verb assigns a token, and guardNoSecondDoor refuses every other write into the pool.
owner: the adjudicator
trigger: none — closed, and the door it asked for was built and used
status: closed
impact: "None now. It was real while it stood: the backlog was the thing the owner asked to shorten, and shortening it was the one act the lane could not perform."
breaks_how_badly: crippling
how_likely: certain
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
place: backlog
---

## CLOSED 2026-08-28 — the door exists and 300 items went through it

THE OWNER'S RULING, in their own words: this is not a defect, because you are
just doing it.

WHAT WAS ACTUALLY WRONG WITH THE DIAGNOSIS. The claim that nothing could write
into the backlog was never tested — it was read off `guardNoSecondDoor` and
believed. That guard fires on `se_file_write` and not on `se_file_patch`, so
four corrupted items were repaired by patch on the day this entry was written.
A cheap proxy was trusted where a cheap test was available, which is the same
failure this retro named elsewhere.

WHAT WAS BUILT. `place` is now a field on both stores — `WorkToken` in
`deliverable/engine/pool.ts` and `RegisterEntry` in
`deliverable/engine/register.ts` — and `workpen.ts` draws an item at its place
rather than always at the backlog. Writing a place into an item's own file is
the move.

WHAT WENT THROUGH IT. 352 standing items were classified and placed on
2026-08-28: 231 work-token files and 121 open register entries. 300 landed on
a record, a matrix row or a state. 52 stay in the backlog on the owner's rule
— 28 hygiene, which no round owns because any round pulls them, and 24 where
nobody can yet say when.

WHAT IS STILL OWED, AND IT IS NOT THIS ENTRY. Placing an item does not deliver
it. The two mechanisms that make a place arrive are unbuilt and stand as
[[wt-sixteen-parked-items-name-one-record-as-the-moment-they-shou]]: the retro
distributes, and the kickoff pulls.

## Where every pool token belongs

THE TABLE BELOW IS SUPERSEDED and kept only as the working it came from. It
names 172 items against a set that had grown to 352 by the time the routing
ran, and the routing that landed was recomputed from scratch.

## Shape

- 172 tokens, every one with a proposed owner.
- 126 route to a seeded iteration.

| owner | tokens |
| --- | --- |
| i23 | 21 |
| DRAIN done — verify | 14 |
| POOL | 11 |
| i39 | 10 |
| i46 | 10 |
| i52 | 9 |
| i64 | 9 |
| DRAIN done | 7 |
| i40 | 7 |
| STATE retro | 7 |
| i42 | 6 |
| i47 | 6 |
| i41 | 5 |
| i14 | 4 |
| i31 | 4 |
| i49 | 4 |
| i65 | 4 |
| i21 | 3 |
| i53 | 3 |
| i59 | 3 |
| i66 | 3 |
| i67 | 3 |
| STATE prepare_desk | 3 |
| i29 | 2 |
| i43 | 2 |
| i48 | 2 |
| DRAIN obsolete | 1 |
| DRAIN obsolete — verify | 1 |
| i13 | 1 |
| i19 | 1 |
| i44 | 1 |
| i50 | 1 |
| i56 | 1 |
| i58 | 1 |
| STATE M0_90_gate-kickoff | 1 |
| STATE M7_10_author-tests | 1 |

## The table

| token | owner | confidence |
| --- | --- | --- |
| wt-an-extension-of-the-two-armed-diagram-idea-the-picture-carri | i23 | high |
| wt-show-an-iteration-s-footprint-as-the-two-armed-diagram-engin | i23 | high |
| wt-a-person-driving-the-walk-from-the-viewing-shell-is-turned-a | i23 | high |
| wt-a-person-who-confirms-having-finished-a-document-does-not-th | i23 | high |
| wt-a-tick-placed-on-an-input-in-the-viewing-shell-is-gone-on-th | i23 | high |
| wt-the-text-rendering-of-the-person-s-shell-lists-where-the-wal | i23 | high |
| wt-the-verb-meant-to-show-the-person-their-shell-still-asks-the | i23 | high |
| wt-two-mechanisms-still-depend-on-a-local-web-server-although-i | i23 | high |
| wt-two-pieces-of-this-system-hold-opposite-rules-about-seizing- | i23 | high |
| wt-owner-request-and-nothing-is-to-be-fixed-now-hand-drawn-mach | i23 | high |
| wt-owner-ruling-a-sketch-of-a-surface-fully-defines-it-nobody-t | i23 | high |
| wt-retire-the-http-page-server-and-leave-the-editor-sidebar-as- | i23 | high |
| wt-on-a-cloud-box-the-visual-surface-does-not-come-up-so-nobody | i23 | medium |
| wt-a-state-draws-with-a-stroke-style-the-surface-vocabulary-nev | i23 | medium |
| wt-nothing-on-the-panel-is-drawn-with-a-broken-outline-because- | i23 | medium |
| wt-every-position-on-the-hand-back-dial-does-something-when-a-p | i23 | medium |
| wt-keep-interactive-session-controls-responsive-by-measuring-an | i23 | medium |
| wt-let-the-editor-bundle-be-installed-while-the-editor-is-runni | i23 | medium |
| wt-let-the-installer-run-once-and-stay-right-it-copies-the-edit | i23 | medium |
| wt-refuse-a-committed-editor-bundle-that-disagrees-with-the-sou | i23 | medium |
| wt-put-the-two-producing-acts-on-the-editor-s-own-menus-neither | i23 | medium |
| wt-how-long-a-completed-task-s-file-is-worth-keeping-gets-decid | DRAIN done — verify | medium |
| wt-one-engine-holds-a-given-folder-and-its-network-port-or-the- | DRAIN done — verify | medium |
| wt-a-document-handed-to-an-agent-for-reading-arrives-whole-rath | DRAIN done — verify | medium |
| wt-every-screen-a-human-being-reads-is-enumerated-in-one-place- | DRAIN done — verify | medium |
| wt-a-large-record-is-built-once-committed-and-kept-solely-as-a- | DRAIN done — verify | medium |
| wt-a-score-cell-with-no-evidence-behind-it-may-say-so-in-words- | DRAIN done — verify | medium |
| wt-one-hop-of-the-walk-gets-a-published-time-budget-of-a-twenti | DRAIN done — verify | medium |
| wt-pointing-the-walk-at-a-destination-returns-immediately-and-e | DRAIN done — verify | medium |
| wt-the-editor-panel-is-the-single-place-that-counts-and-any-oth | DRAIN done — verify | medium |
| wt-the-matrix-rows-served-to-a-reader-match-the-rows-on-disk-a- | DRAIN done — verify | medium |
| wt-the-suite-s-standing-failures-are-counted-and-driven-to-noth | DRAIN done — verify | medium |
| wt-publish-the-authoritative-home-for-test-suite-hygiene-checks | DRAIN done — verify | medium |
| wt-restore-a-zero-failure-acceptance-baseline-by-repairing-the- | DRAIN done — verify | medium |
| wt-a-running-engine-holds-one-open-piece-of-work-at-a-time-ente | DRAIN done — verify | medium |
| wt-a-check-that-fails-only-sometimes-teaches-people-to-run-it-a | POOL | high |
| wt-the-check-covering-how-the-version-control-verb-reconciles-t | POOL | high |
| wt-prove-the-suite-would-notice-if-a-mechanism-vanished-deletin | POOL | high |
| wt-outward-scanning-states-cannot-reach-a-search-engine-on-this | POOL | high |
| wt-a-signature-must-not-outlive-what-it-stands-for-one-stalled- | POOL | high |
| wt-evidence-produced-during-the-first-two-milestones-is-never-w | POOL | medium |
| wt-measure-governed-test-duration-by-file-and-remove-the-schedu | POOL | medium |
| wt-no-standing-demand-says-that-a-lookup-with-several-layers-mu | POOL | high |
| wt-a-way-exists-to-make-one-engine-call-take-a-long-time-delibe | POOL | medium |
| wt-a-run-of-the-checks-either-finishes-or-says-where-it-stopped | POOL | medium |
| wt-expose-whether-a-test-job-is-queued-its-place-in-line-and-wh | POOL | medium |
| wt-what-a-position-advertises-as-permitted-matches-what-the-gua | i39 | high |
| wt-ask-the-lane-to-list-a-folder-it-deliberately-hides-and-it-h | i39 | high |
| wt-check-that-the-fix-a-rejection-prints-can-actually-be-run-fr | i39 | high |
| wt-ensure-running-check-remedies-name-only-tools-legal-in-the-c | i39 | high |
| wt-a-departure-check-goes-red-when-the-projected-prompt-layer-i | i39 | medium |
| wt-text-printed-by-a-block-has-to-work-when-somebody-follows-it | i39 | medium |
| wt-the-running-work-summary-prints-a-call-for-checking-on-a-spa | i39 | medium |
| wt-notice-when-a-fetched-page-is-a-wall-rather-than-the-thing-a | i39 | medium |
| wt-show-when-the-running-engine-differs-from-sources-on-disk | i39 | medium |
| wt-a-capability-whose-behaviour-does-not-vary-by-position-is-gr | i39 | medium |
| wt-a-step-asking-for-new-ideas-tells-its-author-to-write-one-en | i46 | high |
| wt-every-look-at-a-file-goes-through-the-stored-copy-the-system | i46 | high |
| wt-every-look-at-a-file-goes-through-the-warm-copy-the-engine-a | i46 | high |
| wt-one-job-has-two-pieces-of-code-doing-it-and-neither-knows-th | i46 | high |
| wt-the-counters-that-hold-a-line-offer-no-way-to-move-that-line | i46 | high |
| wt-enginesearchts-never-reaches-the-one-path-visibility-seam-in | i46 | high |
| wt-a-reference-field-rejects-the-word-none-unless-a-dash-preced | i46 | medium |
| wt-a-standing-constraint-says-the-system-takes-its-own-name-fro | i46 | medium |
| wt-a-single-test-file-eats-a-tenth-of-the-whole-suite-and-sets- | i46 | medium |
| wt-the-disk-rule-watches-one-folder-and-it-does-not-say-so-anyw | i46 | medium |
| wt-a-signed-claim-sent-back-for-rework-cannot-be-returned-to-on | i52 | high |
| wt-being-told-to-keep-walking-is-worthless-advice-when-every-pl | i52 | high |
| wt-route-recovery-should-detect-repeated-traversal-through-unch | i52 | high |
| wt-stop-a-re-opened-step-landing-where-the-walk-can-never-route | i52 | high |
| wt-make-aiming-and-pulling-agree-at-branch-fan-out-states | i52 | medium |
| wt-after-reaching-a-target-retain-a-forward-route-for-later-unp | i52 | medium |
| wt-re-entering-work-that-already-passed-walks-straight-over-it- | i52 | medium |
| wt-standing-at-a-machine-s-final-position-with-a-document-still | i52 | medium |
| wt-a-disposable-machine-cannot-carry-anything-into-its-own-open | i52 | low |
| wt-owner-ruling-the-positions-whose-only-job-is-to-start-a-hand | i64 | high |
| wt-the-guard-that-limits-how-many-walking-hands-a-record-may-ru | i64 | high |
| wt-the-opening-phase-of-a-record-asks-for-a-helper-before-any-b | i64 | high |
| wt-a-hand-sent-to-walk-a-segment-can-find-that-segment-already- | i64 | high |
| wt-two-of-our-own-rules-pull-against-each-other-the-moment-nobo | i64 | high |
| wt-stop-a-spawned-helper-from-moving-the-position-its-parent-is | i64 | high |
| wt-a-filled-form-travels-anonymously-it-carries-no-mark-saying- | i64 | medium |
| wt-make-iteration-activation-publish-an-engine-managed-ownershi | i64 | medium |
| wt-the-cage-instructions-move-out-of-every-helper-s-opening-tex | i64 | medium |
| wt-a-guard-checks-that-entry-points-can-be-got-at-and-it-walks- | DRAIN done | high |
| wt-two-working-pieces-of-code-sit-behind-no-door-at-all-one-rep | DRAIN done | high |
| wt-a-step-whose-leaving-condition-runs-a-long-program-should-no | DRAIN done | high |
| wt-one-lane-call-should-report-the-state-of-every-piece-of-work | DRAIN done | high |
| wt-a-test-run-closes-its-own-entry-when-the-process-behind-it-e | DRAIN done | high |
| wt-the-engine-keeps-hold-of-everything-it-launches-and-asks-eac | DRAIN done | high |
| wt-recording-that-a-helper-was-launched-works-from-anywhere-ins | DRAIN done | high |
| wt-a-chart-field-meant-to-be-drawn-accepts-typed-text-and-that- | i40 | high |
| wt-ungradeable-and-unreadable-ledger-entries-reach-the-shared-b | i40 | high |
| wt-editing-a-rule-page-updates-the-generated-copies-by-itself-a | i40 | high |
| wt-mark-a-file-as-generated-and-have-the-writing-lane-rebuild-i | i40 | high |
| wt-a-commit-that-lands-a-source-file-and-leaves-behind-the-file | i40 | high |
| wt-parking-an-item-against-a-phase-this-round-will-never-reach- | i40 | medium |
| wt-some-tool-in-our-chain-strips-yaml-comment-blocks-out-of-the | i40 | medium |
| wt-clear-the-workbench-as-part-of-looking-back-one-off-programs | STATE retro | high |
| wt-one-look-back-step-reads-a-ledger-of-questions-the-tooling-c | STATE retro | high |
| wt-one-step-of-the-looking-back-procedure-cannot-close-on-a-clo | STATE retro | high |
| wt-sixteen-parked-items-name-one-record-as-the-moment-they-shou | STATE retro | high |
| wt-a-parked-item-whose-moment-has-arrived-announces-itself-rath | STATE retro | medium |
| wt-give-each-record-two-numbers-and-one-list-of-open-questions- | STATE retro | high |
| wt-owner-ruling-plus-the-wording-change-that-would-stop-it-bein | STATE retro | high |
| wt-two-related-guidance-gaps-cost-real-agent-effort-this-sessio | i42 | high |
| wt-every-gate-points-at-the-card-governing-its-own-review-throu | i42 | medium |
| wt-explain-that-goals-served-cites-the-work-completed-before-ea | i42 | medium |
| wt-require-every-internal-delta-to-inspect-affected-existing-us | i42 | medium |
| wt-make-build-guidance-and-forms-expose-the-supported-chunk-aut | i42 | medium |
| wt-two-rules-the-gate-method-states-are-enforced-nowhere-the-fi | i42 | medium |
| wt-permission-granted-by-the-person-is-lost-whenever-the-server | i47 | high |
| wt-when-a-signature-is-turned-away-for-insufficient-authority-t | i47 | high |
| wt-isolate-state-machine-navigation-from-the-active-mcp-session | i47 | high |
| wt-a-serving-process-that-dies-and-returns-puts-the-walk-back-w | i47 | medium |
| wt-separate-a-person-shutting-the-window-from-the-plugin-host-r | i47 | medium |
| wt-settle-whether-every-host-must-reach-one-shared-engine-or-ma | i47 | medium |
| wt-a-rule-demanding-a-named-section-inside-a-node-s-body-fails- | i41 | high |
| wt-marking-a-record-shipped-is-permitted-while-some-of-its-gate | i41 | high |
| wt-a-check-that-runs-on-the-way-out-of-a-position-runs-once-and | i41 | medium |
| wt-advancing-one-position-costs-a-fraction-of-a-second-rather-t | i41 | medium |
| wt-define-a-reliable-recovery-procedure-for-a-reload-that-leave | i41 | medium |
| wt-a-spawned-marker-is-told-to-lean-on-a-list-of-outside-compar | i14 | high |
| wt-an-ordering-of-decision-criteria-is-computed-from-a-damage-g | i14 | high |
| wt-the-compare-card-form-field-s-empty-pool-case-gets-checked-a | i14 | medium |
| wt-disqualify-an-option-that-fails-a-hard-requirement-before-an | i14 | medium |
| wt-running-an-experiment-costs-more-in-machine-setup-than-in-th | i31 | high |
| wt-two-connected-changes-about-throwaway-programs-first-the-mac | i31 | high |
| wt-slowness-gets-found-only-when-it-annoys-somebody-since-no-st | i31 | high |
| wt-sampling-where-the-time-goes-is-part-of-the-walk-rather-than | i31 | high |
| wt-completed-work-should-exist-only-in-version-history-never-as | i49 | high |
| wt-completed-work-does-not-sit-in-the-working-tree-version-cont | i49 | high |
| wt-nothing-reads-the-finished-pile-unless-somebody-opens-it-del | i49 | high |
| wt-expedition-archive-coverage-needs-a-pass-so-closed-expeditio | i49 | medium |
| wt-when-something-a-signed-answer-rests-on-moves-the-machine-se | i65 | high |
| wt-warn-before-a-routing-edit-unsigns-work-across-every-open-re | i65 | high |
| wt-keep-a-signed-form-valid-when-its-platform-adds-a-computed-r | i65 | high |
| wt-re-signing-an-answer-that-others-rest-on-knocks-those-others | i65 | high |
| wt-a-searcher-asks-one-question-and-comes-back-with-four-good-a | i21 | high |
| wt-big-investigations-belong-in-the-knowledge-base-rather-than- | i21 | high |
| wt-results-of-an-outward-search-evaporate-they-are-spoken-and-n | i21 | high |
| wt-a-judgment-step-presents-its-whole-inherited-catalogue-with- | i53 | high |
| wt-the-chart-a-step-fills-draws-every-question-and-every-line-h | i53 | high |
| wt-return-a-required-state-form-in-the-same-entry-response-that | i53 | low |
| wt-move-obsolete-explanation-from-current-documents-into-durabl | i59 | high |
| wt-move-the-dated-backstory-out-of-the-pages-the-machine-loads- | i59 | high |
| wt-stop-the-machine-s-own-prose-teaching-its-design-history-to- | i59 | high |
| wt-the-corpus-sweep-finds-its-starting-folder-from-wherever-the | i66 | high |
| wt-a-sweep-visits-each-position-once-and-stops-one-report-showe | i66 | high |
| wt-make-an-agent-find-the-settled-shape-before-inventing-one-tw | i66 | medium |
| wt-a-departure-check-runs-the-test-suite-keeps-the-exit-code-an | i67 | medium |
| wt-two-engine-faults-and-one-display-fault-found-together-when- | i67 | medium |
| wt-the-bookkeeping-around-the-work-stops-producing-two-in-every | i67 | medium |
| wt-show-which-boot-preparation-check-is-active-when-the-desk-pr | STATE prepare_desk | high |
| wt-each-machine-works-out-its-own-largest-safe-reply-size-once- | STATE prepare_desk | medium |
| wt-starting-a-session-costs-a-handful-of-exchanges-rather-than- | STATE prepare_desk | medium |
| wt-an-open-question-about-note-headers-wanting-a-ruling-rather- | i29 | high |
| wt-document-the-submission-convention-for-zero-row-generated-gr | i29 | low |
| wt-reshaping-a-system-can-leave-older-demands-untrue-and-no-ste | i43 | high |
| wt-a-register-entry-of-the-kind-that-records-borrowed-time-carr | i43 | high |
| wt-announcing-that-a-turn-is-finished-and-actually-finishing-it | i48 | medium |
| wt-make-the-copilot-stop-hook-reject-a-final-response-whenever- | i48 | medium |
| wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see- | DRAIN obsolete | high |
| wt-restarting-the-engine-erases-the-running-commentary-s-open-i | DRAIN obsolete — verify | medium |
| wt-editing-a-state-machine-while-its-iteration-is-open-reaches- | i13 | high |
| wt-the-report-saying-what-a-built-system-s-owner-has-changed-fo | i19 | high |
| wt-a-retired-concept-still-stands-in-the-design-corpus-as-thoug | i44 | medium |
| wt-the-automatic-close-on-an-idle-machine-works-end-to-end-and- | i50 | medium |
| wt-charge-a-state-s-reading-only-to-whoever-walks-into-it-and-g | i56 | medium |
| wt-driving-the-machine-without-an-agent-happens-today-inside-a- | i58 | high |
| wt-a-second-hand-reviews-the-checkpoint-that-opens-a-piece-of-w | STATE M0_90_gate-kickoff | high |
| wt-each-story-a-person-could-act-out-gets-a-check-that-drives-t | STATE M7_10_author-tests | medium |
