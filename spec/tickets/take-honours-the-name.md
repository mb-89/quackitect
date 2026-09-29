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
group: loose-fixes-4140d51
step: do
record:
  - step: do
    hand: box d84ce7ff23d8 · claude-code-remote
    hash_before: 9fd261fcabc3fbb1a3a99360b8e00b2c7ff88653
    hash_after: 9fd261fcabc3fbb1a3a99360b8e00b2c7ff88653
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: c99e302809f354ec
        size: 990
      - name: [[spec/design_output/work]]
        hash: 8c9ad0df03f072da
        size: 40393
    def: df12650931d480c9
reason: done
---

# Ask

A take naming a branch lands on that branch, or refuses. The name wins over
the branch this box holds. [[spec/design_output/work#the-take-writes-the-record]]

- A held branch standing done, merged or stale drops its hold, and the take
  goes on to the named branch.
- A held branch standing in work refuses the take with exit 1, naming both
  branches and the command handing the held one back.
- A take hands no brief for a branch other than the one it names.

Gain: a cloud box that held finished work takes the branch the routine sends
it to.

Breaks: a box that once held a branch answers every named take with that
branch's brief. The routine then works a finished ticket, and the named one
waits.

Done when:

- `./RUNME.sh test test/level0/work-held.test.js` is green. A case there
  takes a named branch on a box holding a done branch.
- A case in the same file takes a named branch on a box holding a branch in
  work, and meets a refusal naming both.
- `./RUNME.sh check` exits 0.

# do

<!-- makes the change, with the test that covers it -->

## tests

./RUNME.sh branch test test/level0/work-held.test.js

## check

./RUNME.sh check

## says

`take` read the hold before the name. A box holding any branch handed that
branch's brief back, and the name only added a note. So a cloud box that once
held a finished branch worked it again, in place of the branch the routine named.

The take now reads the name first. A take naming nothing, or the held branch,
hands the held ask again. A take naming another branch asks `pastHold` how the
held branch stands. A branch standing `done`, `merged` or stale drops its hold,
and the take goes on to the name. A branch still in work refuses the take, and
the refusal names both branches and the release verb.

`heldHere` and `pastHold` move to `src/scripts/work-held.js`, and the take
cases move to `test/level0/work-held.test.js`. Both files they left stood
at the line ceiling.

## checked

- the change follows the ask: the name decides, and a hold in work refuses
- the cleanup it reveals: the held-branch reads and the take cases move to files of their own
- the table in the work design states the three roads once, and the ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
