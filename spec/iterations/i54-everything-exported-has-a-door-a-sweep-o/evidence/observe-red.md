---
form: observe-red
judgment: passed at 2026-08-26T13:52:27.477Z with deliverable/engine/bin/red-observed.ts@94845e5a35bf
by: agent
signed_off: 2026-08-26T13:52:17.505Z
authors: agent
files: null
---

# Evidence form / observe-red

## current_situation

The red is observed and it is real. Neither module the checks name exists.

### The test red

The typechecker reports it on every write, without a run:

- `tests/doors.test.ts(20,65): error TS2307: Cannot find module '../engine/doorguard.ts'`
- `tests/doors.test.ts(21,77): error TS2307: Cannot find module '../engine/doors.ts'`

Four further errors are the same absence showing through as untyped parameters, because `DOORS` has no type to read.

A glob for `deliverable/engine/{doors,doorguard}.ts` returns nothing, so the absence is confirmed against the tree rather than inferred from the error.

### The inspection red

`tsp-the-door-regime-s-static-attributes` has seven checklist items, and every one of them examines a file that does not exist.

- Three ask whether a blanket off-switch exists in the rule module, its callers or the environment. Nothing can be read, so nothing can pass.
- Two ask whether one place holds each rule and whether the test holds a copy. The rule module is absent, so there is no one place.
- Two ask whether each door is named for its conversation and states its coverage limit. There is no rule table to read a name out of.

The inspection is RED because the subject is absent, which is the honest red for a spec written before the build.

### What the red is not

It is not a defect. Test-first means the checks precede the code, and this is the state that observes that they do.

## red_observed

- [x] tsp-the-door-regime-s-static-attributes

## follow_up

- The build walks the seven seeded chunks. The first is the rule module, which every other chunk in strand one leans on.
- The departure list runs beside it from the start, because it is a markdown file that leans on nothing.
- The typecheck errors go green as the two modules land. They are the fastest signal this record has, arriving on the write rather than on a run.

## anything_else

The typechecker is doing the work a test run would do here, and it is doing it earlier.

The lane runs it after every source write and hands the errors back on the next answer. So the red was visible the moment the test file landed, four states before this one, rather than at a run somebody had to remember to start.

### How the inspection red was observed

All seven checklist items on `tsp-the-door-regime-s-static-attributes` examine `deliverable/engine/doors.ts` and its callers.

- Three ask whether a blanket off-switch exists in the rule module, its callers or the environment.
- Two ask whether one place holds each rule, and whether the test holds a copy of it.
- Two ask whether each door is named for its conversation and states its coverage limit.

A glob for `deliverable/engine/{doors,doorguard}.ts` returns nothing. There is nothing to inspect, so no item can pass.
