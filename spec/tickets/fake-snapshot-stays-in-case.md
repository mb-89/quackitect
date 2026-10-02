---
kind: [[ticket]]
state: closed
point: gate
step: do
steps:
  - name: person-1
    does: answers the question the engine asks
    by: anyone
    to: engine
    asks: "do fails back 2 times: the change stands in the tree; the check stays red on the placements ticket's approach link, which that ticket's gate fixes, so the fix waits for that gate"
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
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
  - step: do
    hand: box 03ba8e0fb2d4 · claude-code-remote
    hash_before: d01ccb46b8f320faa0fb29f3459a1b49eb627498
    hash_after: d01ccb46b8f320faa0fb29f3459a1b49eb627498
    returns: 2
    why: the change stands in the tree; the check stays red on the placements ticket's approach link, which that ticket's gate fixes, so the fix waits for that gate
    answered:
      - name: tests
        exit: 0
        said: ""
      - name: check
        exit: 1
        said: "spec/tickets/the-system-places-modules.md:180:1: EveryPointerResolves: This pointer names a note nobody wrote: spec/desi"
  - step: person-1
    hand: box 36586c1b4c37 · claude-code-remote
    hash_before: 2ca08f35de8ae4768ccd6d9939e131677c137ae6
    hash_after: 2ca08f35de8ae4768ccd6d9939e131677c137ae6
    def: 214654b9f289ef26
  - step: do
    hand: box 36586c1b4c37 · claude-code-remote
    hash_before: 949242ef33e5b2668228d5d89a6b0dac6907b0b3
    hash_after: 949242ef33e5b2668228d5d89a6b0dac6907b0b3
group: module-processes-land-in-shadow
parent: the-doors-process-stands
reason: became
successors: [the-system-places-modules]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/index/procs_test.go shares the package variable fakeSnap across cases, so two cases running beside each other read each other's snapshot; until hands each case its own

# person-1

<!-- do fails back 2 times: the change stands in the tree; the check stays red on the placements ticket's approach link, which that ticket's gate fixes, so the fix waits for that gate -->

## answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

Run do again. The check exits 0 on the branch head after the sync, so the dead pointer on the placements ticket no longer holds the check red, and nothing waits on that gate.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

go test -count=1 -run 'TestAKilledFakeIOProcessLeavesItsNamesNotProvided|TestTheNextCommitOfARestartedProcessClearsTheMark' ./src/index/

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The placed-process cases in src/index/procs_test.go read the store through one package variable, which a case running beside another overwrote. The helper until now takes the store and hands each poll a snapshot of its own, so no case reads another case. The two fake IO process cases drive until and pass. The placement cases stay red until the bus and the placements land. The check now exits 0, since the dead pointer on the placements ticket is gone.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: until hands each case its own snapshot, and the package variable leaves
- the cleanup the change reveals is in the change: the dead links in the stubs and the gofmt layout
- every fact the change adds stands in one place: the change adds no fact

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
