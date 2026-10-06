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
group: engine-verbs-hold
step: do
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 457eb2a34db167804256ef057bae3d978161d16f
    hash_after: 24170e58bd700612897f5ead40a25a215809a9ef
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   50.8  in all"
    inputs:
      - name: ask
        hash: 90f95fd0f53364a0
        size: 275
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

InHand in src/modules/hooks/command/ticket.go reads the plan's working line as a todo where it names a ticket, so a write naming a closed ticket passes the door. Read the line as a todo only where it names no ticket, as the pull's workingTodo does, with a hooks command case.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

cd src && go vet ./modules/hooks/... && go test ./modules/hooks/... && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The ticket door reads the plan working line as a todo only where no ticket stands under that name, as the pull reads it. Before, a plan naming a closed ticket kept it in hand as a todo, so a write naming it passed, and a refusal listed the ticket as the working todo. The lookup over the public and private ticket folders moves into one function, which the door and the hand both call.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the hand reads a todo only where the line names no ticket, with a hooks command case
the cleanup: the folder lookup the door held inline moves into ticketText, which both callers share
one place: ticketText owns the two folders, and namesTicket reads through it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
