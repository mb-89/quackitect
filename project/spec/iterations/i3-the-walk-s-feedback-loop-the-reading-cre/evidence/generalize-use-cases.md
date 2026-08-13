---
form: generalize-use-cases
by: agent
signed_off: 2026-08-13T14:29:45.854Z
authors: agent
files:
---

# Evidence form / generalize-use-cases

## current_situation

The standing set, unchanged by this delta. No use case is added here and none is extended.

That follows from write-stories: no story was added, so nothing needs generalizing. A use case exists to be complete enough that requirements derive from it, and the requirements this delta writes derive from steps that are already written.

frame-delta's own follow_up named the two they derive from: [[uc-be-handed-the-method]] and [[uc-take-a-step]]. Both stand, and both already carry the steps in question.

ONE ROW WAS ADDED TO THE LIST, and it is not this iteration's. [[uc-claim-an-iteration]] came from the previous iteration and arrived when trunk was synced into the record. It refines [[sty-work-on-two-machines]], which arrived in the same sync.

That single missing row is what greyed every state below write-stories. The claim was signed when neither node existed here. The coverage check runs both ways over the rows this form lists, so a story no listed row refines breaks it.

## use_cases

- [[uc-adjudicate-a-gate]]
- [[uc-answer-a-question-with-tests]]
- [[uc-be-handed-the-method]]
- [[uc-begin-a-product]]
- [[uc-browse-the-archive]]
- [[uc-capture-a-stray]]
- [[uc-change-the-method-mid-walk]]
- [[uc-claim-an-iteration]]
- [[uc-close-a-record]]
- [[uc-diverge-before-deciding]]
- [[uc-drain-the-inbox]]
- [[uc-get-work-routed]]
- [[uc-install-quackitect]]
- [[uc-land-work-on-trunk]]
- [[uc-learn-the-machinery]]
- [[uc-let-the-system-catch-up]]
- [[uc-open-an-iteration]]
- [[uc-quality-compatibility]]
- [[uc-quality-flexibility]]
- [[uc-quality-functional-suitability]]
- [[uc-quality-interaction-capability]]
- [[uc-quality-maintainability]]
- [[uc-quality-performance-efficiency]]
- [[uc-quality-reliability]]
- [[uc-quality-safety]]
- [[uc-quality-security]]
- [[uc-research-and-record-an-answer]]
- [[uc-resume-after-an-absence]]
- [[uc-set-the-autonomy]]
- [[uc-shape-the-view]]
- [[uc-take-a-step]]
- [[uc-trace-a-decision-to-its-origin]]
- [[uc-vendor-and-overlay]]
- [[uc-view-notes-as-a-table]]
- [[uc-watch-the-walk-live]]

## follow_up

Nothing owed from this state.

The requirements at M3 derive from [[uc-take-a-step]] and [[uc-be-handed-the-method]], both standing. The coverage check refuses if any requirement refines neither.

## anything_else

WHERE THIS DELTA'S REQUIREMENTS LAND, checked rather than assumed.

[[uc-take-a-step]] carries the pull itself. The reading credit, the frontier reopen and the scaffold entry guard are all conditions on taking a step, so they refine steps that already exist in it.

[[uc-be-handed-the-method]] carries the seeding side. The mechanical size parse and the per-size field trim both change what a handed-over machine looks like when it arrives.

NEITHER NEEDED AN EXTENSION. Each defect this delta repairs was already a step's stated behaviour. What was missing was the enforcement, not the step.

THE ONE I CHECKED AND REJECTED. [[uc-change-the-method-mid-walk]] looked like it wanted an extension for stepping out to trunk and aiming back. It does not. That path is its main scenario already, and it ran four times today exactly as written. What it lacks is not a branch but a cheaper route, and that is a note rather than a use-case edit.
