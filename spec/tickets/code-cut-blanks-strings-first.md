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
group: checks-and-index-read-right
step: do
record:
  - step: do
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: aade378924aad82c4fcb6fa7563eadf89abc6557
    hash_after: 418e8b6af5482e7051f3ad97403a983d20585850
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "   62.0  in all"
    inputs:
      - name: ask
        hash: 21e31757242ed53a
        size: 592
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a line holding `//` inside a string keeps its code, so `FunctionCeiling` measures each function whole and `DoorDeclares` reads a door standing after a URL.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `codeCut` in `src/modules/check/textfaults.go` cuts the trailing comment before it blanks strings, so `"https://x") {` loses its brace and every function after it measures short.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/modules/check/ -run TestCodeCutKeepsCodeAfterASlashedString` passes over a `functionsIn` case with a URL on a line opening a block, and an `isDoor` case with a URL ahead of `q.IO()`
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/check

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`codeCut` in `src/modules/check/textfaults.go` blanks strings first and cuts the trailing comment after, as `magicIn` does. A `//` inside a string now leaves the code after it, so `functionsIn` measures each function whole and `isDoor` reads a door past a URL. `TestCodeCutKeepsCodeAfterASlashedString` failed red on the old order and passes now.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch
- the check stays green with the longer measures
- the order rule stands in `codeCut` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
