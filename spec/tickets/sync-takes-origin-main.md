---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
step: do
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: 4ec6444d5001a4ec9812bb6abf5598989ef79c0c
    hash_after: 4ec6444d5001a4ec9812bb6abf5598989ef79c0c
    answered:
      - name: tests
        exit: 0
        said: green, 43 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/queue-approach-sentence-split.md:61:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 9e155ab4ed5bf189
        size: 704
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A desk session that commits on `main` takes the remote's `main` in through a verb. So its push lands after another box pushes first.

Today a desk whose `main` parts from the remote stands with no road to push:

- `branch sync` refuses on `main`
- `branch merge` takes work and cloud branches alone
- level zero refuses `git pull` and `git merge`

Done when:

- `./RUNME.sh branch sync` on `main` merges `origin/main` in. A case in `test/level0/work-sync.test.js` decides it
- on a conflict it stops, names the files, and leaves the merge to the hand. The same file holds a case for it
- on a work branch it takes `main` in as it does today. The same file holds a case for it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/work-sync.test.js test/level0/bash.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

On main, branch sync merges origin/main into the desk's main, and stops on a conflict with the files named. A work branch takes main in as before. The refusal of git pull names the verb on main too. A desk committing on main now takes a push from another box in, and pushes after it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the first run merged the lead session's phase 2 groups in
- the cleanup it reveals is a note of its own: the commit verb stages the old path of a renamed draft, which git never tracked
- the rule stands once, in sync in src/scripts/work-stands.js, and the design chapter points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
