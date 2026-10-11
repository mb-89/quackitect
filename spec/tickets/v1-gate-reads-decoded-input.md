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
    hash_before: b4ad86fa6aeb51c0504e5fe83fdcd1bde03332db
    hash_after: b4ad86fa6aeb51c0504e5fe83fdcd1bde03332db
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "  101.6  in all"
    inputs:
      - name: ask
        hash: da22da4d0da95a00
        size: 93
    def: be9d938c0443b338
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`acts` should read the decoded input's mark, since a raw key check misses `PERSON` and alike.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`acts` in `src/index/actions.go` reads the person mark off the decoded input through `MarksPerson`. A body marking a person in any key case then meets the gate. `TestAPersonPostWithoutTheRunSecretMeetsARefusal` posts `PERSON` and wants 403. The change landed in 9e5aadc17 and 411abd680.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the gate runs after `store.Input`, on the typed value
- the cleanup the change reveals: none past the gate
- the mark's reader stands once in the index, as `MarksPerson` in `src/index/secret.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
