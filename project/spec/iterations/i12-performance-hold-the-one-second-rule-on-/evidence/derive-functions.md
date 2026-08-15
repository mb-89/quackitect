---
form: derive-functions
by: agent
signed_off: 2026-08-15T10:36:19.349Z
authors: agent
files:
---

# Evidence form / derive-functions

## current_situation

No new function was written. The delta's five requirements land on three functions that already exist, and the tree keeps its shape.

That is the honest result for a performance record. Nothing here asks the system to DO something new. It asks three things it already does to answer inside a bound, to report truthfully, and to hand back an instruction rather than a decision.

ONE HOLE WAS FOUND AND FILLED. req-a-clear-jump-is-one-call, minted in i27, was served by no function at all. That is the first of the four holes this step exists to catch, and it was caught mechanically at the submit rather than by a reviewer.

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
- fn-run-a-governed-walk.route-the-work
- fn-run-a-governed-walk.serve-a-step
- fn-run-a-governed-walk.share-the-pool
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

THE TEST IS ONE QUESTION: could two honestly different designs both do this? Every allocation above passes it, and the milestone's temptation to fail it is named.

NO FUNCTION NAMES A MECHANISM. The record's scope carries candidate mechanisms by name: cache the comparison walk, fake the git seam, preload the forms, attach a second reporter. Not one of them appears in a function, and each would have failed the test in a different way.

- "cache the comparison walk" is an implementation verb. Caching is how, not what.
- "fake the git seam" only makes sense given one design, which is the subtlest tell and the one no word list catches.
- "attach the timings reporter" names a product part. The demand is that durations be RECORDED; whether a reporter, the TAP stream or something else carries them is the design's to choose.

req-scoped-run-records-its-timings was written to that discipline. Its Detail says plainly that which of the two mechanisms the engine uses is design rather than demand.

THE ONE PLACE NEUTRALITY WAS NEARLY LOST. "Be faster" is not a function at all. It is a bound on how everything else is done, which is why this milestone adds no function and moves allocation instead.

## follow_up

- Every hole this step exists to catch was looked for, and one was found.
- A requirement no function serves: req-a-clear-jump-is-one-call, from i27, now allocated to serve-a-step.
- A function no requirement asked for: none, since none was added.
- A use-case step no function covers: uc-quality-performance-efficiency step 6, added this record, lands on show-where-it-stands.
- An output nobody consumes: flow-test-timings was the candidate, and two consumers are named, so it stands.

## anything_else

ON THE ONE FLOW THIS RECORD ADDS.

flow-test-timings is produced by answer-with-tests: every case's duration, recorded per run and kept across runs.

WHY IT IS NOT flow-battery-verdict. The verdict is what a run hands BACK to whoever asked, and it is consumed immediately. The timings are durable and appended, read by a LATER act than the one that produced them, and their whole value is comparison across runs.

A verdict says whether the world still behaves. This says what it cost.

WHO CONSUMES IT, because an output nobody consumes is a finding rather than a flow. Two acts read it. A later run of answer-with-tests compares against it, which is the only way a speed-up can be shown at all. The retro's record-mining step reads it to rank the test timings.

NO OTHER FLOW MOVED, because the delta adds no function.

ON A MILESTONE WHOSE MAIN RESULT IS SOMEBODY ELSE'S MISSING EDGE.

req-a-clear-jump-is-one-call is a MUST, graded corrosive, minted in the record that shipped the day before this one. It refines three use cases and carries a measured source: five pulls at 150092, 122748, 104578, 96647 and 80422 ms.

And no function served it. The demand existed and nothing in the structure said what does it.

The check caught it in one submit, from the other side of the coverage. It is worth recording because it is the strongest argument in the machine for checking coverage mechanically rather than at a review: the row was written carefully by somebody who cared about it, and the edge was still missing.

## allocation

- req-scoped-run-records-its-timings: answer-with-tests. That function answers one question by running the narrowest scope that settles it, and a scope whose durations are thrown away cannot settle a question about cost.
- req-surface-answers-in-one-second: show-where-it-stands. It puts the standing position in front of a person, and a position that takes four seconds to arrive is that verb's own failure mode.
- req-survey-counts-only-open-records: show-where-it-stands. The defect is in what the survey REPORTS. Routing consumes the list and inherits the error rather than causing it.
- req-answer-pages-never-overflows: serve-a-step. Handing the driver one instruction carrying everything it needs is exactly what a truncated answer fails at.
- req-container-offers-its-records: serve-a-step. The container fault is the wrong INSTRUCTION handed back, a do where a choose was owed.
- req-a-clear-jump-is-one-call: serve-a-step. Found unallocated by this step's own coverage check. It demands that naming a target and moving to it fit in one served step, which is the same verb.
