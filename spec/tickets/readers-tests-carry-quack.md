---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-prose-checks-stand-alone/gate
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: node-leaves-the-boxes
parent: go-prose-checks-stand-alone
record:
  - step: do
    hand: box 10b884eb9cae · claude-code-remote
    hash_before: 76abc5b31a14b7121b8db891054d5f66119f888e
    hash_after: 76abc5b31a14b7121b8db891054d5f66119f888e
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-webview-ships-prebuilt.md:262:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 08f7f293da5c63ea
        size: 93
    def: 3199a5dc27f6d7b0
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

test/level0/one-reader.test.js hands readsText rows, and its fake disk holds no quack binary.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/one-reader.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The one-reader lint cases plant a quack binary on the fake disk, and the fake process answers `quack prose` through `keepsProse`, which hands every finding back. The Go prose checks now veto each reader's rows, so a case with no quack on its disk reads no veto and drops what the reader found. The change landed in `c4bfe94f8`.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the fake disk holds quack, and the rows reach the reader whole
- the cleanup stands in the change: the case imports `quackUnder` and `keepsProse` from the shared `quack-doors.js`
- the fake quack lives once in `test/level0/quack-doors.js`, and this case imports it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
