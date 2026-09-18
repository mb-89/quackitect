---
kind: [[ticket]]
state: open
urgency: now
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

Does the approach on [[spec/tickets/the-pull-splits-by-topic]] stand, with the findings its review names carried into it?

The review hands that ticket back to its draft, and the draft reaches its escalation ceiling. So the pull inserts a person step, and the question stops being an agent's to answer. The findings the review names:

| the finding | what it asks of the draft |
|---|---|
| the command line's modules name no chapter | name a chapter per module, as the pull and work tables do |
| the file row writes a count of test files | drop the count, and name `./RUNME.sh lint test/level0` |
| the review hand reads a stale approach | read the approach again once the two above land |

<!-- waits, as list: one line each, naming what stands still until the answer lands -->

- the split of the pull verb and the work verb, which every script over the size ceiling waits on
- [[spec/tickets/the-pull-splits-by-topic]] itself, which closes `became` into this ticket
- nothing else, because its group closes and its branch lands

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- a person writes the answer under `## answer`, and `./RUNME.sh branch pull` hands the step behind it to an agent
- the draft carries the answer, and `./RUNME.sh lint spec/tickets/a-person-reads-the-split.md` passes
- `./RUNME.sh check` exits 0 on the commit

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

- [[spec/tickets/the-pull-splits-by-topic]] hands this over at `design/person-1`, which waits for a person.
- The Ask above carries what that step asks, as a table a reader acts on.

What the review answers about the approach it hands back:

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | yes for the two scripts, and the command line stands open |
| is what the diff touches beyond the ask trivial | yes, the commit writes that ticket alone |
| what does `./RUNME.sh check` answer | 0, with the server standing |
| does a retro stand in the handback | no, and `branch review` names it as the last fix |
| does every claim carry a proof | yes, the lint and the check answer each one |

- `branch unblock` writes that question as one list item a clause, because it cuts the `asks` field on the semicolon. So this chapter reads as a hand rewrites it. For the defect, see [[spec/tickets/the-unblock-keeps-its-shape]].
