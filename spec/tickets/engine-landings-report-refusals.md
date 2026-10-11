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
    hash_before: d1cc16db1b5ff5213eead527a40a91c26c949a1b
    hash_after: d1cc16db1b5ff5213eead527a40a91c26c949a1b
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   91.4  in all"
    inputs:
      - name: ask
        hash: ab2741cdff2bab5e
        size: 425
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: the engine hands out a leaf only over a step move that lands, and names the refusal where one stops it.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `advanced` in `src/pull/pull_hand.go` drops the result of `landedAlone`. The hold names a leaf the ticket on disk lacks, so the hand-back reads stale and the cause stays hidden.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/pull/ -run TestARefusedEngineLandingHandsNoLeaf` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_landed_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`advanced` in `src/pull/pull_hand.go` dropped the answer of `landedAlone`. A skip or a children pass that git refused still handed out the next leaf, while the ticket on disk stood at the old step. `movedAlone` now lands each engine step move. On a refusal it puts the held text back and answers why, and the pull names that reason in place of a leaf. The other callers that drop a landing's refusal stand as the private note `engine-repairs-drop-refusals`, which the retro decides.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: no leaf goes out over a move that never landed, and the refusal stands named
- the cleanup stands as a note of its own: `engine-repairs-drop-refusals` names the four repair paths
- the fact stands once: `movedAlone` alone lands the engine's step moves in `advanced`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
