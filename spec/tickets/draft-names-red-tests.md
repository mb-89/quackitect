---
kind: [[ticket]]
state: closed
point: gate
todo: false
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: v1-takes-a-run-secret/gate
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
process: [[spec/processes/trivial]]
process_hash: 2a00b62f7c4bc60b
group: hooks-v1-hold-the-line
parent: v1-takes-a-run-secret
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: 5153e97af365f87551705ded80c725fb1cd6e033
    hash_after: 5153e97af365f87551705ded80c725fb1cd6e033
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/q/tool passes; green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "   98.7  in all"
    inputs:
      - name: ask
        hash: 38a00d2a8c9845c5
        size: 89
    def: be9d938c0443b338
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The draft's test files and names differ from the red ones, so the draft should name them.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/index src/q/tool src/modules/hooks

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The red tests stand where the build reads them. Each one passes now:

- `src/index/secret_test.go`
- `src/q/tool/tool_test.go`
- `src/modules/hooks/command/findings_test.go`
- `src/modules/hooks/hooks_test.go`
- `test/level0/editor-doors.test.js`

The draft's file names give way to these. The change landed in 9e5aadc17 and 411abd680.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: each red test names its own file
- the cleanup the change reveals: none
- the list stands once, under the ticket's tests-red evidence

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
