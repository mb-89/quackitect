---
form: generalize-use-cases
by: agent
signed_off: 2026-08-15T10:33:21.590Z
authors: agent
files:
---

# Evidence form / generalize-use-cases

## current_situation

One story was added this record, and it needed a general form above it.

No new use case was written. The story's goal is the one uc-quality-performance-efficiency already states: get an answer fast enough to keep working.

What that use case did NOT cover was a person's LOOK. Every step of its main scenario was a call into the lane, and the story is about opening a surface.

So it was EXTENDED rather than duplicated, which is what the method asks when a new story fits an existing goal.

## use_cases

- uc-adjudicate-a-gate
- uc-answer-a-question-with-tests
- uc-be-handed-the-method
- uc-begin-a-product
- uc-browse-the-archive
- uc-capture-a-stray
- uc-change-the-method-mid-walk
- uc-claim-an-iteration
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
- uc-take-a-step
- uc-trace-a-decision-to-its-origin
- uc-vendor-and-overlay
- uc-view-notes-as-a-table
- uc-watch-the-walk-live

## follow_up

- uc-quality-performance-efficiency now carries a sixth main step for a person opening a surface, and extension 6a for that surface exceeding the bound.
- Extension 6a is worded as a RECORDING failure rather than a speed failure. A slow look nobody records is the thing this record found, and the wording keeps it findable.
- M3's requirements already derive from that step. req-surface-answers-in-one-second refines this use case and carries the pass line.

## anything_else

ON EXTENDING RATHER THAN ADDING.

A second use case was the easy move and it would have been wrong. The goal is identical: get an answer fast enough to keep working. Two use cases with one goal is the pile-of-duplicates failure the method names.

What differs is the actor's SURFACE, not the goal. The agent calls the lane, the person opens a drawing, and both are waiting on the same machine.

The main scenario now runs six steps, inside the three-to-nine bound, so the extension did not push it toward being two use cases.

ONE THING THE EXTENSION MAKES VISIBLE. The guarantee used to say a CALL answers inside the bound. It now says a call or a look. That single word is the gap this record found, and it had been missing since i1.
