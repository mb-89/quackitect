---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-waits-on-events/gate
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
point: gate
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: go-waits-on-events
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: e0650f82901381d24e3bba2624f8708b9b5fde88
    hash_after: e0650f82901381d24e3bba2624f8708b9b5fde88
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/clock passes; green, src/q passes
      - name: check
        exit: 0
        said: "    3.5  test/contract/runme-road.test.js ./RUNME.sh hands get to quack, which reads the verbs slice off the index"
    inputs:
      - name: ask
        hash: f53b29bb445a80d8
        size: 249
    def: d6b1f4f6b79afd91
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

tests-red seen says the build stops on q.Clock undefined, yet the tests compile and fail on the waiterOf assertion, and TestTheRealClockAndTheFakeAreAQClock stands nowhere; once q.Clock lands, a test asserts New() and NewFake both stand as a q.Clock

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/clock src/q

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

q.Clock now stands in src/q/clock.go, so the build compiles. TestTheRealClockAndTheFakeAreAQClock in src/modules/clock/clock_test.go asserts that clock.New() and clock.NewFake both stand as a q.Clock. TestTheFakeAndTheWallAreAQClock in src/q/clock_test.go asserts the same of qtest.NewFake and qtest.Wall, because a test under src/q imports nothing past q and qtest. go-waits-on-events landed both, and this point closes on that evidence.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the named test stands in the clock module and passes, beside a sibling under src/q for the test-side clocks
the change reveals no cleanup
q.Clock stands once, in src/q/clock.go, and each test points at its ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
