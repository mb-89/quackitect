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
    hash_before: cc9a0021c47fff56c0c63d0b4bcf6f61ce2fe82a
    hash_after: cc9a0021c47fff56c0c63d0b4bcf6f61ce2fe82a
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   68.2  in all"
    inputs:
      - name: ask
        hash: 4b69bc7c90246e4f
        size: 413
    def: f3c9a8656d586f83
reason: done
---

# Ask

The vehicle route case proves written chapter text survives the route, because its ticket holds text under a chapter and the case expects that text back.

A case whose chapters stand empty proves the headings come back, and a route dropping written text passes it.

- go test ./src/quack -run TestTicketRouteVerb passes the vehicle case, whose ticket holds text under its draft chapter
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

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

The vehicle route case seeds text under the draft chapter of its ticket and expects that text back, so it proves written chapter text survives the route, where it proved the headings alone. The case landed in 476871014.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the seeded text stands once, in the vehicle case of testdata/ticket_route.json

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
