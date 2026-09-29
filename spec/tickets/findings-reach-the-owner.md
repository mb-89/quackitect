---
kind: [[ticket]]
state: open
step: answer
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
group: loose-fixes-99f4547
---

# Ask

The owner decides how a finding reaches the owner: as a question ticket, as a note, or both, and what a finding carries. [[spec/design_input/level-two]] leaves it open in its chapter Findings.

- the shape of a finding in the attack step of a gate waits on the answer

- the answer names the road and the fields of a finding
- the design input carries the answer, which `./RUNME.sh check` reads

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

A box decides this, under the owner's rulings of the day. The answer for the `answer` step:

| the finding | the road |
|---|---|
| work a box can do | a ticket in the group the box works, closing before the group reaches done |
| work a person alone can do | a ticket on [[spec/processes/person]], loose on `main`, with every command in its ask |
| a doubt with no work in it yet | a note, which the retro decides |

No finding opens a GitHub issue. A finding carries three fields: the failure it names, the evidence as a command and its output, and what it leaves unchecked.

What I weighed: the owner's ruling "If a box opens a ticket that it can solve itself, it assigns it to its own group". The owner also ruled "We have a ticket system for that". Rule 9 of the tickets chapter keeps a doubt as a note and an ask as a ticket. The Findings chapter of [[spec/design_input/level-two]] asks for the road and the fields alone. The box taking this ticket writes the answer, and the `do` step carries it into that chapter.
