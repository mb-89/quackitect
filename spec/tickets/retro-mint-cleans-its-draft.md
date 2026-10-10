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
group: tickets-keep-their-chapters
step: do
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 2c43fd24778fc6a38d04d89825dd1423c92dc951
    hash_after: 830c95a49f2f8aa10bc58399f8adcde4a94d257e
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   66.4  in all"
    inputs:
      - name: ask
        hash: cabce11c397e7a38
        size: 435
    def: df12650931d480c9
reason: done
---

# Ask

retro mint can be run again after an ask write or a ticket open fails, because it removes the draft it minted, as retro new does.

A refused open leaves the minted draft behind, and every rerun of retro mint refuses with mint-path-stands until somebody deletes the draft by hand.

- go test ./src/quack -run TestRetroMint passes a case where open fails once, the draft leaves, and the rerun mints the ticket
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/retro_classes_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`retroMintOne` removes the draft it mints where the ask write or the open fails, as `retro new` does, so a rerun mints the same name where it met a draft standing. The case `TestRetroMintCleansARefusedDraftAndMintsNothingTwice` refuses the first open and asserts the draft leaves. A rerun then mints the ticket, and a third run mints nothing twice. The case takes the place of the second-run case, which ran the verb twice over the same tree.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the removal stands once, on each failing road of `retroMintOne`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
