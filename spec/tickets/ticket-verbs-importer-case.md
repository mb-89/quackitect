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
    hash_before: 149d41186f434778dfb506d90f6d9310862b6f00
    hash_after: 149d41186f434778dfb506d90f6d9310862b6f00
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 4fbb8fbf8123ff64
        size: 220
    def: 8d2b3d0b3fa3b6aa
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no test decides the importer done_when line. The closure script checked names stands nowhere, and TestTicketVerbsRunInGo reads absence alone. Add a Go case that searches src for an import of each module leftScripts names

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/ticket_verbs_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestTicketVerbsRunInGo in src/quack/ticket_verbs_test.go carries the case the gate asked for. The subtest named no file under src or .claude imports a module the port takes out walks both folders past node_modules. It reads every JavaScript import and resolves each relative path, then fails on any that reaches a module leftScripts names. It landed red while the ticket and split programs still imported those modules, and it passes now that they left. It decides the importer line of the port by what imports the modules, apart from the subtest that reads their absence.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the Go case searches src, and .claude beside it, for an import of each module leftScripts names
- the cleanup the change reveals is in it: the importers it found left with the port, and the tests that read them moved to Go
- each fact stands once: the case reads the one leftScripts list the absence subtest reads

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
