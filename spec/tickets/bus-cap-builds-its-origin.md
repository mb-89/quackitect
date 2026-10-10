---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process_hash: 2b5ab398855a1aba
group: tests-and-ci-hold
step: do
record:
  - step: do
    hand: box af15433560d6 · claude-code-remote
    hash_before: 785919120929a7f859207831a9fafb120ba51ffd
    hash_after: 785919120929a7f859207831a9fafb120ba51ffd
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/git passes
      - name: check
        exit: 0
        said: "   57.8  in all"
    inputs:
      - name: ask
        hash: e4806a09de7ecf64
        size: 696
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestTheLiveTipsLandUnderTheBusCap in `src/modules/git/git_contract_test.go` reads the origin refs of whatever checkout runs it, so it skips on every CI job, whose shallow checkout holds no `origin/work/*` ref. A case over a scratch origin with work branches carrying ticket files runs everywhere, and asserts the tips land under the bus cap.

The gain is a bus-cap case the merge gate runs, with one answer on every box.

Without it the cap holds nowhere the merge reads it, and a desk's answer turns on what it last fetched.

- a case builds work branches in a scratch origin and asserts Tips lands under busCap, under `go -C src/modules test -tags contract ./git/...`
- the case skips on no box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/git

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

This child closes with no code, as the owner allows for a finding judged not worth its code. gitSuite in src/modules/git/git_contract_test.go already holds the bound on the fake and on a real scratch repository: a tip carries only the ticket files its branch changed plus the Gone list, and CI runs it. A scratch origin built near the bus cap would test that same behavior a second time, which spec/guidance/code/tests rule 1 refuses, and it would prove nothing about the live size the cap guards. The live case stays as the ticket tips-carry-branch-changes-alone asks: it skips on a shallow CI checkout, and it caught the real growth on a full clone, where work boxes run the check.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change departs from the ask: no code lands, for the reason the says field gives
- the cleanup the change reveals: none
- every fact the change adds stands in one place: the reason stands in this ticket alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
