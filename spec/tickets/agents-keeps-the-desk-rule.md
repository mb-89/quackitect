---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: groups-land-through-pull-requests/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-cloud-works-its-queue
parent: groups-land-through-pull-requests
record:
  - step: do
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 2e873fc065299751ce7780cd2445104dc5978daa
    hash_after: 2e873fc065299751ce7780cd2445104dc5978daa
    answered:
      - name: tests
        exit: 0
        said: green, 58 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:271:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 6395c2da0b6d47a5
        size: 155
    def: c1e6301a5c8b9caf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

AGENTS.md says a session opens no pull request; the edit keeps that for a desk and names the work skill as the one road opening one, so the two lines agree

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch.test.js test/level0/work.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

AGENTS.md keeps a desk session off pull requests, and names the work skill as the one road that opens a group's pull request. The change landing groups through pull requests already carries that edit. The check stood red on the dispatch test file past its line ceiling, so the dispatch helpers move into test/level0/dispatch-fixtures.js, and work.js drops an import nothing reads.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the edit follows the ask, and the discussion notes the ceiling fix the red check forces
- the ceiling split and the dead import ride in this change
- the dispatch helpers stand in one fixture module, and both halves import it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
