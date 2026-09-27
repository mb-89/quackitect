---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: operations-and-leases-land/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-foundation-lands-unchanged
parent: operations-and-leases-land
record:
  - step: do
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: af0791a43353815af9cfe53fffb467fdc683664f
    hash_after: e6d428a86b3346925720048b8601fd33ceb144ab
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes
      - name: check
        exit: 0
        said: "spec/tickets/sqlite-runs-pure-go.md:111:1: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

add `q.Op` and `q.Writes` beside `q.Deadline` in `src/q/q.go`. An action then declares its handle and its write, and the writer queue gains a caller.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test src/q

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`q.Op` and `q.Writes` stand beside `q.Deadline` as options, so an action declares its handle and its write at registration. `Store.Declared` answers what the active provider of a name declares. The writer queue of the parent reads it to queue a writing operation.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and adds `Store.Declared` so a caller outside `q` reads the options
- the change reveals no cleanup
- the options point at the operations note, and no note repeats them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
