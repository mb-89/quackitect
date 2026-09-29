---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: qtest-holds-a-module/gate
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
parent: qtest-holds-a-module
record:
  - step: do
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: 386dd4dd32e37f8959d89212c4f006f3fdd9aadd
    hash_after: 386dd4dd32e37f8959d89212c4f006f3fdd9aadd
    answered:
      - name: tests
        exit: 0
        said: green, src/q/qtest passes; green, src/index passes; green, src/q passes
      - name: check
        exit: 0
        said: "src/scripts/work-answer.js:120:1: correctness/noUnusedFunctionParameters: This parameter all is unused."
    inputs:
      - name: ask
        hash: 952163d61d1a5846
        size: 216
    def: 30be32ce008cf4a1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the contract suite seeds cfg/ and clock/minute alone, because the fake seeds files/ as a string and the index seeds it through its own writer as a Content; name one type for files/ in q and add a files/ case to Suite

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/q/qtest src/index/contract_test.go src/q/store_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

q.Content now names the one type of files/<path...>: its hash and its text, the empty one standing for a path the tree tracks nowhere. The index files topic, the fake index and the watch module stub all take it, so a case seeds a file the same way on the fake and on the index. The contract suite gains a case reading a seeded file, and the index harness seeds files/ through the topic writer the index commits with.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: one type in q, and a files/ case in Suite on both sides
the cleanup stands in the change: the index topic and the watch stub drop their own Content, and the fake file case seeds q.Content
Content stands once in src/q/q.go, and every other place names q.Content

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
