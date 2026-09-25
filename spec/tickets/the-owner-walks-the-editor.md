---
kind: [[ticket]]
state: closed
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
record:
  - step: answer
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: a025ca5c9405361b5ba08b5dcf9223c0636bd818
    hash_after: a025ca5c9405361b5ba08b5dcf9223c0636bd818
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: 8aa05819fc862872c37174aca7d03cb305e959d2
    hash_after: ab4843318013f13b3c9e59230536dada1eb508e7
    answered:
      - name: tests
        exit: 0
        said: green, 44 test(s) pass in 5 file(s)
      - name: check
        exit: 0
        said: The rules pass.
step: do
reason: done
---

# Ask

Does a person create, take, work and hand back a ticket from VS Code alone? The question comes from [[spec/tickets/the-owner-walks-a-ticket]], and the owner names each place the walk leaves the editor.

- the close of level one, which [[spec/design_input/the-agent-pulls-tickets#three-rules-hold-level-one]] names

- the owner writes under `answer` that the walk stays in the editor, or names each place it leaves

# answer

<!-- answers the question the ask carries -->

## answer

The walk leaves the editor, or breaks inside it, at these places:

| place | what the owner sees |
|---|---|
| the work tab | the sidebar counts seven items, and the work editor shows one |
| the lens take | a named take refuses under `queue`, and a person takes any ticket at any time |
| the frontmatter | the editor draws no route, because the inset import breaks on a Windows path |
| the inset door | a refused proposed API draws nothing, and the door names no reason |
| the Problems panel | `EngineOwnsField` stands as a warning on `steps`, and reads as a hint |
| the Problems panel | `ValeRuns` stands as an error on `.vale.ini`, over this ticket |
| the fields to fill | a take marks no field the step still wants |

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/pull-leaves.test.js test/level0/pull-hand-of.test.js test/level0/pull-escalate.test.js test/level0/editor-doors.test.js test/level0/ticket-yours.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Each fault under `answer` takes a fix and a test:

- The inset imports a URL, so Node on Windows takes the path.
- The inset door warns why it draws nothing.
- A person's named pull passes the queue.
- The sidebar badge reads the queue the work tab counts.
- `EngineOwnsField` draws at hint, off the Problems panel.
- The restore of this ticket's frontmatter clears the `ValeRuns` error.

The blue lines move to [[spec/tickets/the-take-marks-the-fields]].

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the answer: each row under `answer` names its fix under `says`
- the cleanup stands in the change: `pull.js` splits its escalation out to keep under its ceiling
- every fact stands once: the binding rule lives in [[spec/design_output/config#the-engine-controls]], and the hint level in `src/lsp/finding.go`

# Discussion

- [[spec/tickets/the-owner-walks-a-ticket]] hands this over at `answer`, which waits for a person.
