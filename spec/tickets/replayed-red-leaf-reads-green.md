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
group: the-engine-fixes-its-faults
step: do
record:
  - step: do
    hand: box 6150d1759159 · claude-code-remote
    hash_before: d46b9df0db25900615a09bd38b4bec43e53e3ed7
    hash_after: 0f44d7006964e521aa6259fa12a01e22b15512f1
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "  101.2  in all"
    inputs:
      - name: ask
        hash: 62c5ea6181ba67c7
        size: 328
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: the ticket closes on the Go port, which already walks a route past a landed red leaf.

<!-- breaks, as text: what breaks if it is never done -->
breaks: nothing in the code. A draft edit past `implement/change` marks `design/tests-red` stale, and `keptRed` in `src/pull/pull_kept.go` keeps the leaf once a later leaf passes.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change the ask names -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/pull/pull_kept_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Nothing in the engine changes. The fault the ask names stands in the JavaScript, and the Go port walks past it: a draft edit past `implement/change` marks the red leaf stale, and `keptRed` keeps it while its tests stand. A new Go case drives `keptRed` over the kept leaf and the leaf whose test is gone, and the Discussion lists each function on the road.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, which closes on the evidence and a case proving it
- the missing case lands in this change, so no note carries it
- the evidence stands once, in the Discussion, and this answer points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The fault stands no longer. The ticket names the JavaScript route, and the Go port walks past the red leaf:

- `inputRead` in `src/pull/pull_stale.go` marks the red leaf and `gate` stale, and leaves `implement/change` alone
- `advanced` in `src/pull/pull_hand.go` calls `keptRed`, and so does `stepOn`
- `keptRed` keeps the leaf while its tests stand and a later leaf passes
- a rename rewriting the draft takes the same road

`TestALandedRedLeafStandsKeptWhileItsTestsStand` in `src/pull/pull_kept_test.go` drives `keptRed` over both sides: the kept leaf, and the leaf whose test is gone.
