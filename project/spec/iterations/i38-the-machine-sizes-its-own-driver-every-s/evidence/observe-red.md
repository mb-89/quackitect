---
form: observe-red
by: agent
signed_off: 2026-08-20T20:01:55.450Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

The design specs are signed and the chunk drawing is seeded. Nothing is built. This state is where every new check is seen failing, before any code lands.

FOUR TEST FILES ARE WRITTEN AND ALL FOUR RUN. Twenty-six cases across them, and the engine runs them at submit rather than taking my word for it.

### One file's reds came from a mistake worth recording

`tests/call-attribution.test.ts` was written first with the pattern `tests/actor-stamp.test.ts` uses: append a record carrying the new fields as a plain literal, and assert they come back. Its header even said what makes the case red — excess-property checking against a type that does not declare them yet.

FOUR OF EIGHT CASES WERE GREEN FROM BIRTH. `append` keeps keys it does not declare and the runner strips types rather than checking them, so asserting a field comes back out passed against no design at all.

WHAT MAKES A CASE RED HERE IS REQUIRED-NESS AND NOT PRESENCE. A call with no part, no state and no answering model must not become a record — `req-every-call-records-the-part-its-caller-played`'s own measure says calls whose part is absent = 0. The presence and grouping cases stay as regression guards once the fields are real.

### The two non-test specs are checked below, and RED IS IMPOSSIBLE FOR BOTH

The checklist takes a tick and nothing else, so the reason lives here.

`tsp-the-lane-publishes-a-strength-and-starts-nothing` asserts an ABSENCE over all paths: no host and no mode lets the lane start a process on account of a published strength. Nothing spawns today because nothing publishes today. The inspection passes vacuously and cannot be made to fail without writing the violation it exists to forbid.

`tsp-the-published-strength-is-the-same-on-every-host` has no path to read yet. The route from inputs to published statement does not exist, so there is nothing to examine for an environment read, a network call or a clock. An inspection over an empty path is not a red; it is nothing at all.

BOTH TICKS CLAIM "red is impossible for a spec covering standing behaviour, and that is accepted", which is the second of the two things this state's checklist may claim. Neither claims a red anybody saw.

### One case exists only to kill a false green

`tests/sizing-live-read.test.ts` guards a fatal row: a complexity change must move no demand digest. Those guards pass vacuously while no cell can carry a complexity at all — nothing changes, so nothing moves. The first case asserts the loader EXPOSES a declared complexity, and it is the one that is red.

THE SAME SHAPE IS THE NEGATIVE CONTROL IN THE ATTRIBUTION FILE. Grouping by a key nothing carries returns one bucket, and so does grouping by any word at all. This iteration once read that as evidence of an absence, and it is not.

## red_observed

- [x] tsp-the-lane-publishes-a-strength-and-starts-nothing
- [x] tsp-the-published-strength-is-the-same-on-every-host

## follow_up

THE BUILD ORDER IS THE CHUNK DRAWING'S AND ONE CHUNK IS FIRST. `complexity-stays-out-of-the-ledger` turns `tests/sizing-live-read.test.ts` green, and it is the fatal row guarding three open records.

TWO SHAPES OF FALSE GREEN WERE FOUND WRITING THESE AND BOTH ARE NOW CASES RATHER THAN NOTES. A guard that passes because the feature it guards does not exist, and a presence assertion that passes because the store keeps keys it never declared. Both read as coverage.

THE SECOND ONE IS THE ONE A CHECKLIST WOULD NOT HAVE CAUGHT. It was found by RUNNING the file and reading which cases passed, which is the whole reason this state runs the tests rather than asking whether they were written.

WHAT verification MUST NOT INHERIT: the two inspection checklists are declared unobservable HERE and are owed a real run THERE, against a built path. A spec that was accepted as unfalsifiable before the build and never re-run after it is coverage that never happened.

ONE DESIGN DECISION WAS TAKEN WHILE WRITING THESE and it went back into the spec rather than into the code. A pair is two ordinal figures and a rung is one position, so the mapping needs a rule for the corner. The rule is the higher of the two, and `dsp-the-sizing-block` now carries it with its argument.

## anything_else

