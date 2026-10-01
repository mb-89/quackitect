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
    hash_before: 212b46e632386ab879319e7624c4fceca4ab2066
    hash_after: 212b46e632386ab879319e7624c4fceca4ab2066
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/edits passes
      - name: check
        exit: 0
        said: "spec/tickets/the-brief-leaves-the-bridge.md:227:92: Vocabulary: openssession stands outside the words this tree writes. "
    inputs:
      - name: ask
        hash: 3e8d0138a2ec1d8a
        size: 121
    def: f6f5975f3f858eb1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Go regexp takes no lookaround or backreference, so a replace naming either refuses with the construct it lacks, in a case

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/edits/apply_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A regex op or a replace naming a lookaround or a backreference now refuses before Go compiles it. The refusal names the construct Go regexp takes nowhere, and says to write the match without it. An escaped backslash before a digit stays plain text. The check stands in Compiled in src/modules/edits/apply.go, which every regex op and the replace sweep call.

The bless path in hooks/write/rules.go now names folders.js beside it, which the check asks of every copy of a runtime path.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: each construct refuses in a case
- the cleanup it reveals, the bless path naming no owner, rides this change
- the constructs stand once, in the lacked list of apply.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
