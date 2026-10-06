---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: every-index-tool-answers/gate
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
parent: every-index-tool-answers
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: d4147bcfc0f5e6692cbdb625e5ce0efde04fbebb
    hash_after: d4147bcfc0f5e6692cbdb625e5ce0efde04fbebb
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "  118.1  in all"
    inputs:
      - name: ask
        hash: d7b98c38df5f834d
        size: 237
    def: f748dd4ebad0d2a1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

tests-red dropped TestEveryWiredToolAnswersThroughAct, yet draft/tests and draft/size still name it and src/quack/cli_test.go; tests-green adds the pure read of the real catalog against acceptsVerb it promises, or the lists drop the name

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/cli_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestEveryWiredToolAnswersThroughAct in src/quack/cli_test.go now stands, as the draft of every-index-tool-answers names it. It reads the real catalog off spec/wiring.yaml through catalogOf, opens each action on a zero input, and fails on a request acceptsVerb refuses. A gap between the wiring and the accept table turns red there, before the tool list drops a tool the owner calls. It also fails where no action opens with a request, so an empty read never passes.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: it adds the pure read the ask names, under the name the draft lists, in src/quack/cli_test.go.
the cleanup the change reveals is in the change: none shows, and the read reuses catalogOf and acceptsVerb.
every fact the change adds stands in one place: acceptsVerb owns the table, and the case reads it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
