---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-guard-refuses/gate
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
group: doors-declare-what-they-own
parent: the-guard-refuses
record:
  - step: do
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 05ddbfec966858e58c4b6696a9968272bf58a45a
    hash_after: e348907ef63f911220d9311bae3d132f25a1c4b9
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes; green, src/imports passes; green, src/quack passes
      - name: check
        exit: 0
        said: "   61.8  in all"
    inputs:
      - name: ask
        hash: bec45255f81e18a9
        size: 256
    def: 1ba1f1de37804f52
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

walksSays in src/modules/check/doors.go and walkLine in src/quack/verb_doors.go join the walk's doors, and a walk around no door reads 'walks around .' with an empty list. Word that case as a module no door declares. The draft's size leaves both files out.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/check src/imports src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A walk now words itself through owns.Walk.Says. A walk with doors reads 'time.Sleep walks around clock', as before. A walk around no door reads 'node:net is a module no door declares', where it used to end on an empty list. The lint, the doors verb and the Go analyzer each built the line in place, so all three call Says now, and so do the tree tests in src/owns. The lint's sentence says 'Reach it through a door', which reads true for a module no door declares as well. Today no walk comes without a door, so the doorless case is tested at Says alone. A case at the command line follows once jsWalks refuses an undeclared module, in the implement step of the-guard-refuses. The callers' tests now hold every word of the line they pin, in place of a substring. The test of Says stands in src/owns, which stays red on the three tests the-guard-refuses wrote at tests-red until its implement step, so this field names the three caller packages, and go test -run AWalk[SA] ./src/owns answers ok on the commit.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and takes in the third site the ask leaves out, src/imports/walkaround.go, which built the same line
the cleanup it reveals is in the change: the four tree tests in src/owns word a walk through Says, and the freed fmt import is gone
the wording stands once, in two constants in src/owns/owns.go, and every caller calls Says

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
