---
form: evaluate-architecture
amended: "2026-08-26T13:46:47.878Z by agent — the work-editor ruling was stretched past what it says: the owner ruled on how a token's body is edited, and the row is about the list surface that narrows, folds and moves rows"
by: agent
signed_off: 2026-08-26T13:12:57.464Z
authors: agent
files:
---

# Evidence form / evaluate-architecture

## current_situation

The winner is "Archive in git": an iteration's work is editable files while it is open, and at close the whole iteration folds to one file, leaves the working tree, and is read back at a recorded commit.

The structure now carries two new elements. el-work-store writes every piece of work and el-work-offer writes none — that is the cut, and it is narrower than the read-against-write split first claimed here.

THE FOLD IS IN NEITHER OF THEM. Closing is a record-level act and el-record-store already implements closing and the archive, so the fold lives there. Both new elements say in as many words that they do not fold.

The structure numbers are computed. Interface debt read 0 when this state signed, and moving the fold afterwards created a handover with no contract. [[if-work-store-to-record-store]] carries it now. Unimplemented functions is 0. Allocation spread is 5, two-way pairs is 5, idle elements is 1 (el-arrival), undemanded interfaces is 10.

The ten interfaces this iteration owed are all minted and all demanded. None of them appears in the undemanded list.

Two requirements carried no scenario when this state opened. Both now have one, written here rather than scored around.

## walk

