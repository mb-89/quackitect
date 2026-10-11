---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass
    from: route-keeps-its-chapters/gate
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
parent: route-keeps-its-chapters
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 39a16780e9c910b94ba91c4583a347e2b8cd045a
    hash_after: 39a16780e9c910b94ba91c4583a347e2b8cd045a
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   68.2  in all"
    inputs:
      - name: ask
        hash: 87e4c16882f4ef75
        size: 495
    def: 711dc9f682ed2c1e
reason: done
---

# Ask

A route run with no ticket schema under the method root refuses at the verb and leaves the ticket as it stood, so the refusal reaches the hand who runs the route.

A refusal proven inside `ReRoute` alone leaves the verb's exit and words unread, and a verb dropping the error passes every case.

- go test ./src/quack -run TestTicketRouteVerb passes a case with no schema under the method root, which wants exit failed, the `ErrNoSchema` words and the ticket unchanged
- ./RUNME.sh check is green

# do

<!-- makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/quack/ticket_route_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A route case runs the verb with no ticket schema under the method root, and wants exit failed, the ErrNoSchema words and the ticket unchanged, so the refusal stands proven at the verb as well as inside ReRoute. It landed in ea8ca0c73.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the fact stands once, where the change writes it
- the tests cover the ask and pass, and the change leaves working code alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
