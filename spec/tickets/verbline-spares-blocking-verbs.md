---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: agents-call-quack-directly/gate
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
group: quack-verbs-switch-over
parent: agents-call-quack-directly
record:
  - step: do
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: e2d3647a22abd59f91e2e4ed23dba0c397e15c09
    hash_after: e2d3647a22abd59f91e2e4ed23dba0c397e15c09
    answered:
      - name: tests
        exit: 0
        said: green, 40 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/verbline-spares-blocking-verbs.md:41:97: Vocabulary: nodeaccept stands outside the words this tree writes. "
    inputs:
      - name: ask
        hash: a157351691f2408f
        size: 274
    def: fb0b796fd802391d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

verbLine sends the agent to index_verb_tui, but tui opens a window and serve never returns, and nodeAccept in src/quack/twins.go runs cli.js through CombinedOutput with no terminal; the line names check, branch and doctor, and keeps tui and serve off the tools it recommends

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/bash.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Bash description recommends the tools for check, branch and doctor alone. tui holds a terminal and serve never returns, and the node module runs a verb with no terminal, so neither stands on the line. The change landed with describe-reaches-the-tool-list, as TOOL_VERBS in .claude/skills/level0/lib/verb-line.js, and the bash test asserts tui stays off.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the line names check, branch and doctor
- no further cleanup shows
- the list of recommended verbs stands in verb-line.js alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
