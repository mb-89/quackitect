---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-small-ask-stays-small/design/review
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-owners-word-reaches-work
parent: a-small-ask-stays-small
record:
  - step: do
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: 621b95798957153187726dbda406fe074402d87a
    hash_after: 621b95798957153187726dbda406fe074402d87a
    answered:
      - name: tests
        exit: 0
        said: green, 22 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-owners-words-travel-verbatim.md:154:1: ListItem: A sentence in a list item holds 20 words, and this one"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list misses the `tool.call` handler in `.claude/skills/level0/hooks/pull-tool.js`, which reads the spawn answer through `spawnPromptIn` in `.claude/skills/level0/lib/pull.js`, awaits `spawned` and pulls again. The new words tell the session to spawn in the background, so name that handler and keep what it does in step with the words

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/pull-spawn-hook.test.js test/level0/read-tools.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The pull tool's `tool.call` handler in `.claude/skills/level0/hooks/pull-tool.js` now spawns the hand in the background, once. It answers at once, so the lead takes the next item.

It used to wait on the hand and pull again. A second pull while the hand works answers the same spawn, so the handler pulls once.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the handler keeps in step with the spawn answer's words
- the cleanup the change reveals is in it: the round constant goes with the loop
- the words the handler adds stand once, in its constant

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
