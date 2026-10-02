---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: edit-tools-answer-in-go/gate
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
parent: edit-tools-answer-in-go
depends_on: ["edit-tools-answer-in-go"]
record:
  - step: do
    hand: box d89586721a117 · claude-code-remote
    hash_before: f454235303b5c9615185d750d6832e6708ed0631
    hash_after: f454235303b5c9615185d750d6832e6708ed0631
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "spec/tickets/the-brief-leaves-the-bridge.md:227:92: Vocabulary: openssession stands outside the words this tree writes. "
    inputs:
      - name: ask
        hash: ce176ae03398e4a7
        size: 127
    def: f6f5975f3f858eb1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the Go chapters stay flat, so a mint over a process with nested steps writes the chapters the JavaScript mint writes, in a case

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/check/mint_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go mint now writes a route the way the JavaScript mint does. Each step nests one heading level under the step holding it. A chapter takes its question off asks, then does, then says. A leaf answering a checklist takes a checked chapter. The walk stands in mintChapters in src/modules/check/mint.go, a port of chaptersOf in lib/schema-body.js. The checker keeps its own flat list of chapters, so no note check changes. A case holds the Go body equal to the body the JavaScript mint writes over the same route.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and a case holds the two mints equal
- the checker walking a route flat stands as it did, since this ask leaves the checker alone
- the checked chapter and its question stand once, beside the walk that writes them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