- [[req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point]] => addressed by [[raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask]]. The archive read is a ref read, so the ancestry test already covers it. An archive commit newer than the rewind point is refused, which is the behaviour a bound run wants.
- [[req-a-ceiling-that-cannot-prove-ancestry-refuses]] => addressed by [[raid-dec-a-run-that-cannot-establish-its-guard-never-binds]]. Unchanged by this structure.
- [[req-a-wrong-act-never-passes-silently]] => addressed by [[raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus]]. The work store is a write path and inherits the same seam.
- [[req-every-artifact-is-readable-text]] => at risk. The hinge is the fold. The folded file is text, so the measure of zero binary files still passes. What the measure protects is weaker: a diff over one folded file no longer shows which piece of work changed. The tradeoff is per-item diffability bought for a smaller tree and a faster commit.
- [[req-every-call-logged]] => addressed by [[raid-dec-stray-log]]. Unchanged.
- [[req-mirror-stays-on-the-machine]] => addressed. No element this iteration adds opens a socket.
- [[req-native-project-tools-stay-outside-the-cage]] => addressed. Unchanged by this structure.
- [[req-trees-never-mix]] => addressed by [[raid-dec-a-producing-act-is-bounded-by-the-tree-it-produces]]. The work store writes only inside the open record.
- [[req-walk-resumes-from-repo]] => addressed by [[raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed]]. Work stands as files on trunk, so a new session reads it from the repository.
- [[req-a-benchmark-report-carries-the-conditions-of-its-run]] => addressed by [[raid-dec-the-conditions-a-log-cannot-recover-are-written-when-a-run-binds]]. Unchanged.
- [[req-a-machine-decision-repeats]] => addressed by [[raid-dec-difficulty-is-two-figures-and-is-named-per-state]]. The collapse to two ladders keeps the mapping declared, so the answer is derived rather than routed.
- [[req-a-resolution-is-proven-by-read-back]] => at risk. The hinge is the ref read. This row names four path kinds and asks that a resolution be proven by reading back FROM THAT TREE. Once a closed record's folder is gone there is no tree to read back from, and a ref read is not a tree read. Ruled addressed at first pass, and corrected here: the winner adds a fifth kind the row does not cover.
- [[req-a-run-that-stopped-early-says-where-it-stopped]] => addressed. Unchanged by this structure.
- [[req-acts-carry-role-and-channel]] => addressed by [[raid-dec-the-account-rides-beside-the-door-rather-than-replacing-it]]. A take and a settle are acts and carry the same stamp.
- [[req-boot-needs-no-manual-test-metadata-repair]] => addressed. Unchanged by this structure.
- [[req-crash-lands-safe]] => at risk. The hinge is the take. A hand takes a piece of work, the session dies, and nothing releases it. The structure has a take and a settle and no third path back. The tradeoff is a simpler write surface bought against work that can strand.
- [[req-fresh-machine-runs]] => addressed by [[raid-dec-install-is-one-command-behind-a-complete-preflight]]. Unchanged.
- [[req-no-agent-act-destroys-work]] => addressed by [[raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed]]. The delete at close is safe only because the commit is recorded, and the decision records it.
- [[req-overlay-survives-update]] => addressed by [[raid-dec-serve-the-overlay-and-report-the-drift]]. Unchanged.
- [[req-oversized-results-remain-recoverable-through-the-lane]] => addressed. Unchanged by this structure.
- [[req-reachable-capability-is-traced]] => addressed. Every function the two new elements carry has a use case above it.
- [[req-resume-needs-no-person]] => addressed by [[raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed]]. Standing work is on disk and readable without a session.
- [[req-stop-hook-yields-only-at-a-machine-stop]] => addressed by [[raid-dec-stop-at-is-a-four-notch-dial-the-hook-enforces]]. Unchanged.
- [[req-supported-harness-serves-one-lane-contract]] => addressed. Unchanged by this structure.
- [[req-the-answer-never-exceeds-its-bound]] => addressed. The owed count is two integers, so no new spill path is opened.
- [[req-walk-survives-host-swap]] => addressed by [[raid-dec-one-tree-beats-a-record-travelling-between-machines]]. Work is committed to the branch like every other file.
- [[req-a-clear-jump-is-one-call]] => addressed. Unchanged by this structure.
- [[req-a-folder-is-driven-only-with-consent]] => addressed by [[raid-dec-the-machine-state-sits-inside-the-opened-folder-and-one-declaration-names-it]]. Unchanged.
- [[req-a-hop-of-the-walk-carries-its-own-time-budget]] => addressed. The read the offer makes is per position, not per record.
- [[req-a-preflight-check-asks-the-reader-where-it-looked]] => addressed. Unchanged by this structure.
- [[req-a-slow-answer-does-not-freeze-the-surface-beside-it]] => at risk. The hinge is where the fold runs. It runs at close, on the process that serves the surface. The owner has ruled it belongs in a background task, and the structure names no element that holds one. The tradeoff is a simple close path bought against a surface that can stall on it.
- [[req-a-states-outstanding-count-is-read-at-a-glance]] => addressed. The work offer publishes the count and the mirror draws it, so the surface derives nothing.
- [[req-a-storage-shape-chosen-for-the-archive-can-be-changed-later]] => addressed by [[raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed]]. History is never rewritten, so the pre-fold files stay reachable at their commit whatever the format becomes.
- [[req-a-target-that-cannot-be-reached-is-refused-quickly]] => addressed. Unchanged by this structure.
- [[req-a-windowed-pool-answer-says-that-it-was-windowed]] => unaddressed. No element in this structure windows the pool answer or says that it did.
- [[req-aiming-returns-before-the-walking-starts]] => addressed. Unchanged by this structure.
- [[req-call-answers-in-one-second]] => addressed. The count is read per position and the mint happens once per entry.
- [[req-entry-speaks-plainly]] => addressed. Unchanged by this structure.
- [[req-interrupted-call-names-the-stopping-layer]] => addressed. Unchanged by this structure.
- [[req-one-operation-reads-its-input-once]] => addressed. The compiled machine is read once per entry and passed to the mint.
- [[req-query-is-deterministic]] => addressed by [[raid-dec-one-corpus-reader-and-the-second-is-deleted]]. Unchanged.
- [[req-responsiveness]] => addressed. Its two children carry the budgets, and the one real pressure is recorded against the slow-answer row rather than restated here.
- [[req-surface-answers-in-one-second]] => addressed. The owed count is served as a figure rather than computed at draw time.
- [[req-the-actor-is-recorded-where-the-call-is-served]] => addressed. Unchanged by this structure.
- [[req-the-benchmark-history-is-unreadable-while-a-run-is-bound]] => addressed by [[raid-dec-a-benchmark-rewinds-content-and-never-the-machine]]. The fold does not move the reports folder.
- [[req-the-panel-s-paint-says-which-kind-of-green-it-is]] => addressed. Unchanged by this structure.
- [[req-the-work-editor-needs-no-new-instruction]] => unaddressed, and a re-ruling that called it addressed is withdrawn. The owner ruled that a work token is markdown and opens in whatever opens markdown, and that settles how a token's BODY is edited. This row is about a different thing: its measure asks somebody to narrow a list, fold a group and move a row, and its own body names four things with no precedent in the tree. A markdown editor does none of them. The ruling does not reach this row, and stretching it to fit was the error. Whether that surface is going too is the owner's call, and until they make it this row stands unaddressed.
- [[req-two-hands-writing-work-at-once-do-not-collide]] => at risk. The hinge is who owns the file. [[raid-dec-the-position-owns-its-work-and-the-merge-cost-is-accepted]] accepts a cost this row measures as zero, so the two disagree by design. The tradeoff is one readable file per position bought against a merge a person may have to resolve.
- [[req-what-the-corpus-is-has-one-answer]] => addressed by [[raid-dec-one-corpus-reader-and-the-second-is-deleted]]. Unchanged.
- [[req-work-past-its-bound-says-it-is-working]] => addressed. Unchanged by this structure, and the fold's own case is recorded against the slow-answer row.
- [[req-a-slowness-signal-never-shortens-the-wait]] => addressed. Unchanged by this structure.
- [[req-audit-answers-from-log]] => addressed by [[raid-dec-stray-log]]. A take and a settle are logged calls.
- [[req-newcomer-leaves-able-to-ask]] => addressed. Unchanged by this structure.
- [[req-newcomer-one-command]] => addressed by [[raid-dec-install-is-one-command-behind-a-complete-preflight]]. Unchanged.
- [[req-newcomer-orients-unaided]] => addressed. Unchanged by this structure.
- [[req-the-desk-is-usable-soon-after-the-folder-opens]] => addressed. Unchanged by this structure.
- [[req-the-folder-shows-what-to-run]] => addressed. Unchanged by this structure.

