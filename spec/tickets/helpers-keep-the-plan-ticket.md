---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: pull-hands-the-working-ticket/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: engine-verbs-hold
parent: pull-hands-the-working-ticket
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 3d51d5ad267b30ec0a7923dec0320f44e452c9d7
    hash_after: 3d51d5ad267b30ec0a7923dec0320f44e452c9d7
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "  118.9  in all"
    inputs:
      - name: ask
        hash: 079a9bc8ece0098a
        size: 486
    def: 14d5d9a658303869
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

in src/pull/pull.go Pull, `wanted = working` on the --as road reads workingTodo. Once workingTodo answers empty for a ticket name, a helper pulling with --as no longer binds to the ticket the plan names and takes the queue head instead, which contradicts the approach line saying the --as road stays bound. Read the raw plan line for `wanted` and `helps`, filter only the todo hold through namesTicket, and add a TestPull case where a plan naming alpha and a pull with --as hands alpha.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

CGO_ENABLED=0 go test -count=1 ./src/pull/ -run "^(TestNamesTicket|TestPull)$/^(a_plan_naming|a_helper|a_working_todo)" && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The pull reads the plan's working line two ways. planWorking in src/pull/pull_holds.go answers the raw line. workingTodo answers it only where namesTicket finds no ticket by that name, so a ticket's name holds no plain pull. Pull in src/pull/pull.go binds a helper's --as to planWorking and holds the todo through workingTodo, so a helper still takes the ticket the plan names over the queue head. namesTicket in src/pull/ticket_at.go answers true where TicketAt finds a path other than the bare name. The new TestPull case seeds a second child beta, names it in the plan, and a pull with --as hands beta where the old road handed alpha. The tests line runs these cases alone, because TestPull also holds the cold path case that running-work-takes-main-fixes keeps red until it lands, and the test verb runs TestPull whole.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: wanted and helps read the raw plan line, and only the todo hold runs through namesTicket.
The cleanup the change reveals is in the change: it lands the parent's namesTicket and workingTodo with it, since the child's fix stands on them.
The ticket test reuses TicketAt, and the plan read stands once in planWorking.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
