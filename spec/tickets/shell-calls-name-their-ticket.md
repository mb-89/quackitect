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
step: do
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: 52b668f662bb4694949ca450872e178af64c3d4d
    hash_after: 52b668f662bb4694949ca450872e178af64c3d4d
    answered:
      - name: tests
        exit: 0
        said: green, 88 test(s) pass in 7 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

Every Bash or PowerShell call names the open ticket it serves, at the head of its description, as `<ticket>: what it does`. A patch names its ticket already, and Edit and Write stand refused. [[spec/design_output/level0#a-write-names-its-ticket]]

The gain is a reminder at every command. The agent meets the question which ticket it works on at the shell, as it meets it at each patch.

Without it a shell call writes through a verb or git with no ticket named, and the agent drifts off its ticket unseen.

- a shell call naming no open ticket refuses and names the form, and a test drives it
- a ticket pull, a mint and a note pass with no ticket named, and a test drives each
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/bash-ticket.test.js test/level0/named.test.js test/level0/bash.test.js test/level0/bash-commit.test.js test/level0/bash-desk.test.js test/level0/trunk-door.test.js test/level0/pulled.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Every Bash and PowerShell call names the open ticket it serves, at the head of its description. A call naming none refuses and says the form. A ticket pull, a mint and a note pass unnamed. The change landed under [[spec/tickets/a-shell-call-names-its-ticket]], whose name ran past the cap. [[spec/design_output/level0#a-shell-names-its-ticket]]

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the Bash and PowerShell doors read the ticket off the description
- the cleanup stands as it is: `.claude/skills/level0/lib/bash.js` stands at warning past its line ceiling
- `src/engine/named.js` owns the ticket check and its wording, and the Bash door calls it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
