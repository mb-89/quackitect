---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: box-verbs-port-to-go/gate
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
group: box-verbs-run-in-go
parent: box-verbs-port-to-go
record:
  - step: do
    hand: box 8ca46dccf16b · claude-code-remote
    hash_before: f04cfbfa8adb0f6f396a7857668fa11965026f12
    hash_after: f04cfbfa8adb0f6f396a7857668fa11965026f12
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   56.7  in all"
    inputs:
      - name: ask
        hash: 63483a58305d2827
        size: 168
    def: 89146b8ec86d255d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestTheBoxVerbsRegister checks registration alone and decides no part of 'reaches no node'; implement adds a case per verb whose fake runner refuses node, dry excepted.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/box_no_node_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Each box verb registers through registerBox, which keeps its doors-taking answer under boxAnswers beside the twin the registry holds. TestEveryBoxVerbStartsNoNode runs every one of them over fake doors, a temporary tree, a PATH of empty programs and a recording runner, and fails on any run naming node past a version ask. The survey asks node its version, which runs no JavaScript. The tools verb lands with it, and writes the same answer the JavaScript wrote on this box. Each later port joins the case by registering, and the probe runs it under compact, cold and reply. The road in verbs.go looks for a registered verb before the verbs quack answers alone, so tools leaves programKeeps and no shared line names a box verb.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask wants a case a verb whose runner refuses node, and the case runs every registered box verb, the dry road apart on its own ticket
- the road change in verbs.go is the cleanup the tools twin reveals, and it lands here with its test
- the fake doors stand once in box_doors_test.go for every box verb test

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
