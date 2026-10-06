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
    hash_before: 5311225fa724c14ad5dbe0ea0ae1b14ad27177fb
    hash_after: 5311225fa724c14ad5dbe0ea0ae1b14ad27177fb
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 4100a62076456c63
        size: 174
    def: f748dd4ebad0d2a1
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ask names no handler and a refused connection beside the refused module; this approach answers the refused module alone, so a child carries the hook and connection causes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/index-tools.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

An index tool call now answers every time. callsIndexTool in .claude/skills/level0/lib/index-tools.js ran act with no timeoutMs, and the engine kills a run past thirty seconds and rejects. A hand-back running the check outlasts that, the hook threw, and the host said no tool.call hook answered, so the box fell back to the shell. The call now runs under RUNNING, the ten minutes the pull tool already took, and answers a rejection or an empty run with a line naming the action. RUNNING moves to index-tools.js, and pull-tool.js imports it. A refused connection already prints through act, so it answers as text.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: it answers the no-handler cause at its root, the engine timeout, and the refused connection answers through act as text.
the cleanup the change reveals is in the change: RUNNING stood in pull-tool.js alone, and now one constant serves both roads.
every fact the change adds stands in one place: RUNNING stands in index-tools.js, and pull-tool.js imports it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
