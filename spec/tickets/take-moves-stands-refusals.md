---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failures-and-the-sentinel/gate
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
group: failures-stand-registered
parent: failures-and-the-sentinel
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 72ab2328d671421812b6dbb5a0d4be25ef70b14a
    hash_after: b71cf7f01e11c5bece3e7db7829e092468862de0
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes; green, src/quack passes
      - name: check
        exit: 0
        said: "    1.5  test/contract/lint-twins.test.js the Go lint and the check's lint name the same finding lines"
    inputs:
      - name: ask
        hash: 24d53fcfbedce91f
        size: 232
    def: 16e0bdd9a976b893
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the take refuses through d.offTrunk and d.dirty in src/branches/stands.go, which the size list leaves out, and the red test refuses the git output and conflict notice warns in take.go that the design keeps as a refusal's detail rows

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/branches/take_failure_test.go src/branches/branch_test.go src/quack/branch_test.go src/quack/refusals_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The branch verbs' Doors take a failure.Registry, which src/quack/branch.go loads from spec/failures. Each refusal in src/branches/take.go raises its id through d.raises, and so do d.dirty and d.unpushed in stands.go and d.offTrunk in merge.go, which the take reaches through every guard. The git output under a refused claim stays a detail row beneath the message. The conflict notice after a take's sync raises take-sync-conflict, and the ask prints after it as before. Thirteen nodes stand under spec/failures, and desk-works-on-trunk serves the desk's take. TestTakeRefusalsNameTheirIds reads six ids off a fake registry, and the red case TestMovedRefusalsPassTheFailureDoor passes now. TestTheBranchDoorsLoadTheFailureNodes in src/quack/branch_test.go reads the registry the wiring loads.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: offTrunk stands in merge.go, not stands.go, and moves there; the git output and the conflict notice ride as detail rows of a raised refusal
- the cleanup the change reveals: unblock.go keeps a refuse of its own that prints free text, so the door's print takes the name raises; moving unblock rides a later slice
- every fact stands in one place: each remedy stands on its node, and the site keeps the message it builds

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
