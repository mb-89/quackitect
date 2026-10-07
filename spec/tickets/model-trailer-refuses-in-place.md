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
    hash_before: 0dd1276ae4cbfc8926b1a3b47c4e53f4fdeee82d
    hash_after: 080c3e8b784ad3e9eb40ae5d76a2aba54565d9a0
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/command passes; green, src/modules/hooks passes; green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 257192cf742e1a34
        size: 438
    def: 8d738a44e7553b58
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach leaves out two spots the red tests demand, and implement fixes both in voice.go and commits.go: add ModelTrailer to the refusing set, since TestModelTrailersRefusesATrailerNamingAModel asserts Refuses on the row; and split the !ok test from the d.from.Voice nil test in commitVoice, so the model read runs on a box with no Vale while a message with no model trailer still answers nil for TestADoorWithNoGitOrVoiceReadsNeither

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/command/trailers_test.go src/modules/hooks/commit_model_test.go src/quack/commit_session_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

ModelTrailer joins the refusing set, and commitVoice reads the model trailers before it asks for a voice, so a box with no Vale still refuses a trailer naming a model, and a message with none still reads nil. The parent door lands in the same commit, since both fixes stand inside it: TrailersOf, ModelTrailers, the hook door and the commit verb.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: both spots the gate names are fixed in voice.go and commits.go, and the parent red tests pass.
The cleanup the change reveals is in the change: WithoutTrailers now calls TrailersOf, so the trailer parse stands once.
The model pattern and its rule stand once, in modelName and modelRule in src/modules/hooks/command/voice.go.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
