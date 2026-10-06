---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: branch-done-opens-the-pr/gate
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
group: engine-verbs-hold
parent: branch-done-opens-the-pr
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: c7c16a7df10830d11747c21e0b9439fd7256decd
    hash_after: c7c16a7df10830d11747c21e0b9439fd7256decd
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 8deb4fa3474fb1df
        size: 204
    def: aeb558b18945ff5c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

running-work-takes-main-fixes adds updated, updateRow and its cases to src/branches/dispatch_fire.go and Dispatch. Sync before implement, and keep pullOpens beside updated so both read hubOf the same way.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/dispatch_level_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The update road the sibling running-work-takes-main-fixes adds has no code yet, so the collision stands in its plan alone. Its Discussion now names the pull road as it stands: the send door on d.Send, the token through d.pullToken and hubOf, and updated beside pullOpens. The sibling implement step reads it there.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the sibling has no code to sync against, so the ask lands as the three lines its implementer reads.
The change reveals no cleanup past the stale send argument in the sibling draft, which the same lines answer.
The pull road stands once, in pullOpens in src/branches/dispatch_fire.go, and the Discussion points there.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
