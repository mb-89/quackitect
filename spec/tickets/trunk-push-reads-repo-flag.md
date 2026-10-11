---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass
    from: hooks-v1-hold-the-line/accept
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "stop when the tests cover every rule of the ask and pass, and leave working code alone"]
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
process_hash: 2a00b62f7c4bc60b
group: hooks-v1-hold-the-line
parent: hooks-v1-hold-the-line
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: 9e349c4fd6af18c85a61a050adab83f00af2b1e2
    hash_after: 994dd3c265978a7c140738e0eb31a9a183134c55
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/command passes
      - name: check
        exit: 0
        said: "  104.5  in all"
    inputs:
      - name: ask
        hash: 1e1db91c4e85794c
        size: 141
    def: 0fb8708642fa5971
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`pushRefsOf` drops the first plain word as the remote. Where `--repo` names the remote, `git push --repo=origin main` reads as no trunk push.

# do

<!-- makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks/command

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`pushRefsOf` in `src/modules/hooks/command/trunk.go` reads a `--repo` flag, spelled with `=` or with its value after a space. Where it names the remote, every plain word past the verb reads as a ref. `git push --repo=origin main` then meets the trunk refusal again, as the regex reading before it did. The change landed in 994dd3c26.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestLandsOnTrunkReadsTheBridgesLanding` refuses both spellings onto main and passes a work branch
- the cleanup the change reveals: none
- the flag's name stands once, as `repoFlag` in `trunk.go`
- the tests cover the two spellings the ask names and the work branch beside them, and the parse stands as it was elsewhere

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
