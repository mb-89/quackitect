---
kind: [[ticket]]
state: closed
group: the-bridgehead-carries-its-closure
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
    hand: box 201f76ea75a2 · claude-code-remote
    hash_before: b07fd7f3dc722ad86864210a93e6b5a7d0d80d7a
    hash_after: b07fd7f3dc722ad86864210a93e6b5a7d0d80d7a
    answered:
      - name: tests
        exit: 0
        said: green, 14 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 3 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
reason: done
---

# Ask

One post answers a tool call, so a dead server costs one round and no more.

The bridgehead posts each event through its `*` door, and the read tool road
posts the same call again. A box whose server answers nothing pays that twice,
and a reader waits through both.

- a call of a read tool reaches the server once where one stands
- `test/level0/read-tools.test.js` counts the posts a live server takes
- `./RUNME.sh test` covers the count over each read tool

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/read-tools.test.js

## check

    ./RUNME.sh check

## says

A call of a read tool takes the `*` door every event takes, and the hook holds no door of its own for it. `seen` reads a tool call naming a read tool, and hands it to `reads`, which posts once, and answers where a server stands. Meeting none, it runs the start, waits on the health, and posts once more on the far side. So a dead server costs one post before the start and one after, in place of two before.

What the fold changes beside the count. The `*` door hands the engine the `result` field of the server's answer. The old road handed it that field inside one more `result`, one wrap past the door. No live run reads which shape the engine takes, so the fold leans on the door, which every other tool call goes through. The old road also dropped the `register` list riding the first answer a fresh server gives. Both go through `seen` now.

The cases drive the `*` door with a `next` chaining into any door filtered on the tool, the way the engine chains. So the count reads true whichever shape the hook takes. The fake server answers in the shape the real one does. The chapter The first call pays names the door and the count.

## checked

- the change follows the ask. One post reaches a live server, the cases count the posts, and the loop covers each read tool.
- the cleanup in it: the extra wrap and the dropped register list go with the fold, and says names both.
- the road stands in `reads` alone, and the chapter names it, so no second door spells it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
