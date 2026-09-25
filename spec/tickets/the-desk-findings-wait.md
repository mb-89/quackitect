---
kind: [[ticket]]
state: open
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
step: answer
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->
<!-- waits, as list: one line each, naming what stands still until the answer lands -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

How does the design of [[spec/tickets/a-desk-skips-cloud-branches]] answer the findings its second review names? Its design review fails the draft twice, and the findings stand under `Discussion`.

- a desk's guard against working a `work/` branch
- the desk merge of a cloud branch into `main`

- a desk's pull on a `work/` branch refuses and names `main`, and a test drives it
- a desk's commit on a `work/` branch refuses and names `main`, and a test drives it
- a desk's `./RUNME.sh branch merge <name>` takes a cloud branch into `main`, and a test drives it
- `./RUNME.sh check` passes

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

- [[spec/tickets/a-desk-skips-cloud-branches]] hands this over at `design/person-1`, which waits for a person.
  - design/review fails back 2 times, on the findings below.

The first finding reads the road a desk pull takes:

- `pull` in `src/scripts/pull.js` reaches `it.ready()` inside the take block, on a desk alone.
- `it.ready()` runs `readyToMerge` in `src/scripts/work-review.js`.
- `pull#an-empty-queue-hands-cleanup` and `test/level0/ready.test.js` depend on that road.
- Say whether a desk pull still calls `it.ready()` before the hand-out, and list `readyToMerge` as a caller.

The second finding reads the take cases:

- `test/level0/work-doors.js` hands every case `env: {}`, so each take case drives `take` as a desk.
- The take cases are the `work(ROOT, ["take"], ...)` calls in these files:
  - `test/level0/work.test.js`
  - `test/level0/work-group.test.js`
  - `test/level0/work-orphan.test.js`
- List them as callers, and name how they reach a cloud box once `take` refuses on a desk.

The other findings:

- `test/level0/work-group.test.js` asserts that a desk pull takes a marked group and a named one. List it beside `test/level0/pull-unbound.test.js`.
- `onDesk` reads the cloud as `pushed` does, while `src/bridge/bash.js` reads it through `onACloud`. Name the one read the Bash door guard and the verbs share.
