---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: readers-take-the-go-topics/gate
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
group: read-topics-switch-over
parent: readers-take-the-go-topics
record:
  - step: do
    hand: box d856f55387d6 · claude-code-remote
    hash_before: 75bf64df38a1f7bab8572b3c0054cfc33975c44a
    hash_after: 75bf64df38a1f7bab8572b3c0054cfc33975c44a
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 307bc847668c5c1c
        size: 183
    def: 0582d525609d7fdb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach names a case for stepNotes and handed, and topic-readers.test.js holds none for handed in src/scripts/pull-hand.js; a case runs handed over the fake quack guidance answer

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/topic-readers.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The five topic keys read new in spec/config/level0.json, and every reader takes its Go topic through src/scripts/quack-topic.js: readConfig, logVerb, the guidance verb, the pull hand-out, workAnswer, stepReads, readsProse and readsText. A topic that answers nothing leaves the reader on its old path until the twins leave. One case in test/level0/topic-readers.test.js runs handed over the fake quack guidance answer, as this ticket asks. The change also carries the other three gate tickets: readsNew is the one mode source, and a readsText and a readConfig case stand.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a case runs handed over the fake guidance answer and reads the notes it prints
- the cleanup the change reveals is in the change: workAnswer and stepReads read guidance too, and take the topic
- every fact stands in one place: quackAt and processNameOf live in quack-topic.js, and the twins re-export them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
