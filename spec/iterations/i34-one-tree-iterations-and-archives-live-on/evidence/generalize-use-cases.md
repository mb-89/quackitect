---
form: generalize-use-cases
by: agent
signed_off: 2026-08-16T08:57:13.801Z
amended: 2026-08-16T07:13:49.366Z by agent — the follow_up held uc-claim-an-iteration open pending a gate ruling; the gate ruled, the owner widened it, and the node is deleted — the form must not read as…
authors: agent
files: null
---

# Evidence form / generalize-use-cases

## current_situation

i34 stands at generalize-use-cases, walked back to because it was never filled.

THE OWNER SAW IT FROM OUTSIDE: "write stories, generalise use cases don't render as done when I look at them." The claim guard then proved it from inside — write-requirements' claim dropped because this state is not standing, and an amend refused with "no form on disk".

SO THE PANEL WAS TELLING THE TRUTH and the sweep was not. Both states were listed as swept and neither had a form. That is captured as note-f5b5d36a8502, now upgraded from a question to a finding.

THE DELTA ADDS NO USE CASE. i34 removes a mechanism and creates no new goal for any actor. The resident set stands, and the coverage law is what this state actually asserts.

## use_cases

- uc-adjudicate-a-gate
- uc-answer-a-question-with-tests
- uc-be-handed-the-method
- uc-begin-a-product
- uc-browse-the-archive
- uc-capture-a-stray
- uc-change-the-method-mid-walk
- uc-close-a-record
- uc-diverge-before-deciding
- uc-drain-the-inbox
- uc-find-the-right-lane-tool
- uc-get-work-routed
- uc-install-quackitect
- uc-land-work-on-trunk
- uc-learn-the-machinery
- uc-let-the-system-catch-up
- uc-open-an-iteration
- uc-quality-compatibility
- uc-quality-flexibility
- uc-quality-functional-suitability
- uc-quality-interaction-capability
- uc-quality-maintainability
- uc-quality-performance-efficiency
- uc-quality-reliability
- uc-quality-safety
- uc-quality-security
- uc-research-and-record-an-answer
- uc-resume-after-an-absence
- uc-set-the-autonomy
- uc-shape-the-view
- uc-start-an-unattended-machine
- uc-take-a-step
- uc-trace-a-decision-to-its-origin
- uc-vendor-and-overlay
- uc-view-notes-as-a-table
- uc-watch-the-walk-live

## follow_up

THE SET IS 36, ONE MORE THAN THIS FORM FIRST CARRIED, and the extra one arrived from outside this iteration.

uc-start-an-unattended-machine CAME WITH i28. Its specification existed only on i28's branch while its code stood on trunk, so merging i28 back brought the node into the corpus. It refines sty-work-on-two-machines and nothing else.

THE COVERAGE CHECK IS WHAT CAUGHT IT, and it caught it twice over. First it refused this state because a use case refined a story that had been deleted. Then, once the story was restored, it refused again because no use case in THIS list covered that story. Both refusals were right and neither needed a reviewer.

uc-claim-an-iteration IS GONE, and that part of the earlier answer stands. The owner retired the machine-locking specification whole, and the use case went with it.

THE STORY DID NOT GO WITH IT, and that was the correction. sty-work-on-two-machines was deleted alongside the claim system and then restored, because the engineer's want — two machines working at once — never rested on a lock. The owner's own words: "it's just two agents on two different clones." Only its mechanism changed.

FOUR USE CASES ARE TOUCHED WITHOUT BEING BROKEN.

- uc-open-an-iteration gets the selection state in front of the iterations.
- uc-take-a-step gets the same selection state.
- uc-browse-the-archive gets a folder that stays on disk.
- uc-close-a-record gets a close that no longer retires anything.

NEXT: the build states, whose code is already written and green.

## anything_else

WHY WALKING BACK WAS RIGHT AND CHEAP. `se_aim {to, go: true}` drew the route back through gate-motivation to write-stories in one call, and the green states were walked THROUGH rather than re-earned.

WHAT I DID NOT DO AT THE TIME. I did not retire uc-claim-an-iteration, because that was a ruling belonging to the gate. The gate ruled it, the owner then widened the ruling to the whole claim system, and the use case was deleted on 2026-08-16 with twenty other nodes.

THREE REQUIREMENTS THAT REFINED IT SURVIVED, re-pointed rather than deleted: req-a-records-dependency-is-declared and req-unshipped-dependency-refused are the container's DAG wiring, and req-a-shipped-record-is-never-reclaimed is about a record's status. None of the three is about machine locking, and only reading each referrer by hand caught that.
