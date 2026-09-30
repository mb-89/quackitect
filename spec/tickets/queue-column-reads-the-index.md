---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-badge-reads-open-tasks/gate
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
group: open-tasks-switch-lands
parent: the-badge-reads-open-tasks
record:
  - step: do
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: b00437312918c34fc79c5a9548ee61c47b174772
    hash_after: b00437312918c34fc79c5a9548ee61c47b174772
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/work passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 666721f5c7347907
        size: 154
    def: c901d868f7387d2c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

under new, Takeable reads the index while the queue column reads the pull verb. The shadow stops logging, so a bracket its column contradicts goes unseen.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/tui/work/queuecolumn_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The work tab drew its brackets off the index and its queue column off the pull verb. On this tree they disagreed. The index places the draft children of a group standing at a person place, and the verb reads branch rows off git and places none of them. So the brackets read 25 while the column placed 20 off the cloud.

PlacesAt now reads the queue column off the index name queue/places, the map work/open-tasks counts. A place at infinity marks the row cloud. Where no door answers, the verb places stand.

On this tree the header and the column both read 25 off the cloud.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the column and the brackets read one index map
- the cleanup it reveals: the shadow compared counts alone, so a place mismatch hid behind equal counts. The count chain ticket takes the shadow away
- one place: queuePlacesName names the index name once, and askQueuePlaces reuses postIndex

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
