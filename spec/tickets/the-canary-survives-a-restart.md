---
kind: [[ticket]]
state: open
urgent: true
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
group: the-bridge-keeps-transport
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
---

# Ask

The canary asks once a session, and it asks again after every server restart.
`pastTurnOne` in `src/bridge/guidance.js` answers `owes: true` for a session the
server holds no state for. The debt lives in memory, and a restart drops it.

A restart is ordinary. `reload.js` restarts the server on a change under the
roots it watches, so a session editing level zero's own code meets this at
every write. Measured on one session: nine restarts, and the gate asked at
every tool call after each.

| what happens | what the gate should do |
|---|---|
| the session opens | ask once |
| the line lands | take the debt off, and ask no more |
| the server restarts after the line | read the debt back, and stay quiet |
| the server restarts before the line | ask once more |

The line draws highlighted where it lands, in the wording that owes it and the
wording that pays. So a reader finds it without reading the whole answer.

The gain is a canary that means something. A line asked every turn is a line an
agent writes past reading, which is the opposite of what it stands for.

- a restart after the line leaves the gate quiet
- a restart before the line asks once, and once alone
- the line draws highlighted, in both wordings
- `pastTurnOne` names what it answers, and answers that
- `node --test "test/level0/*.test.js"` is green
- `./RUNME.sh check` is green

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
