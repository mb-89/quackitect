---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: commit-door-refuses-model-trailers/gate
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
group: engine-verbs-hold
parent: commit-door-refuses-model-trailers
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 0660144bb2f6aaddc5896a806088947dd7f6ab0d
    hash_after: 0660144bb2f6aaddc5896a806088947dd7f6ab0d
    why: commit-door-refuses-model-trailers answers this ask
reason: answered
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the session attribution this box carries asks for a Co-Authored-By trailer naming a model, which this door refuses once it lands; the owner's rule wins, so commits from that point on carry the Claude-Session line alone

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

go test -C src ./modules/hooks/command/ -run TestModelTrailersPassesASessionLink

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

No code on this branch writes a Co-Authored-By trailer: the engine and the commit verb write each message with none, and the session attribution reaches a commit only where a hand writes the message itself. The owner rule wins over that attribution, so from the door on, a hand-written commit here carries the Claude-Session line alone, and the door test passes that line.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the decision stands, and no code carries the trailer, which a search of the tree and the recent commits shows.
The change reveals no cleanup.
The rule stands once, in ModelTrailers in src/modules/hooks/command/voice.go, which the parent adds.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
