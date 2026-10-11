---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: tests-green-names-the-ask/gate
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
group: handovers-and-light-work
parent: tests-green-names-the-ask
record:
  - step: do
    hand: box 2b095da7efc0 · claude-code-remote
    hash_before: fd8355ca9b7a2674e60cd7390d9d030ba15d150d
    hash_after: fd8355ca9b7a2674e60cd7390d9d030ba15d150d
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   81.8  in all"
    inputs:
      - name: ask
        hash: 422a89d892690c1f
        size: 442
    def: 4197ecd572d7ab20
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft adds `ask` to the `input` of implement/tests-green in spec/processes/standard.yaml, yet `wordingFields` in processRead names `does` and `gate` alone, so on the real route that leaf's def moves outside the wording and a ticket past tests-green still goes back, against done_when line 3; drop the input change or count `input` as unmoved, and make the case in src/pull/pull_stale_test.go reword the leaf's input as the real route does

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/quack/verb_mint_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The parent change keeps `input: design/tests-red` on implement/tests-green. So `does` and `gate` stay the only keys the reword moves, and the red case already rewords those. The parent Discussion records the call. The check was red on the new cases, so they now run in parallel. The light mint case stands alone in its red file. The standard case is one assertion in the first mint subtest. A repeated path-stands case is cut, so src/quack holds its line ratio.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask by its first branch: drop the input change
- the cleanup is in the change: the parallel calls, the ratio and the fixture marker
- the call stands once, under the parent Discussion

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
