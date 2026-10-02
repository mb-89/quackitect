---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: prose-tools-answer-in-go/gate
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
parent: prose-tools-answer-in-go
record:
  - step: do
    hand: box 3e46c581114 · claude-code-remote
    hash_before: 22fd3c3942e13e68660dbfca09d64b59d9c47163
    hash_after: 331e05a028e888d9c9d7081b02e7bf1ddf492b98
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/the-brief-leaves-the-bridge.md:227:92: Vocabulary: openssession stands outside the words this tree writes. "
    inputs:
      - name: ask
        hash: e663d9bc68076798
        size: 535
    def: 1c9e9a2ce17d9a18
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

step 6 says accepts hands heardOver to draftsOutside as it stands, but heardOver in src/quack/command.go takes (root, name, text) and answers valeHeard with rows, stands and ran and no why, where the seam takes func(text, name) drafts.Linted with Why. So the wiring needs an adapter, and a Vale whose JSON fails to read answers "Vale read nothing: " with an empty reason, where readsAnswer in src/bridge/answer-read.js names ran.why. Give valeHeard the reason, or say the reason the seam answers, while building the seam in tests-green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/vale_why_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

valeHeard in src/quack/command.go now carries why: no vale stands here where none stands, and unreadWhy names Vale's stderr, the run's error, or that it answered nothing or no JSON, as lintText in .claude/skills/level0/lib/vale.js words them. draftsLint in src/quack/drafts.go adapts heardOver to the drafts seam's func(text, name) drafts.Linted, carrying Why, so tests-green on prose-tools-answer-in-go wires it as it stands and a Vale whose JSON fails reads 'Vale read nothing: <reason>'.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: valeHeard takes the reason, and the adapter the gate named stands ready for tests-green
the cleanup: none revealed past the adapter, which lands here
one place: the reasons stand as constants beside unreadWhy, and the comment points at vale.js instead of repeating its code

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
