---
kind: [[ticket]]
state: open
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
step: answer
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->
<!-- waits, as list: one line each, naming what stands still until the answer lands -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Run the reply probe on a desk whose client loads function hooks, and write what it shows. [[spec/tickets/a-reply-follows-its-prompt]] keys the answer door on the prompt, and puts the warning on the prompt's own event. Two things stand unmeasured, because the cloud box that built it loaded no function hooks:

| what the probe reads | what follows |
|---|---|
| the text of the call's own message on the `tool.call` event | `holdsForAnswer` pays off that field, and a case drives it |
| that text on no field | the same-message line goes back to the owner, with the log |
| the session reads the prompt opening on the `warns` line | the warning stands as built |
| the session reads the prompt without that line | the warning line goes back to the owner, with the log |

`./RUNME.sh probe` runs the client headless, and holds `compact` today. The `do` step adds `reply` beside it, the way [[spec/design_output/level0#what-the-probe-does]] reads `compact`.

- the reply in the same message as the first call after a prompt still meets the door
- the warning on the prompt stands unproven in the live client

- `./RUNME.sh probe reply` exits 0 and prints what `tool.call` carries at the first call after a prompt
- a case in `test/level0/answer-door.test.js` pays the door off the field the probe names. Where no field carries the text, the answer says so
- `./RUNME.sh check` exits 0

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

# do

<!-- carries the answer out, with the test that covers it -->

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
