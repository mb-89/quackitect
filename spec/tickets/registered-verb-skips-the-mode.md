---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: window-verbs-port-to-go/gate
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
group: window-verbs-run-in-go
parent: window-verbs-port-to-go
record:
  - step: do
    hand: box 2e385b836f39 · claude-code-remote
    hash_before: d5fc63af4c99adea9d38403151afa62dc083181d
    hash_after: 93bc839423cfaccecf9b6f06b1aa1eeae940c198
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: The check names no red case and no finding at error.
    inputs:
      - name: ask
        hash: 38465c7f0f0c6d38
        size: 291
    def: 37f9b8731a50921b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

under migration.verbs old or shadow, roadOf in src/quack/verbs.go sends tui, serve, voice, vehicle and stub to node, whose programs this port deletes, so each verb fails there; the road sends a registered verb with no program to quack under every mode, with a case in src/quack/verbs_test.go

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verbs_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check --errors

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

wholeOf in src/quack/verbs.go sends a verb Go registers under its one word to quack, whatever migration.verbs says. Such a verb has no program left, so old or shadow would hand it to a node file that stands nowhere. A twin keyed by more words, like ticket yours, keeps its program and its shadow road. TestAWholeVerbTakesQuackUnderEveryMode holds both roads. The one-word key is the same mark goVerbs in test/contract/commands.js reads.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the road sends a registered verb with no program to quack under every mode, with a case in verbs_test.go
- the cleanup it reveals stands in the change: none beyond the one function
- the rule that a one-word key means a whole verb stands in wholeOf, and goVerbs reads the same key

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
