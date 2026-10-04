---
kind: [[ticket]]
state: draft
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-check-takes-a-minute
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The work on the check's span stops here, since the check stands near a minute on a cloud box. This ticket writes down why, and what a later hand reads before it cuts further.

- gain: a later hand starts from the measure and the calls, and spends no turn on a road this one weighed
- breaks: the next box measures again from nothing, and tries the road that loads the clock cases
- done_when: `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh check

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

No code changes. The stop and the roads left stand in the Discussion of [[spec/tickets/the-check-takes-a-minute]].

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the stop and its reasons stand in the Discussion
- the cleanup it reveals: none
- every fact stands once: the measure stands in [[spec/tickets/the-check-takes-a-minute]], and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The stop note moved to [[spec/tickets/the-check-takes-a-minute]], which closed first, so the pull on this branch hands this ticket nowhere. The door deletes no file, so this draft stays for the owner to drop.
