---
kind: [[ticket]]
state: closed
group: the-verbs-answer-their-asks
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box fb2b49fba485 · claude-code-remote
    hash_before: d860f8e59531e62b812f2339c2f7e8503ff165e9
    hash_after: d860f8e59531e62b812f2339c2f7e8503ff165e9
    why: the-work-tab-draws answers this ask
reason: answered
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The index answers each ticket's place in the queue, the way the pull orders them. The work tab draws that place in its queue column, and a person reads what comes next off the tab.

<!-- breaks, as text: what breaks if it is never done -->
The queue column stands empty, because the tab reads the index and the index holds no place. The place stands in the answer file the branch verbs write, which the tab reads no more.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh index tickets` answers a place a ticket, the same place `./RUNME.sh branch list --queue` prints
- the work tab draws the place in its queue column, which `go -C src/tui test ./...` covers
- one scorer stands, and the two readers point at it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

This ticket closes answered by [[spec/tickets/the-work-tab-draws]], and lands
no place in the index. The gain stands: a person reads what comes next off the
tab.

| the ask wants | what stands | where it says so |
|---|---|---|
| the tab draws the place in its queue column | the tab runs `branch list --json` behind each tree the index hands over, and lays the places over the rows | [[spec/design_output/tui#the-work-tab]] |
| one scorer stands, and the two readers point at it | the pull owns the outline, and the verb and the tab read its answer | [[spec/design_output/pull#the-queue-is-an-outline]] |
| the index answers a place a ticket | the index holds no place, because the queue is the pull's and a todo is an override in the plan file | [[spec/design_output/pull#a-todo-forces-a-place]] |

The first line of the ask names the road the design refuses. The place
reads off the score, the score reads git for the ages, and a todo lays over
it from a file off git. So a place in the index would stand a second scorer,
or a copy that goes stale between two reads. `src/tui/workplaces_test.go`
covers the column drawing the verb's places, and `./RUNME.sh check` runs it.
