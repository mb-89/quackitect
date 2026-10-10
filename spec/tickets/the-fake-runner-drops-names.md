---
kind: [[ticket]]
state: open
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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The fake leg of TestARunDropsTheVariablesItNames in `src/proc/proc_contract_test.go` passes whether or not a run drops what it names, since the test's own fakeSh reads `one.Env` alone for one line and the box environment for the other. fakeSh models the environment one way on both lines, the real runner's way: the box environment minus Drop, plus Env.

The gain is a contract whose fake leg fails where the fake drifts from the real door.

Without it a fake built on this pattern drifts from the real runner, and no case notices.

- fakeSh reads the box environment minus Drop plus Env on every line
- the fake leg fails where Drop goes unread, under `go -C src/proc test -tags contract ./...`
- `src/quack/person_run_test.go` stays green, since FakeRunner still hands the raw Command on

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
