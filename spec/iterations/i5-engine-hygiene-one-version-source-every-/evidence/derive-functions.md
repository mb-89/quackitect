---
form: derive-functions
reopened: 2026-08-19T11:16:57.499Z — write-requirements was re-signed after one row was split into the reader half, so this state answered ground that moved
by: agent
signed_off: 2026-08-19T11:16:57.967Z
authors: agent
files: null
---

# Evidence form / derive-functions

## current_situation

One function is new and three resident ones took a new row each. Thirty-seven stood before this state.

Every one of the five requirements now lands on a function. No new flow was needed: the new function consumes and produces flows that already exist.

## functions

- fn-arrive-on-a-machine.state-which-build-this-is
- fn-arrive-on-a-machine.judge-the-runtime
- fn-run-a-governed-walk.serve-a-step
- fn-run-a-governed-walk.show-where-it-stands

## flows

- flow-arrival-request
- flow-arrival-account

## neutrality

THE TEST IS ONE QUESTION: could two honestly different designs both do this. It was asked of the one new function and of every allocation.

THE NEW FUNCTION PASSES. "State which build of the product is installed here, without bringing any of it up" names no flag, no command and no file. A design that answered by writing the version into a manifest the caller reads would serve it. So would a design that answered over a socket. The flag lives in the requirement, where a mechanism belongs.

THE THREE TELLS WERE CHECKED against it. No noun that is a product. No verb that is an implementation — "state" is what, not how. And the third tell, the subtle one: asked what this would be called in a design that had no command-line entrypoint at all, the answer is the same sentence. That is what makes it neutral rather than merely worded neutrally.

WHERE A SOLUTION IS GENUINELY FORCED, and it is worth naming: the version must come from the product's own manifest rather than from a stamp somebody types. That is not a function, it is a constraint, and it already sits in the requirement's Detail with the reason.

THE THREE ALLOCATIONS were checked the same way, and one moved because of it. The reader half of the actor rule was first put on the function that keeps the record, which is where the stamping row already sits. It belongs on the function that SHOWS where things stand, because the demand is about readers and the record function does not read. Putting it back would have hidden a requirement about surfaces inside a function about recording.

## follow_up

identify-assumptions is next, and it sweeps what these rows lean on.

ONE IS ALREADY VISIBLE: the preflight row assumes the reader can be asked where it looked without a circular import between preflight and the renderer. Nobody has checked it.

THE FOUR HOLES WERE ALL WALKED. Both directions of the coverage check pass, every use-case step of the new case lands on the new function, and no output goes unconsumed — the arrival account is already consumed by the arrival's own reporting.

## anything_else

WHY NO NEW FLOW. The new function consumes an arrival request and produces an arrival account, both of which exist. A `flow-version-answer` was considered and rejected: it would carry exactly what the arrival account already carries, reduced to one fact, and a flow that is a subset of another flow splits the trace without adding a boundary anybody crosses.

DEPTH IS NOT RIGOR, and this state added one leaf rather than a subtree. Three of the five requirements went to functions that already existed, which is the outcome the method expects when a delta is hygiene rather than capability.

WHAT WOULD HAVE BEEN A FUNCTION AND IS NOT. Splitting the heavy test file. It is a change to how a battery is arranged, not something the system does for anybody, and inventing a function for it would be work nobody asked for — the second of the four holes, from the wrong side.
