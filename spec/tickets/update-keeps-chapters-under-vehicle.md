---
kind: [[ticket]]
state: closed
point: gate
todo: false
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: route-keeps-its-chapters/gate
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
group: tickets-keep-their-chapters
parent: route-keeps-its-chapters
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: f68ef2456a96d0a940d5c1a4ef70712613d03829
    hash_after: f68ef2456a96d0a940d5c1a4ef70712613d03829
    why: ticket-verbs-read-method-routes answers this ask
reason: answered
---

# Ask

A ticket update under a vehicle keeps its Ask and every chapter, because a vehicle case runs the update over a method root and a work root apart.

The route ask covers ticket update, and no case runs it under a vehicle, so a fault there stands unseen.

- go test ./src/quack -run TestTicketUpdateVerb passes a vehicle case, which ticket-verbs-read-method-routes adds with its process reads
- ./RUNME.sh check is green

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
