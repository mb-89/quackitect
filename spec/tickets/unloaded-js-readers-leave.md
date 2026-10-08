---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: javascript-leaves/accept
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
group: javascript-leaves
parent: javascript-leaves
record:
  - step: do
    hand: box ba1101ec7b2d · claude-code-remote
    hash_before: d2fc6298450fe3824c0e7e873e39f6511027eb14
    hash_after: f2775507000f4ee1da761aad3fc261c43ed1bf8f
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   77.2  in all"
    inputs:
      - name: ask
        hash: 8dfcf8934bb7f2e2
        size: 230
    def: de2763c66d557865
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

.claude/skills/level0/lib/vale.js and src/engine/tools.js stand loaded by their own tests alone, as their rows in the doors note say. Delete each with its test and its row, and point the Go comments naming them at their Go owners.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The vale reader under the level zero lib and the survey reader under src/engine leave with their tests and their rows in the doors note. No road loaded either: only their own tests did, so they kept code and tests alive that nothing ran. The Go comments that named them now stand on their own, and the tools note names the verb that surveys the box.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both readers, their tests and their rows leave, and the Go comments point at their Go owners
- the cleanup the change reveals, the tools note naming a deleted file, rides in the same change
- the change adds no fact: it deletes two rows and two files, and the doors note stays the one list

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
