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
    hash_before: ede0f2172cfa9376ab1e7e2b1eb988c081716cd4
    hash_after: ede0f2172cfa9376ab1e7e2b1eb988c081716cd4
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "   98.9  in all"
    inputs:
      - name: ask
        hash: 668768635b58623d
        size: 99
    def: be9d938c0443b338
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The draft gates marked legacy calls alone, while the test refuses every call, so one of them moves.

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

The first port gates every call on the run's secret, as the test holds. The port answers reads of the whole tree and stops the door, and it routes no action. So a person mark means nothing there, and the secret decides the caller. The draft's narrower gate gives way to the test's. The change landed in 9e5aadc17 and 411abd680.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `took` in `src/index/door.go` refuses a call with no secret with 401
- the cleanup the change reveals: the one client of the port sends the secret
- the gate stands once, at the head of `took`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
