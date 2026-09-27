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
    hash_before: 5a61dd0bd173a55b8516a92fc15c70b492905dc7
    hash_after: 5a61dd0bd173a55b8516a92fc15c70b492905dc7
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`Snapshot.Stale` stands now. So `GET /v1/values` answers `stale since <time>` beside the value, per [[spec/design_output/watchdogs#a-stale-mark]].

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

The change of [[spec/tickets/the-index-answers-v1]] lands it. `valueOf` reads `Snapshot.Stale`, and the answer carries `stale` with its time. `TestV1ReadsAStaleName` covers it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, inside the parent's change
- the change reveals no cleanup
- the watchdogs note owns the stale mark, and the code points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
