---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: ticket-verbs-port-to-go/gate
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
group: ticket-verbs-run-in-go
parent: ticket-verbs-port-to-go
record:
  - step: do
    hand: box 4c04792eb7ca · claude-code-remote
    hash_before: 785617b72c109aa145c5e70d33b181700453a1d2
    hash_after: c4e43f8c083970ba0219b659dcc94afa9b892463
    answered:
      - name: tests
        exit: 0
        said: green, 36 test(s) pass in 6 file(s); green, src/pull passes; green, src/quack passes
      - name: check
        exit: 0
        said: "    1.6  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: ask
        hash: 384ab22f609a9cfa
        size: 189
    def: 8d2b3d0b3fa3b6aa
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ticket sub-verbs and the pull carry no red case yet, so the first done_when line stands half decided. Land each sub-verb's case file red before its code, and list it under tests-red/red

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Each ticket sub-verb the port still owed now has a Go case file beside its code: ticket_note_test.go, ticket_open_test.go, ticket_bless_test.go and verb_ticket_test.go. Each file ran red on its own assertion, the registry naming no Go answer, before its code landed. The cases cover every road the JavaScript tests drove through the verb. The pull itself already carried its cases in src/pull. The files landed green in the same pass as their code, so none joins the red list under tests-red. The ticket and split programs left with them, and the guards that read the program folder now read the verb table Go holds.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: each sub-verb case file ran red before its code, and the helper reports hold the red lines
- the cleanup the change reveals is in it: the node road case takes a program no Go verb answers, and the tools case and the cli-leaves guard read the Go verb table
- each fact stands once: the verbs reuse the bless, open and mint the pull holds, and the one new export wraps the standing routed

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
