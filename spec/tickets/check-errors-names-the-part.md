---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: check-verbs-run-in-go/accept
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
group: check-verbs-run-in-go
parent: check-verbs-run-in-go
record:
  - step: do
    hand: box bf0e991d1270 · claude-code-remote
    hash_before: fc6024dbfded04f936791c77b1221e908aed9b45
    hash_after: a7e0f619282ea90e4404cc9efae730cc3789d358
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   47.7  in all"
    inputs:
      - name: ask
        hash: 9026a413d865506c
        size: 103
    def: 10060d5272d03a03
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

under --errors a quiet red part drops why it failed, and part lines reach the stdout the merge hands on

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

Under check --errors a part the check hands a verb ran quiet, and its output went nowhere. So a stale projection or a door with no contract test exited 1 under the line naming no red case. verbOver now builds the verb door over a run, and a quiet red run hands its output to the error stream. Under --errors the parts own lines, as the server line and the red list line, go nowhere, so the merge reads the red rows alone.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both its lines meet a case, TestVerbOver and the green --errors run in TestCheckVerb
- the change reveals no cleanup past the import it dropped
- verbOver owns the verb road for the check, and checkDoorsOf calls it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
