---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: every-landing-takes-a-verb/design/review
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-verbs-land-whole
parent: every-landing-takes-a-verb
record:
  - step: do
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: 1c0a6f6089b59089d12293f419451ba9cee5a6a4
    hash_after: 0e413741318f405ffba4e36f914581fea1e47915
    answered:
      - name: tests
        exit: 0
        said: green, 39 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`verbLine` in `.claude/skills/level0/lib/bash.js` lists what the door refuses, and the approach leaves it standing.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/bash.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`verbLine` names every git command that writes the repository, and the verb standing for it. That clause covers both refusals the parent's approach adds: a git write, and `git mv` under the tickets. The parent's change wrote the clause, and the `verbLine` case in `test/level0/bash.test.js` now holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The change is the assertion the ask wants held, and the line stood written already.
- The change reveals no cleanup.
- The clause stands once, in `verbLine`, and the case matches it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
