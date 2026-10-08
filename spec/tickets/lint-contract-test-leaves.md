---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-check-lint-runs-in-go/gate
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
group: lint-without-vale
parent: the-check-lint-runs-in-go
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: bb1c37aa46b1f27721cd7d43a57209d8612ca3ff
    hash_after: 69497039357551091074e09817ef2949bdea4859
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   83.0  in all"
    inputs:
      - name: ask
        hash: 950a41586b889eeb
        size: 257
    def: f3cc35d95a9c8980
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

test/contract/cli-read.test.js reads the lint's log rows off the source of src/scripts/cli-read.js, and the approach names it among the callers and leaves it out of size, so it breaks once lint leaves that file; drop its lint cases or the file with the rest

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/check_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`test/contract/cli-read.test.js` held one case, and it read the JavaScript lint's log rows off the source of `src/scripts/cli-read.js`. The lint leaves that file under `the-check-lint-runs-in-go`, so the case would break there. The file leaves whole now. The Go lint's cases in `TestLintVerb` assert both rows: debug where the rules pass, and warn where a rule breaks. Both pass under `go test ./src/quack/ -run TestLintVerb -v`. The file also holds the case `the-check-lint-runs-in-go` keeps red until its change lands, so the tests line names the check's cases, which run the lint verb's road.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the file leaves whole, the second road the ask names, because every case in it reads the lint
- the cleanup: no other file names the contract test, so nothing else moves
- one place: the Go lint's cases own the claim about the log rows

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
