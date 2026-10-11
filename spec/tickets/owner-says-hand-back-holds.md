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
group: branches-and-pull-report-truly
step: do
record:
  - step: do
    hand: box 8339730da099 · claude-code-remote
    hash_before: c635090d3aedd0f3df32d1e7936bae583536c73a
    hash_after: c635090d3aedd0f3df32d1e7936bae583536c73a
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   99.7  in all"
    inputs:
      - name: ask
        hash: 0027332a1d7a50d3
        size: 442
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a hand the owner sends into a person's step hands it back with the call the pull prints.

<!-- breaks, as text: what breaks if it is never done -->
breaks: the hold lands under the hand carrying the owner's word, and the printed hand-back carries no `--owner-says`. The hand-back then finds no hold, or meets the person-step refusal until the leaf fails back.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/pull/ -run TestAnOwnerSentHandBacksWithThePrintedCall` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_hand_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A pull run with `--owner-says` holds its step under the hand carrying the owner's word. The hand-back it printed carried no `--owner-says`, so that call found no hold. `backCall` in `src/pull/pull_chapter.go` now prints every hand-back call, and adds `--owner-says` where the pull ran with it. The chapter's two calls and the call `pull-hand-holds` prints read through it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the owner's hand hands back with the call the pull prints
- the change reveals no cleanup
- the fact stands once: `backCall` alone writes a printed hand-back call

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
