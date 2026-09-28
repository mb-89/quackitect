---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: open-tasks-run-in-shadow/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: open-tasks-shadow-lands
parent: open-tasks-run-in-shadow
record:
  - step: do
    hand: box d81c1a402acf · claude-code-remote
    hash_before: 96fe0c6ca4294d01c2f742eec7dd93bb0db256cd
    hash_after: b9b386ab9afd636b77ee75ebb310ac2bdd37de86
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/work passes
      - name: check
        exit: 0
        said: "spec/tickets/replayed-red-leaf-reads-green.md:18:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 4a2db0fd2288dc9a
        size: 327
    def: d47a5887fb2dcccc
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the red cases call shadowOf directly, and no case holds that PlacesAt in src/tui/work/workplaces.go calls it with the old count, nor that askOpenTasks reaches index.AskAt; the implement step adds a case over PlacesAt with the fake set, so the done_when line rests on a test beside the hand's run of ./RUNME.sh log --kind shadow

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/tui/work

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A case now runs PlacesAt over a fixed places answer, with the index count faked, and reads the shadow row: it carries the count the tab draws. The verb run stands behind a package variable, as the index ask does. The ask names index.AskAt, which the implement step leaves out, since the shadow reaches the door through the client the work tab holds. So the second case holds that client: where no door stands, the ask answers nothing and starts none.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and the second case departs from AskAt for the reason the says field gives
the cleanup: none beyond the package variable
one place: the shadow row shape stands in src/tui/work/shadow.go alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
