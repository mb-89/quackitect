---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-registers-each-verb/gate
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
group: quack-holds-a-verb-registry
parent: quack-registers-each-verb
record:
  - step: do
    hand: box 470a600bc22e · claude-code-remote
    hash_before: 2855fba6fa0bcdf016227fe671d7c79468bc7872
    hash_after: 828b0864e392c4ce0d9b95232034d2f2b2b51179
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   81.9  in all"
    inputs:
      - name: ask
        hash: ac275485d2385602
        size: 377
    def: d433e035639ee62a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

nodeAccept runs a twin that reads the index over an HTTP GET of values while the action calling the node module stands in flight. The draft asserts the server answers that read, and no test meets the real path, since every subtest hands a fake twin. Run ticket yours through the node module against a live index once, and add a test where a value read settles beside an action.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The node module now answers a registered verb in Go, and the twin reads the index over HTTP while the action calling it stands in flight. TestATwinReadsTheIndexBesideTheActionCallingIt serves a real index with a work/yours value and an action through the node module, registers ticket yours under probe words against that index, and runs the action with a time limit. It answers the next row in milliseconds, so the read settles beside the action. A live run of work/pull on this box answered in about a second as well.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one live run of work/pull, and a test over a served index
- the cleanup it reveals: the Go and node row lists of ticket yours differ, parked as the note ticket-yours-twin-rows-differ
- the wait stands named once, as liveWait in the test

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
