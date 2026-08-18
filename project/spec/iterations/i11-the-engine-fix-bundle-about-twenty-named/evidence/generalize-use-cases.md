---
form: generalize-use-cases
by: agent
signed_off: 2026-08-16T11:17:10.566Z
authors: agent
files: null
---

# Evidence form / generalize-use-cases

## current_situation

The delta's one new story maps into an EXISTING use case as extensions, not into a new use case. That is the cheaper of the two answers this state allows, and it is the correct one here.

sty-carry-a-finding-without-stopping IS A VARIATION OF TAKING A STEP. The actor is the same, the trigger is the same, and the goal is the same — do one step and record what it produced. What differs is one branch: a check turns up something real that blocks nothing.

A NEW USE CASE WOULD HAVE BEEN WRONG, because it would have told the same general story twice with one branch different.

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

WRITE-REQUIREMENTS TURNS EXTENSION 4d INTO A DEMAND. The use case says the submit refuses an owed item with no open entry behind it; a requirement is what makes that checkable, and raid-risk-an-owed-item-without-a-guard-ships-a-known-defect is the entry it answers.

THE TWO EXTENSIONS ARE WRITTEN AS A PAIR ON PURPOSE. 4c alone is the feature; 4d alone is a refusal with nothing to permit. Splitting them across states is how one of them gets built and the other gets forgotten, which is exactly the shape raid-dec-blocking-and-the-battery-refusal-ship-together guards against elsewhere in this bundle.

NO OTHER USE CASE MOVED, which is the same test the story state applied: a delta that rewrites a general form is bigger than declared.

## anything_else

## mapping

- sty-carry-a-finding-without-stopping: MAPPED INTO uc-take-a-step, as two new extensions on its existing scenario rather than as a new use case. The main scenario is untouched — steps 1 through 6 already describe the pass, and the story is what happens when step 4 turns up a defect.
- extension 4c: A check turns up a real defect that breaks nothing here. It is recorded as an OWED item naming an open register entry with an owner, the state signs, and the walk moves on. The close refuses while any owed item stands.
- extension 4d: An owed item names no open register entry. The submit refuses it, because a disposition nobody agreed to is not a disposition. THIS IS THE GUARD HALF, and it is written into the use case rather than left to the requirement, because the extension without it describes a hole.
- every resident story: ALREADY MAPPED, and none re-mapped. The delta adds no pass to any of them.
