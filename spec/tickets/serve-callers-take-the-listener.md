---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-index-answers-v1/design/review
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
parent: the-index-answers-v1
record:
  - step: do
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 2c3c441245639c53c201bafbde1a16fbad20d94f
    hash_after: 2c3c441245639c53c201bafbde1a16fbad20d94f
    why: the-index-answers-v1 answers this ask
reason: answered
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`start_test.go`, `topic_test.go` and `ops_test.go` under `src/index` call `Serve` too. Each takes the second listener the change adds.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test src/index

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`Serve` keeps its signature in [[spec/tickets/the-index-answers-v1]]. The standing file names the port of `/v1`, and `stop` closes both listeners. So every caller of `Serve` stands as it is, and each test reads the second port off the standing file.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change departs from the ask: no caller changes, because `Serve` keeps its signature
- the change reveals no cleanup
- the standing file owns the port, and each test reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
