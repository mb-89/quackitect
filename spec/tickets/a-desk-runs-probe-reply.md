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
process_hash: d1a6e26348695e24
step: answer
group: loose-fixes-99f4547
record:
  - step: answer
    hand: box d84d8ece51e9 · claude-code-remote
    hash_before: 31227eff09b7ce311aec1cb250e1dd3c9ba0be1f
    hash_after: 31227eff09b7ce311aec1cb250e1dd3c9ba0be1f
reason: became
successors: [desk-probe-reply-trial]
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->
<!-- waits, as list: one line each, naming what stands still until the answer lands -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

What does `./RUNME.sh probe reply` print on a desk whose client loads function hooks? [[spec/tickets/the-reply-probe-runs]] adds the verb, and a cloud box loads no function hooks, so the run waits for the owner's desk.

The owner runs, from the tree's root on the desk:

    git pull
    ./RUNME.sh probe reply

Then paste the whole output as the answer. The field list, the line naming the field carrying the text, and the warning line each decide a step behind this one:

| the probe prints | what follows |
|---|---|
| a field carrying the message's text | a case in `test/level0/answer-door.test.js` pays `holdsForAnswer` off that field |
| no field carrying it | the same-message line goes back to the owner, with the output |
| the warning line reading yes | the warning on the prompt stands as built |
| the warning line reading no | the warning line goes back to the owner, with the output |
| a line saying the client loads no function hooks | the owner names the client version, and the run waits for a client loading them |

- the reply in the same message as the first call after a prompt still meets the door
- the warning on the prompt stands unproven in the live client

- the answer holds the output of `./RUNME.sh probe reply` run on the desk
- a case in `test/level0/answer-door.test.js` pays the door off the field the output names, or the Discussion says no field carries the text
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

This is work a person alone can do: a run on a desk whose client loads function hooks. So it moves to the person route, per the owner's ruling. [[spec/tickets/desk-probe-reply-trial]] carries the commands, loose on `main`. The box taking this ticket closes it `./RUNME.sh ticket pull a-desk-runs-probe-reply --became desk-probe-reply-trial`.
