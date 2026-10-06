---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-spawns-all-take-the-runner/gate
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
group: unfaked-doors-take-fakes
parent: quack-spawns-all-take-the-runner
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 240d51dcb0d14fcd66e2ff956fe9181741a0441e
    hash_after: f1951e257ade4df595c71cd8b9382f69ff7034b1
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "  100.7  in all"
    inputs:
      - name: ask
        hash: 6b8d9d3e675a8420
        size: 396
    def: 10d1e4d8ece57c93
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

done_when 1 names a grep for `exec.Command` under src/quack, and that grep still finds the git reads in command.go, vehicle_verb.go, retro_chapters.go, verb_lint.go and retro_collect.go, and the spawns in checkdoors.go and boxdoors.go. The draft narrows the line to the eight functions and parks the rest as a private note. Mint the git reads as a follow-up in the group, so the grep comes clean.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/git_reads_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The git reads gitRead, vehicleGit, retroCommitsIn, the listed disk Paths and retroCollectGitIn ran git through exec in place. Each now runs it through proc.Real, so the grep for exec.Command under src/quack finds the box and check doors and the eight spawns quack-spawns-all-take-the-runner moves, and nothing else. A guard in git_reads_test.go fails once one of the five names exec again. Each read keeps its answer: a nonzero code reads as the failed exit did, and gitRead keeps its span as the command Wait. The lsp case printing its runs with %q moves to %+v, since vet refuses %q over a command carrying a streams pointer.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, through proc.Real where the gate named the git door, since a seam for a fake waits on a case that reaches one
- the cleanup it reveals, the lsp format vet refused, rides the change
- the five reads stand once each, and git_reads_test.go names them in one table

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
