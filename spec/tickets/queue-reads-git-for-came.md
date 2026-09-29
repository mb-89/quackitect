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
process_hash: d1a6e26348695e24
step: do
group: loose-fixes-99f4547
record:
  - step: answer
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: 74e5de3d4536b445ec25236f6806ac6f77f1b0d4
    hash_after: 74e5de3d4536b445ec25236f6806ac6f77f1b0d4
    inputs:
      - name: ask
        hash: e49307b278056398
        size: 696
      - name: [[spec/tickets/queue-reads-when-tickets-came]]
        hash: 040649aa2de41581
        size: 2275
    def: 2280015d497a3abd
---

# Ask

The box takes this call: `queue.stood` stays wired `built-in`, so the day weight scores zero on the new queue path, and a git IO module later answers the time each path came in, off `git log`. No ticket front carries a time, and the file table's `Changed` moves on every edit, so no source without git stands. The open-tasks count reads no score, so the shadow stands unmoved. The owner takes the call, or names a source of the time that reads no git. The question comes from [[spec/tickets/queue-reads-when-tickets-came]].

- the day term of the new queue order, which scores zero until a source stands

- the answer stands under answer, and `./RUNME.sh ticket yours` no longer names this ticket

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

The box takes the call as the ask states it. queue.stood stays wired built-in, so the day term of the new queue order scores zero. A git IO module later answers the time each path came in, off git log. No other source holds: a ticket front carries no time, and the Changed column of the file table moves on every edit. The open-tasks count reads no score, so the shadow stands unmoved meanwhile.

Weighed: a front field for the time costs a write on every mint and drifts from git, and git already holds the answer. Assumed: a fix group builds no new IO module, so the git source waits for the owner to order it as a feature group.

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

<!-- what anybody adds, at any time, on this ticket -->
