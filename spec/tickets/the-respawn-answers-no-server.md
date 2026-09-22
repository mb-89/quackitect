---
kind: [[ticket]]
state: closed
group: findings
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box a05106ef44c2 · claude-code-remote
    hash_before: 56afe58ba748beaf63ffee075d02d00818c23bef
    hash_after: 56afe58ba748beaf63ffee075d02d00818c23bef
    answered:
      - name: tests
        exit: 0
        said: green, 18 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: 3 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
reason: done
---

# Ask

A reload that restarts the server leaves a server standing, or writes why it fell. Today the respawn runs detached with its output dropped, so a fall writes nothing and the desk starts one by hand. Done when a respawn whose server falls writes the reason to the log, and a case drives the fall through a fake process door.

# do

<!-- makes the change, with the test that covers it -->

## tests

./RUNME.sh branch test test/contract/proc.test.js test/contract/wire.test.js test/level0/server-crash.test.js

## check

./RUNME.sh check

## says

The restart hands the new server to the process door. The door starts it detached with its output in the serve log, and watches it for a window. A child ending inside the window is a fall. Then the old server writes one fatal line naming the exit and the line the child writes. A child standing past the window is the server, and the old one exits clean.

The respawn leaves the wire door, because starting a process is the process door's work. So the fake process door drives the fall in a case. The serve log's name stands once, in the log library, and the start road and the chat line read it there.

## checked

- the change follows the ask: a fall logs its reason, and a case drives it through a fake door
- the cleanup is in the change: the respawn leaves the wire door, and the serve log's name stands once
- every fact stands in one place: the design note holds the window and the file, and the code points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
