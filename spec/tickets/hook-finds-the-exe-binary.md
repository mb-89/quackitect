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
    hash_before: 33161d72f372b2984bb0c2bb6d7556ea84a994f5
    hash_after: eaf789991088e6cee74445c89b62c7441a9b3b9b
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    2.0  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: 3a10def3705e415a
        size: 170
    def: 1ccaf5115d7b59f8
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

both hooks name .se/.runtime/bin/se-index alone, while RUNME.sh takes se-index.exe first where it stands. Mirror that line in each hook, so a Windows desk keeps its gate.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/githooks_exe_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Commit ca8489011 gives .githooks/pre-commit and .githooks/pre-push the line RUNME.sh holds: where se-index.exe stands executable, the hook runs it in place of se-index, so a Windows desk, whose build writes the .exe alone, keeps both gates. The tree adds TestGitHooksTakeTheExeWhereItStandsAlone, which copies each hook into a tree holding only se-index.exe and asserts the hook runs it with its verb.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: each hook carries the RUNME.sh line word for word.
the cleanup the change reveals: none; the lookup stands in three shell entry points, which share no sourced file.
every fact stands in one place: the test points at the ticket, and the lookup adds no fact to a note.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
