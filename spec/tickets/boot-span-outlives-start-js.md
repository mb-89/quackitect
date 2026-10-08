---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: session-start-leaves-node/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: javascript-leaves
parent: session-start-leaves-node
record:
  - step: do
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 0dc425c4bd0c8b916d86fcc181114a75025364d3
    hash_after: 806b453b673ec4a361ff54099e9f544acc27a63c
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: a38d3a9de93e79de
        size: 290
    def: b544f56a9106d36a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestTheBootHookWaitsOutTheStartSpan in src/quack/session_start_test.go reads STARTING out of .claude/skills/level0/hooks/start.js, and level0-hooks-forward-to-go deletes start.js with no callers line for this test, so the test reads the start span from wherever the forwarder lands it in Go

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/hooks.test.js test/level0/work-stands.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The start span now lives in Go as startSpan in src/quack/hook_down.go, the down word the forwarder design gives the standing start. TestTheBootHookWaitsOutTheStartSpan reads that constant in place of a regex over start.js, so deleting start.js leaves the case whole. That Go case stays on the red list of session-start-leaves-node until its hook runs the boot word. So the tests field runs hooks.test.js, which holds the same claim over STARTING while start.js stands, and work-stands.test.js, which the import fix touches. STARTING in start.js stays for the JavaScript start road until level0-hooks-forward-to-go removes the file. The change also takes off the todo tag the gate commit carries into git, which hands this ticket ahead of the dry probe leaf and reds the clear probe. It also drops two unused imports from test/level0/work-stands.test.js and a count from the probe_dry_test.go header, and both red the check.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the case reads the span out of Go, at the home the forwarder design names
the cleanup goes into the change: the committed tag, the unused imports and the header count; the commit verb letting a tag through stands as the note commit-carries-the-todo-tag
the span stands once in Go as startSpan, and the one JavaScript copy in start.js leaves with the forwarder

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
