---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass
    from: ticket-verbs-read-method-routes/gate
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "stop when the tests cover every rule of the ask and pass, and leave working code alone"]
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
process_hash: 2a00b62f7c4bc60b
group: tickets-keep-their-chapters
parent: ticket-verbs-read-method-routes
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 4adfab0e8ab0eb19ed3e11939e13a0c1e9d2e59d
    hash_after: 4adfab0e8ab0eb19ed3e11939e13a0c1e9d2e59d
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   63.9  in all"
    inputs:
      - name: ask
        hash: 7ce5f42a52aaba09
        size: 468
    def: a17f982d394d675c
reason: done
---

# Ask

The update vehicle case decides which history the drift reads, because the case harness refuses a git read over any root past the method root.

The harness hands one fake repository whatever root a verb asks for, so a vehicle update reading the work root's history passes as one reading the method root's.

- go test ./src/quack -run TestTicketUpdateVerb passes, and fails where `ticket update` hands `copiedBase` the work root's repository
- ./RUNME.sh check is green

# do

<!-- makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/quack/ticket_update_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The case harness in src/quack/ticket_route_test.go refuses a git read over any root past the method root in a vehicle case, so the update vehicle case decides which history the drift reads. Handing copiedBase the work root fails the case, and the method root passes it. It landed in 4adfab0e8.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the root check stands once, in the harness
- the tests cover the ask and pass, and the change leaves working code alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
