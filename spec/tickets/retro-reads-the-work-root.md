---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: retro-verbs-run-in-go/accept
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
group: retro-verbs-run-in-go
parent: retro-verbs-run-in-go
record:
  - step: do
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: fe06529f409e1967e25545a0fef52e2cbc594ba2
    hash_after: fe06529f409e1967e25545a0fef52e2cbc594ba2
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   68.3  in all"
    inputs:
      - name: ask
        hash: e9941cc335b25c8a
        size: 216
    def: d18d07ca40f70311
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

retroRoot in src/quack/retro_home.go reads index.Root and skips SE_WORK_ROOT, which the old road read as it.work; a stub run then reads and writes the vehicle tree, so retroRoot takes the work root first, with a case

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

The retro verbs read the tree root alone, and skipped the work root the old road read first. A stub run then read and wrote the vehicle tree. The root a retro verb works under is now the folder SE_WORK_ROOT names, then the tree root. TestARetroHomeReadsTheWorkRoot holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the cleanup it reveals: none, every retro verb reaches the root through the one function
- the fact stands once: the work root name is the shared workRoot constant

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
