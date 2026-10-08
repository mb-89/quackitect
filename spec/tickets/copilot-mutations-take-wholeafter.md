---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: copilot-hooks-run-in-go/gate
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
parent: copilot-hooks-run-in-go
record:
  - step: do
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: c2f21d2d7631aa231782afb7f8fe53b4f999cb8d
    hash_after: c4c68e153ec04fe9b4e7b4756d3f6ff556489e51
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/write passes
      - name: check
        exit: 0
        said: "   86.6  in all"
    inputs:
      - name: ask
        hash: ef3ffb9b6ba6b542
        size: 145
    def: 8ef89bb937e4b7cb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`Mutations` reads Edit, MultiEdit and Write through `write.WholeAfter`, and decodes the patch envelope alone, so one Go function applies an edit.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/write/mutations_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`Mutations` stops being a stub, and stands in `src/modules/hooks/write/mutations.go` beside `WholeAfter`. It reads each Copilot edit tool, checks the old string stands once, and applies the edit through `WholeAfter`. The patch envelope reads in the same file. The import rule refuses one module importing another, so the decoder leaves `src/modules/edits` for the package that owns the edit.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change follows the ask, and it moves the decoder, which the implement step of `copilot-hooks-run-in-go` reads.
- The uniqueness check stays beside the call to `WholeAfter`, which checks no match.
- The tool names stand once, and the write tools reuse the names the write package owns.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
