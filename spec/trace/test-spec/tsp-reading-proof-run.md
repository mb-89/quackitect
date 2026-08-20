---
minted_in: i1
id: tsp-reading-proof-run
type: "[[test-spec]]"
statement: A fresh agent is handed the method one document at a time and cannot reach the work until it proves it read them - observed on a real session's reading loop.
method: demonstration
verifies:
  - "none — demonstrates sty-the-agent-proves-it-read carries the edge; the mechanics are test-verified by tsp-reading-loop"
demonstrates:
  - sty-the-agent-proves-it-read
files:
  - none — the procedure below is the definition; the observed session is the evidence
---

## Scope

The reading loop as lived: documents served whole inside the pull, tail
probes answered, a wrong answer refused and re-served, a right one
credited. The mechanics are tested in the battery
([[tsp-reading-loop]]); THIS spec is the end-to-end observation on a
real walk.

## Approach

System level, over a genuine session - a compaction or a reload leaves
the reading re-owed, and the loop that follows is the demonstration.
The call log is the record.

## Procedure

- A fresh or compacted agent pulls toward a state owing reads. Observe:
  the pull answers read, the document rides whole, probes name words
  near the end.
- The agent answers a probe wrongly or too narrowly. Observe: nothing is
  credited; the same document returns.
- The agent answers correctly. Observe: the next document is served;
  the loop continues until no read remains.
- The reading completes. Observe: the state opens and the work is
  served - never before.

## Observed 2026-08-17, in i33's own call log

GREEN ON STEPS 1, 2 AND 4, AND ON THE CREDITING HALF OF STEP 3. The record
is three calls inside 31 seconds, all on meth-find-the-fault.md:

- call-941bb905c033 at 12:42:25.811 SERVES the document. It is a submit on
  the verification form, and the machine replied `pull: "read"` with the
  content riding whole. That is step 1.

- call-c283d9ea33eb at 12:42:36 answered the probe
  "is 1-minimal: remove any; in the simulation, then; Two changes per
  run". The machine replied `pull: "read"` and served THE SAME DOCUMENT
  again. Nothing was credited.
- call-0d1d15db89df at 12:42:56 answered
  "is 1-minimal: remove any; in the simulation, then; keep an audit
  trail". The machine replied `pull: "do"` and the walk moved on.

WHAT EACH STEP GOT, said exactly rather than roughly.

- STEP 2 is fully evidenced: nothing was credited and the same document
  returned.
- STEP 3 is HALF evidenced. The crediting half holds. "the next document
  is served" was NOT observed, because this was the last document owed.
- STEP 4 is evidenced and was almost missed: the second call's reply
  carries a `walked` array listing gate-requirements, author-tests,
  specify-build, observe-red and build-steps/start. That is the state
  opening and the work being served after the reading completed.
- STEP 1's first two clauses are evidenced by call-941bb905c033.

THE CHAIN NEEDS NO INFERENCE. It did at first: the ref of the call that
first served the document was looked for and not found, so the link
between the two answers rested on their sharing the first two probe
segments. The tester found it on a later pass.

WHY IT WAS HARD TO FIND, and this is the finding that outlives the spec:
se_log_query drops matching records and reports `older: 0` while doing
it. The same filter returned seven records without the two that mattered,
and ten with them once a `since` was added. That is
raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not,
and it means every count taken from this log is a floor.

THE WRONG ANSWER WAS NOT A TEST FIXTURE. It was a real miss on a real
walk, which is what this spec asks for and what a staged one could never
prove.

WHY IT SAT UNOBSERVED. This spec was listed as needing a resource it does
not need. Its own Approach says the call log is the record, the log is on
this machine, and nobody had looked. A verification tester with fresh eyes
caught the misclassification, and the observation took one query.
