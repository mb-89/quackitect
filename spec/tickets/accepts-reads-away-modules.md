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
    hash_before: ee7594c33f2fc9fd147b5f91591e750de198172c
    hash_after: ee7594c33f2fc9fd147b5f91591e750de198172c
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/quack passes
      - name: check
        exit: 0
        said: "  118.1  in all"
    inputs:
      - name: ask
        hash: 7c36c572a3ebc19a
        size: 253
    def: f748dd4ebad0d2a1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Managed.Away holds instance names, not module names (src/quack/io.go ioProcesses), so widening acceptsVerb by split.Away matches no module; implement/change maps each away instance to the module it serves, or the list drops tools a split process answers

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index/tools_test.go src/quack/accepts_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The tool list and the action routes now skip an action whose requests no IO module accepts, so every listed tool answers. acceptsVerb in src/quack/accepts.go holds the table, accepts refuses through it before it routes, and manages hands it to the index as Managed.Accepts. The door reads it in accepted, in src/index/tools.go, for both servesTools and servesActions. The parent draft lands here, since this child points at it. The change maps no away instance to a module, because a placed process answers no request, and the Discussion says why.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, or the discussion says why it departs: it departs, and the Discussion names the road every request takes.
the cleanup the change reveals is in the change: accepts now routes off one switch after the acceptsVerb refusal, in place of three if blocks.
every fact the change adds stands in one place: acceptsVerb owns the table, and the list, the routes and accepts read it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The change departs from the ask, and maps no instance to a module. `Call` in `src/modules/index/call.go` hands every request an action opens to the one local `accepts` table. No road hands a request to a placed process. `Managed.Away` names the instances whose providers the scheduler leaves to those processes, and none of them answers a request. So `acceptsVerb` unwidened lists exactly the tools the route answers, and a widening by `Away` lists tools the route refuses. `TestTheRouteRefusesWhatAcceptsVerbRefuses` in `src/quack/accepts_test.go` holds the two to one table.
