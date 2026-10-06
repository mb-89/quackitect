---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: javascript-reaches-through-doors/gate
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
parent: javascript-reaches-through-doors
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: a746b9f3a5a93e8274e294e1c69be43c4a4a8e07
    hash_after: a746b9f3a5a93e8274e294e1c69be43c4a4a8e07
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "  119.1  in all"
    inputs:
      - name: ask
        hash: 7b0b0b1b7c273313
        size: 403
    def: 42cfda0a032b94c3
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`./RUNME.sh doors` prints a declaration only through its `contract` line in `walksOver`, so a page or prototype declaration with no contract test stands silent, and no red case decides the second done_when line; make the verb print each declared outside and its files, with a red case in `src/quack/verb_doors_test.go`, and list each prototype file under `files`, since `files` takes files and no folder

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_doors_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A declaration takes an outside key. With it set, its names stand owned inside its own files and nowhere else, so no other file reads it among the doors it walks around. The doors verb prints each of its files as standing inside that outside. The page bundle and the prototype take the key, and the prototype lists each file under files.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change departs from the ask in one place: an explicit outside key, since a declaration with no contract also covers Go modules missing theirs
the cleanup stands in the change: the declarations drop report, since an outside claims nothing past its files
the outside key stands once in spec/design_output/doors.md, and the code points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
