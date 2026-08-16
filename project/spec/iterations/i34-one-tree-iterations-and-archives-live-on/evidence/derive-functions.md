---
form: derive-functions
amended: "2026-08-16T06:48:40.246Z by agent — fn-run-a-governed-walk.share-the-pool was deleted after this form signed, on the owner's ruling that the claim system goes everywhere it ripples. Deleting it left…"
by: agent
signed_off: 2026-08-16T05:56:39.841Z
authors: agent
files:
---

# Evidence form / derive-functions

## current_situation

i34 stands at derive-functions, with write-requirements standing again behind it.

THE DELTA ADDS NO FUNCTION. Functions are solution-neutral — what the system does, never how — and i34 removes a mechanism rather than a capability. Paths still resolve. The archive is still kept. Records still open and close.

WHAT CHANGES IS THE IMPLEMENTATION OF TWO OF THEM, and that is M5's business, not this state's.

## functions

- fn-run-a-governed-walk
- fn-run-a-governed-walk.answer-with-tests
- fn-run-a-governed-walk.catch-the-system-up
- fn-run-a-governed-walk.close-a-record
- fn-run-a-governed-walk.diverge-before-deciding
- fn-run-a-governed-walk.help-find-a-capability
- fn-run-a-governed-walk.hold-a-stray
- fn-run-a-governed-walk.hold-the-method
- fn-run-a-governed-walk.hold-the-work
- fn-run-a-governed-walk.judge-a-claim
- fn-run-a-governed-walk.keep-the-archive
- fn-run-a-governed-walk.keep-the-record
- fn-run-a-governed-walk.land-the-work
- fn-run-a-governed-walk.resolve-a-path
- fn-run-a-governed-walk.route-the-work
- fn-run-a-governed-walk.serve-a-step
- fn-run-a-governed-walk.show-where-it-stands
- fn-run-a-governed-walk.stand-up-a-product
- fn-run-a-governed-walk.teach-the-newcomer
- fn-run-a-governed-walk.work-the-register

## flows

- flow-archive-listing
- flow-bare-computer
- flow-battery-verdict
- flow-call-log
- flow-choice
- flow-closed-record
- flow-compiled-machine
- flow-dispatched-call
- flow-divergence-report
- flow-entry-document
- flow-evidence-form
- flow-field-feedback
- flow-filled-claim
- flow-filter
- flow-findings-report
- flow-help-query
- flow-help-result
- flow-instruction
- flow-intent
- flow-method-sources
- flow-note-inbox
- flow-open-record
- flow-option-sketch
- flow-outside-result
- flow-overlay
- flow-position
- flow-problem-statement
- flow-product-template
- flow-recommendation
- flow-reference-corpus
- flow-refusal
- flow-repository
- flow-resolved-target
- flow-scaffolded-product
- flow-stamped-claim
- flow-stray
- flow-surface
- flow-sweep-result
- flow-test-question
- flow-test-timings
- flow-toolchain
- flow-tour
- flow-trace-graph
- flow-trunk
- flow-worktree

## neutrality

CHECKED PER FUNCTION, AND THE HARD ONE IS resolve-a-path.

ITS STATEMENT IS ALREADY NEUTRAL and stays so: "decide which tree a call's path names, and say so". It does not say HOW MANY trees there are. Its own node writes out three honestly different designs that could serve it — bind the lane's root to the record, judge each path against the record, or resolve as today and name the result.

i34 CHOOSES A FOURTH: make one tree, so the decision has one answer. That is a DESIGN, and it belongs to M5. The function does not move, which is the test of whether it was solution-neutral in the first place. It passes.

THE TEST APPLIED TO THE OTHERS. Ask what each would be called in a design that was rejected.

- `keep-the-archive` — called the same under a manifest-and-hash design, which was designed in full today and rejected. Neutral.
- `keep-the-record` — called the same whether a record lives on a branch or on trunk. Neutral.
- `serve-a-step` — called the same whether a container offers, selects or auto-enters. Neutral.
- `share-the-pool` — the one worth naming. It reads neutral, and it currently has exactly one mechanism in the system: the claim ledger. A function with one mechanism looks neutral and is not being tested, so its neutrality is asserted rather than demonstrated. Recorded rather than claimed.

NO FUNCTION NAMES A MECHANISM in its statement, and none was rewritten to keep it that way — which is the honest form of this check. A tree that had to be reworded to pass would have been carrying a design.

## follow_up

- THREE FUNCTIONS ARE RESHAPED WITHOUT BEING REMOVED.
  - `resolve-a-path` becomes trivial rather than absent. A path still resolves; there is one store to resolve it against, so the function survives and its implementation collapses.
  - `keep-the-archive` stops reading out of git and reads from disk. Same function, different mechanism.
  - `close-a-record` stops merging and retiring. Same function, less of it — and it now serves req-a-shipped-record-is-never-reclaimed, which lost its old server.
- ONE FUNCTION WAS DELETED, AMENDED 2026-08-16. This form first argued that `share-the-pool` should survive as a function whose only mechanism goes, and left the ruling to the gate. The owner then ruled the claim system out everywhere it ripples, so the function went with its element. The tree is twenty, not twenty-one.
- DELETING IT ORPHANED TWO LIVE REQUIREMENTS, and that is the finding worth keeping. req-a-records-dependency-is-declared and req-a-shipped-record-is-never-reclaimed were served only by share-the-pool, and nothing warned before the delete — the coverage law caught it four states downstream, through a chain of fallen inputs. They are now served by `route-the-work` and `close-a-record`, which is where they belonged all along.
- NO NEW FUNCTION IS AUTHORED. A new one would mean the delta added a capability, contradicting the minor column.

## anything_else

THE FLOW SET IS UNCHANGED BY THIS DELTA, and listing it whole is the claim. No flow is added, none is removed, and no function gains an input or loses an output — which is what it means for a minor to add no capability.

ONE FLOW IS EMPTIED OF MEANING WITHOUT BEING DELETED. `flow-worktree` is an input to fn-run-a-governed-walk.resolve-a-path today. Under one tree there is no worktree to carry, so it becomes a constant, and a constant is not information. It stays on this list because removing a flow is a structural act belonging to M5's decomposition, and it is named in follow_up so decompose-structure faces it rather than discovering it.

THE SUPERSESSION LIST NOW HAS FOUR KINDS ON IT, and gate-requirements is where it stops growing: five requirements that demand the opposite of this iteration, one use case whose every mechanism goes, one story behind it, and one function left neutral but unimplemented. None of it is ruled in the states that found it. A state that writes requirements does not retire them, and a state that derives functions does not delete them.
