---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-check-ends-what-it-drops/gate
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
group: level-zero-smoke
parent: the-check-ends-what-it-drops
record:
  - step: do
    hand: box a694567529c5 · claude-code-remote
    hash_before: 4f57097cd22dd0f4be121464386069169219b7a0
    hash_after: e70f09bed585a882481b9351cc412784f7f63cb2
reason: became
successors: [the-index-outlives-the-check]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

ending_test.go builds under !windows, so the taskkill /T /F road in ending_windows.go meets no test while check.yml runs windows-latest; add a Windows case where a child and the process it starts both stand ended once the span ends, waiting on the pipe as the unix case does

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/ending_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

endsWhole now ends the child and every process it started when its span ends. On unix the child stands in a process group of its own, and its cancel kills the group. On Windows its cancel runs taskkill /T /F over the child tree. A Windows case drives the test binary as a child that starts a grandchild holding its stdout, each blocking on a pipe it holds, so no timer stands. The stdout reads to its end only once taskkill ends both. The Windows case runs on the windows-latest runner of the check, since no box here runs Windows. Here it vets and compiles under GOOS=windows, and the unix case passes.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and writes the helper the Windows case needs, which the parent approach names
the cleanup: none revealed
the helper variable stands once in the Windows case, as doorHelper stands in the unix one

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