## fitness_candidates

- [[req-a-storage-shape-chosen-for-the-archive-can-be-changed-later]]
- [[req-two-hands-writing-work-at-once-do-not-collide]]
- [[req-every-artifact-is-readable-text]]
- [[req-walk-resumes-from-repo]]
- [[req-no-agent-act-destroys-work]]
- [[req-a-machine-decision-repeats]]
- [[req-crash-lands-safe]]

## follow_up

Six rows did not come out addressed, and each one is a real hole rather than a note about one.

Three are at risk and belong to this iteration's own design.

- A folded archive file is text but no longer diffs per piece of work.
- Work taken by a hand that then dies has no path back.
- The fold runs at close on the process that serves the surface.

One more is at risk and is a disagreement rather than a gap. The position-owns-its-work decision accepts a merge cost, and the row measures that cost as zero. One of the two has to move at the next milestone.

One row is now at risk that was not: the read-back proof rule names four kinds of tree and a folded record is not one. Its entry is [[raid-risk-a-ref-read-is-not-a-tree-read-and-the-read-back-rule-names-only-trees]].

Two are unaddressed and neither is this iteration's scope. Nothing windows the pool answer, and no element implements the work editor.

A cold review at the gate found six more things, and the two that changed this form are the row above and the disposition of the numbers. The rest are filed in the register.

The new two-way pair is recorded as a decision rather than argued here. [[raid-dec-the-work-pair-exchanges-both-ways-and-the-cycle-is-contained-rather-than-removed]] carries the rejected options and the consequences, including the one path that would close it later.

The undemanded interfaces are not this record's and they are not nobody's. Ten pre-existing contracts have no crossing demanding them, and saying so in a follow-up line was the wrong disposition. They stand as they stood; no state here touched one.

The idle element is el-arrival, and [[raid-dec-the-arrival-merges-into-the-bring-up-path]] already rules on it. That is a recorded decision rather than a sentence written at this state.

## anything_else

The ten interfaces this iteration owed closed the interface debt to zero. Undemanded interfaces stands at 10 and none of them is one of the ten this record minted. They are pre-existing contracts no crossing demands. Nothing in this record touched one, and no state here is the place to dispose of them — saying whose cleanup they are was not this form's to say, and the sentence that did is withdrawn.

Two requirements reached this state with no scenario at all: req-a-machine-decision-repeats and req-responsiveness. A missing scenario is nothing to judge, so both were written here before the walk ran rather than reported as findings.
