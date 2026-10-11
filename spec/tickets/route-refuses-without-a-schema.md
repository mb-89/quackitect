---
kind: [[ticket]]
state: open
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
todo: true
step: do
process: [[spec/processes/trivial]]
process_hash: 2a00b62f7c4bc60b
group: tickets-keep-their-chapters
parent: route-keeps-its-chapters
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
