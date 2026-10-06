---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: git-hooks-run-in-go/gate
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
group: javascript-leaves
parent: git-hooks-run-in-go
record:
  - step: do
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 2ab24e7eea4462649912bccacc4e0b01ce26b6c6
    hash_after: 2ab24e7eea4462649912bccacc4e0b01ce26b6c6
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "    1.9  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: c771a3d1365c7f61
        size: 143
    def: 1ccaf5115d7b59f8
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

.vale.ini carries a glob naming precommit and prepush, a caller the callers list misses. Drop both names from that glob when the scripts leave.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

! grep -nE 'precommit|prepush' .vale.ini && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Commit ca8489011 drops `precommit` and `prepush` from the `src/scripts` glob in `.vale.ini`, since both scripts left with that commit. The glob now names the five scripts that stand. The change touches no code, so the tests field greps `.vale.ini` for either name.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the glob names neither script.
the cleanup the change reveals: the names left in the tree stand in the header of `githooks.go`, in the test asserting the scripts gone, and in its golden, and each says the scripts left.
every fact stands in one place: the glob lives in `.vale.ini` alone.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
