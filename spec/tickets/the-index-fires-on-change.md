---
kind: [[ticket]]
state: closed
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
group: the-work-tab-reads-tickets
step: do
record:
  - step: do
    hand: box 51c5005e133c · claude-code-remote
    hash_before: 733b6dedf6dda4c2617ee754f99cdd0ee52e0e45
    hash_after: 733b6dedf6dda4c2617ee754f99cdd0ee52e0e45
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s); green, src/index passes
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The index fires a callback when a file under the tree changes, so a reader redraws the moment a ticket changes and polls nothing.

<!-- breaks, as text: what breaks if it is never done -->
The work tab polls a file's time every second, and a change reaches it late or not at all.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the index exposes a subscription over disk changes, which `src/index` tests cover with a written file
- the callback fires within a second of a ticket write, which a contract case decides

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test

## check

    ./RUNME.sh check

## says

The door answers `changes`. The call names the tick a reader holds, waits for
a sweep past it, and answers the tick then. So a reader redraws on each answer
and polls nothing. For the shape, see
[[spec/design_output/index#the-index-fires-on-change]].

| what | where it stands |
|---|---|
| the tick | `door.go`, counted one at the walk up and one a sweep that wrote |
| the wait | `awaits`, which holds no guard, so every other call answers past it |
| the proof | a Go case writing a file, and a contract case timing the call |

The wake is a channel a sweep closes and makes again. So every waiting call
wakes at once, and the sweep blocks on none of them. A call outliving its wait
answers the tick it holds. That wait stands under the one a caller gives a
post, so a reader asks again and no post times out.

## checked

- the change follows the ask: the door exposes the subscription, and both cases cover it with a written file
- the cleanup it reveals: none, because the sweep already stood in one place and the tick hangs off it
- every fact stands once: the shape stands in the index note, and the code points at its chapter

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
