---
kind: [[ticket]]
state: closed
group: the-verbs-answer-their-asks
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box fb2b49fba485 · claude-code-remote
    hash_before: 8d6a2c525f10aa659929f4cf8b8fb4f5d87b2022
    hash_after: 8d6a2c525f10aa659929f4cf8b8fb4f5d87b2022
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 3 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
reason: done
---

# Ask

The split verb cuts the file a caller names, and refuses where none stands.

`splitVerb` takes the first token outside a flag as its source. A call naming
no source takes its first target as one, so the dry run names that path twice
and a cut writes over it.

- a call naming no source comes back refused, with the line saying so
- a source naming a target comes back refused too
- `test/level0/split.test.js` drives both, and `./RUNME.sh test` covers them

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

`sourceOf` in `src/scripts/split-verb.js` reads the source as the first word
standing outside a flag and outside a flag's value. A call naming no source
comes back refused with the line saying so, and the usage under it. A source
naming itself as a target comes back refused too, before anything writes.

| the call | what stood | what stands |
|---|---|---|
| no source, one target | the target reads as the source, and a cut writes over it | refused, with the usage |
| the source among the targets | the cut writes over what it reads | refused, before any write |

The design line stands under [[spec/design_output/level0#a-verb-cuts-the-file]].

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: both refusals stand, and `test/level0/split.test.js` drives each
- the cleanup the change reveals is in the change: the help flag answers before the source reads
- every fact stands in one place: the design note says the rule, and the code points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
