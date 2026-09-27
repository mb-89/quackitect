---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: holds-leave-with-their-ticket/accept
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
parent: holds-leave-with-their-ticket
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: 131dca89fea2795ae741c2865c1e89ab5dc19768
    hash_after: 131dca89fea2795ae741c2865c1e89ab5dc19768
    answered:
      - name: tests
        exit: 0
        said: green, 50 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:265:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 4cf7ce1e34b290c6
        size: 398
    def: fe5b8f61b2a01da0
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`graphOf` in `src/extension/lib/route-host.js` and `personal` in `src/extension/lib/fields.js` read the hold a person keeps on a closed ticket. The page then reads it held, and the fields draw marks, until the next pull. The hold chapter of `spec/design_output/pull.md` says the readers skip it. The lens still reads and watches the older `hold.json`, which the tests-green says leaves the readers.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/lens.test.js test/level0/route-host.test.js test/level0/fields-to-fill.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The editor reads the holds through `holdsIn` in `src/extension/lib/lens.js`, and `holdsIn` now skips a hold whose ticket file reads closed, as the hold chapter of `spec/design_output/pull.md` says. So the route page draws a closed ticket unheld, and the fields draw no mark over it. `holdsIn` and the watches read the hold folder alone, and the older `hold.json` leaves them, since no verb writes it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one reader in lens.js serves graphOf, personal and the lens, and a case in each test file holds it
- the change reveals one cleanup, the unused HOLD export in folders.js, parked as the note older-hold-file-leaves-folders
- the rule stands once, in the hold chapter of spec/design_output/pull.md, and the code points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
