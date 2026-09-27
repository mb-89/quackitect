---
kind: [[ticket]]
state: closed
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: groups-carry-the-cloud-marker/design/review
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
record:
  - step: do
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: f9713f2c9db701ca9dd4c610a84b2d3632e96cbc
    hash_after: 73f6f0dd2c4e2058e840d11097559d390c007dff
    returns: 1
    why: the full check stops on a sentence past the cap under the approach of the-queue-moves-to-plan, which its draft round owns; the change itself lints clean
    answered:
      - name: tests
        exit: 0
        said: The rules pass.
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:122:99: Sentence: A sentence holds 25 words. Cut this one in two."
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: 7825ed108c050a09939ceb1e3eedcf881148493f
    hash_after: 6f3983125c16e1805d66599b5d8d8b6f73b98e7c
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/queue-approach-sentence-split.md:61:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 50ae9d0066952c30
        size: 250
    def: 95a53cdbde78eefb
parent: groups-carry-the-cloud-marker
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the `release` departure holds, because `release` writes `hash_after` and leaves the branch at `todo` in the cloud. Rewrite the row in `spec/rationales/git-stays-the-archive.md` to name the merge and the close alone, since the ask points at that note.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/work-cloud-marker.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The table in `spec/rationales/git-stays-the-archive.md` names the merge and the close alone as the verbs clearing the marker. What `release` does stands in its code and in `test/level0/work-cloud-marker.test.js`, the case this step runs.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the row naming the merge and the close stands, and the release row goes
- the change reveals no cleanup
- the change adds no fact, and drops one the code and its test already own

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The full check carries one warning, a sentence past the cap under the approach of [[spec/tickets/the-queue-moves-to-plan]]. That approach stands the engine's to write, so its draft round splits the sentence. `tests` here names the lint over the one note this step changes.
