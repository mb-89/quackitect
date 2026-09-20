---
kind: [[ticket]]
state: closed
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
group: the-work-tab-reads-tickets
step: do
record:
  - step: do
    hand: box 51c5005e133c · claude-code-remote
    hash_before: 8dd69cba269ce825c2403fda9a2995ddcd0225c3
    hash_after: 8dd69cba269ce825c2403fda9a2995ddcd0225c3
    answered:
      - name: tests
        exit: 0
        said: green, 16 test(s) pass in 2 file(s); green, src/index passes
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The index holds every ticket with its fields, and one query answers them. The fields are state, step, group, urgent, and the standing a branch gives it. A reader asks the index and reads no file.

<!-- breaks, as text: what breaks if it is never done -->
The work tab reads a file the branch verbs write, so it shows what the last verb saw. A ticket is a thing of branches in its eyes.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh index tickets` answers every ticket with its fields as JSON, off the index alone
- a ticket's standing reads off its group's branch through the ticket, which `test/level0/index.test.js` covers over a fixture

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test

## check

    ./RUNME.sh check

## says

The index answers `tickets`: one row a ticket, off the note rows and nothing
else. `src/index/ticket.go` holds it, and `./RUNME.sh index tickets` prints
the rows. For the keys, see
[[spec/design_output/index#the-index-answers-the-tickets]].

| what | where it stands |
|---|---|
| the standing | a group's own record, and a child answers its group's |
| the field read | the top of the front, so a `step` in a record entry shadows nothing |
| the fence cut | `fenced` in `front.go`, which both readers call |
| the runtime folder | `serves` makes it, so a door stands over a fresh tree |
| the plugin manifests | `stamps` in `brand.js` writes both where a clone holds none |

So a branch informs a ticket's standing and nothing more, and the reader opens
no git for it. The fixture case stands in `test/contract/index.test.js`, and
the discussion says why. The manifests left git and nothing wrote them again, so three
contract cases stood red on every fresh clone, and the stamp now writes them. The contract case drives the built binary over
a tree it writes, and skips where no binary stands. The Go cases under
`src/index` prove the same fields and standings with no door running.

## checked

- the change follows the ask: the verb answers every ticket as JSON, and a case reads standing off the group
- the cleanup it reveals: `fenced` owns the fence cut, and the fresh-tree fall stands fixed in `serves`
- every fact stands once: the keys stand in the index note, and the record rule in the work note

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The ask names `test/level0/index.test.js` for the fixture case. The rule
`FakeDoorsInTest` keeps a test driving the real binary out of that folder, so
the case stands in `test/contract/index.test.js` beside the door's other cases.
