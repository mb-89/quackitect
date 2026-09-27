---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-watchdog-starts-for-real/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-foundation-closes-its-gaps
parent: the-watchdog-starts-for-real
record:
  - step: do
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 8295e43fa684828e491ac83ac295e8c4f3e88a8c
    hash_after: 8295e43fa684828e491ac83ac295e8c4f3e88a8c
    answered:
      - name: tests
        exit: 0
        said: green, src/watchdog passes
      - name: check
        exit: 0
        said: "src/q/qtest/suite.go:75:48: MagicNumber: 6 carries a meaning here. Name it in the constants block at the top of this fil"
    inputs:
      - name: ask
        hash: e4c0d57b5f4370c3
        size: 201
    def: 509f00bdee6c3319
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the part index names no catalog provider, so Store.Stale errors and Dog.Check drops the expired index lease silently; register a name for the part, or have Check answer an expired part with no provider

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/watchdog/lease_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Dog.Check answers every part whose lease expires, and marks the part stale where a provider owns it. The index holds its lease under a part no provider owns, so before this change an expired index lease read as healthy. The manager of the-manager-becomes-a-module gives the part its name index/health later.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change takes the second road the ask names, since the first waits on the manager ticket
the change reveals no cleanup past it
the rule stands in Check alone, and the case reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
