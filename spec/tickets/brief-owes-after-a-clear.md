---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-brief-leaves-the-bridge/gate
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
group: go-cage-switches-over
parent: the-brief-leaves-the-bridge
record:
  - step: do
    hand: box 40b0ad3f11a · claude-code-remote
    hash_before: dc87d9a3518348c28053f2db9a9340315099fea3
    hash_after: dc87d9a3518348c28053f2db9a9340315099fea3
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "spec/tickets/the-brief-leaves-the-bridge.md:304:450: Vocabulary: stepbrief stands outside the words this tree writes. Wr"
    inputs:
      - name: ask
        hash: abc1c114c40513c6
        size: 486
    def: 774a02ca528341d9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the flip hands session.end and turn.said to the door, and the brief fold in src/modules/hooks/brief.go keeps two bridge rules nowhere. onSessionEnd in src/bridge/guidance.js opens the canary debt again after a clear, setting owes and dropping paid, and stepBrief takes no session.end. repeats in guidance.js logs HEARD.again where a paid session writes the canary line again, and the Go side logs nothing. Port both into stepBrief with a case each in brief_test.go before the flip lands

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/brief_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The brief fold in src/modules/hooks/brief.go now keeps the two canary rules the bridge kept alone, so the flip in the-brief-leaves-the-bridge drops neither.

- a session end naming a clear opens the debt again, as onSessionEnd in src/bridge/guidance.js does, so the next call carries the owes line
- a said step writing the canary line after the debt paid marks the step, and the door logs the warning repeats in guidance.js logs, under kind level0 at warn

The two words stand in src/modules/hooks/brief.go beside repeats, pointing at DOOR in the bridge and HEARD.again in the plugin.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both rules port into stepBrief, with TestAClearOpensTheDebtAgain and TestASecondLineLogsTheWarning in brief_test.go
- the cleanup: briefDoor gains briefDoorIn, which answers its root, so the warning case reads the log and briefDoor stays as it reads
- the row kind and the warning stand once on the Go side, beside repeats, and the comment points at the JavaScript owners

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
