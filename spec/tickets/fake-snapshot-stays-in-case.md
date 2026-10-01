---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-doors-process-stands/gate
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
todo: true
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: module-processes-land-in-shadow
parent: the-doors-process-stands
record:
  - step: do
    hand: box 03ba8e0fb2d4 · claude-code-remote
    hash_before: 2050902e1095693f533f518808262cf989f875ad
    hash_after: 2050902e1095693f533f518808262cf989f875ad
    returns: 1
    why: the change stands in the tree and go vet passes, and the check stays red on one pointer in the-system-places-modules' approach, a chapter the engine writes, which that ticket's gate fixes inside its own design diff; hand it back once the gate lands
    answered:
      - name: tests
        exit: 0
        said: ""
      - name: check
        exit: 1
        said: "spec/tickets/the-system-places-modules.md:180:1: EveryPointerResolves: This pointer names a note nobody wrote: spec/desi"
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/index/procs_test.go shares the package variable fakeSnap across cases, so two cases running beside each other read each other's snapshot; until hands each case its own

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

go vet ./src/index/

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The placed-process cases in src/index/procs_test.go read the store through one package variable, which a case running beside another overwrote. The helper until now takes the store and hands each poll a snapshot of its own, and read answers a fresh snapshot each call, so no case reads another's. The cases stay red until the bus and the placements land, so go vet decides that the file builds. The change also points the placement stubs' links at model.md, where the processes chapter stands, and lays two files out the way gofmt writes them. The placements ticket's own approach keeps its link to processes, since the engine writes that chapter, and its gate takes it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: until hands each case its own snapshot, and the package variable leaves
- the cleanup the change reveals is in the change: the dead processes links in the stubs and the gofmt layout; the placements ticket's approach link waits on that ticket's gate, which processes-links-point-at-model names
- every fact the change adds stands in one place: the change adds no fact, and each link points at model.md

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
