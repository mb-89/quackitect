---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-guard-reads-door-declarations/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: a-guard-reads-door-declarations
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 9642d5f077559c6c400d4fbbac4d2e2c8721f148
    hash_after: dc319cc3eab2c5ca396216c029192f4019f880b4
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes; green, src/owns passes; green, src/imports passes
      - name: check
        exit: 0
        said: "   89.3  in all"
    inputs:
      - name: ask
        hash: abe3f8c53a9703eb
        size: 431
    def: ce98b9e976552e83
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft's tests list names src/imports/imports_test.go and src/quack/lsp_test.go, while the red cases stand in walkaround_test.go and src/quack/lsp_doors_test.go, and its size list misses src/quack/verb_doors_test.go and lsp_doors_test.go; the done_when line naming src/modules/lsp reads as met by src/quack/lsp_doors_test.go, because only quack wires the real check module into the lsp IO module, and the accept gate takes it so

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack src/owns src/imports

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The guard ticket's draft named test files the red cases left, and its size list missed two files. Its Discussion now maps each named case to the file it stands in, adds the two files to the size, and says why `src/quack/lsp_doors_test.go` meets the line naming `src/modules/lsp`: only `src/quack` wires the real check module into the lsp IO module.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change departs from the ask in one place: it writes under Discussion, since a hand writes nothing under another leaf, and the draft keeps its record
the cleanup: none further; the named test packages stand green
one place: the mapping stands once, in the guard ticket's Discussion

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
