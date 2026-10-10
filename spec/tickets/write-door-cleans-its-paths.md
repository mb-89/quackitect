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
group: tests-and-ci-hold
step: do
record:
  - step: do
    hand: box 54da26a4513f · claude-code-remote
    hash_before: 32f41f021dda5cc9f74eed314c4186f5d5fbee39
    hash_after: 32f41f021dda5cc9f74eed314c4186f5d5fbee39
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/write passes
      - name: check
        exit: 0
        said: "   73.2  in all"
    inputs:
      - name: ask
        hash: 1e8b3627ae4249af
        size: 685
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`RelativeTo` in `src/modules/hooks/write/door.go` strips the root by a raw string prefix, so a doubled slash or a dot-dot spelling of an in-tree path reads as outside, and the write door lets it through with no ticket. The door cleans both sides before it compares, and reads a result climbing out of the root as outside.

The gain is a write door that holds every spelling of an in-tree path.

Without it a non-canonical spelling lands a write in the tree with no ticket named.

- `RelativeTo` answers the tree path for a doubled slash and a dot-dot spelling of an in-tree file
- a path climbing out of the root stays outside
- the cases run under `go -C src/modules test ./hooks/...`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

RelativeTo in the write door stripped the root by a raw prefix, so a doubled slash or a dot-dot spelling of an in-tree file read as outside, and the door let the write through with no ticket. It now cleans both sides before the compare. A spelling of an in-tree file reads as its tree path, and a path climbing out of the root reads as the outside path it names, so Outside holds it. Four new rows in the RelativeTo table fail on the old code and pass on the new.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both sides cleaned, and a climb out of the root reads as outside
- the cleanup the change reveals: the door comment claimed it reads paths as relativeTo in the check does, and now says what it does; the check twin reads paths off its own walk, which stand canonical, so it keeps its raw compare
- the clean stands once, in RelativeTo, and every caller of the door reads through it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
