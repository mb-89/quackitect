---
form: red-objective
by: agent
signed_off: 2026-08-13T12:15:36.058Z
authors: agent
files:
---

# Evidence form / red-objective

## current_situation

Aim at a state whose form is owed while standing on it, and the pull answered "the target is where the walk already stands" and stopped. True about POSITION, useless about WORK: the route is empty because there is nowhere to GO, never because there is nothing to DO. One of the three defects i3 was opened for.

## built

session.ts, in the pull's zero-length-route branch.

Before answering `wait`, it now asks the target whether it owes a form, and serves that form exactly as the sweep serves one:

    const owed = r.found ? this.pullFormsOwed().filter((n) => !this.formsMet([n])) : [];

Only a target that owes nothing falls through to the wait, and there the sentence is finally true — it now reads "and it owes nothing", so the two cases are distinguishable.

Cases: tests/feedback-loop.test.ts — the fixture the spec said this step needed: seed a record, enter it, land on a state that owes its form, and aim at exactly where you stand. It asserts the answer is not `wait`.

THE SPEC HAD LISTED THIS STEP AS OWED and said why: a fresh root walks to the desk with nothing red, so there was nothing to observe. Building the fixture is what closed it.

## follow_up

A second case shares this shape and is NOT covered: a zero-length route because the way runs through a sub-machine the walk has not entered. There the walk is nowhere near the target and the sentence is a lie. Noted separately, with the remedy it should give: name the running state and say to aim there first.

## anything_else

