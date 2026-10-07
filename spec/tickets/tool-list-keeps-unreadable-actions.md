---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: every-index-tool-answers/gate
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
parent: every-index-tool-answers
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: a13b21eba167f8cde531976f3bce3fb0fd43806d
    hash_after: a13b21eba167f8cde531976f3bce3fb0fd43806d
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "  115.5  in all"
    inputs:
      - name: ask
        hash: 054209d7cd518896
        size: 162
    def: f748dd4ebad0d2a1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

servesTools reads store.Act over the zero input; an action whose zero input errors or names requests other inputs leave out must stay listed, and a case pins that

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index/tools_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestTheToolListKeepsAnActionItsZeroInputCannotRead in src/index/tools_test.go pins that the tool list reads the zero input alone, and keeps every action that read cannot judge: one panicking on every input, one opening no request on a zero input, and one asking a refused module only past a zero input. accepted in src/index/tools.go keeps all three. The door half of ghostTools moves into toolsOver. The check also tripped a race in src/quack: three parallel cases wrote the global verb registry while TestTicketVerbsRunInGo read it. Those three now run alone, and src/imports/serial.go names registersFor beside Setenv as a call that bars a case from running beside the others.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the case pins an action whose zero input errors and one whose other inputs name requests the zero input leaves out.
the cleanup the change reveals is in the change: ghostTools and the new case share toolsOver, and the registry race the check met is fixed.
every fact the change adds stands in one place: accepted owns the list rule, and barsParallel owns the calls that bar a parallel case.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
