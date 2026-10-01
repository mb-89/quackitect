---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-doors-process-stands/gate
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
group: module-processes-land-in-shadow
parent: the-doors-process-stands
record:
  - step: do
    hand: box 36586c1b4c37 · claude-code-remote
    hash_before: dc1e947a125dfa11d5b7d2bc667df902ce7572c6
    hash_after: dc1e947a125dfa11d5b7d2bc667df902ce7572c6
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/watchdogs-span-the-processes.md:267:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 5e4ad40d232bc63e
        size: 182
    def: 0a37fc7c2705ab37
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

model#a-process-ends says the IO process's exit restarts it, and names none of its names; the ask reads them at their built-in values marked not provided, so the table gains that row

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The table under model#a-process-ends names what the index meets when a part ends. Its row for the IO process named the restart alone, and now names its names at their built-in values, marked not provided, as the module process row does. The change also met a red check: the check read its working delta through the git door, which trims the output. A diff ending on a blank context line lost it, so git apply on the fresh box read the patch as corrupt. deltaOf in src/scripts/cli-check.js now reads the delta through the process door untrimmed, as the commit verb does, and a case in test/level0/check-server.test.js holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the IO process row gains its names at their built-in values, marked not provided
- the cleanup the change reveals is in the change: the check read a trimmed delta, and deltaOf now reads it whole
- every fact the change adds stands in one place: the mark stands in the model table alone, and the delta read in deltaOf

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
