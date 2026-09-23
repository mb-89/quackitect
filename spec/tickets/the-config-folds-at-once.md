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
group: the-review-lands-overnight
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 3a875d637478e84e1e0340d93ed66f3c8100d364
    hash_after: 3a875d637478e84e1e0340d93ed66f3c8100d364
    answered:
      - name: tests
        exit: 0
        said: green, 28 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A person opens or shuts every group of the config section in one press. So a
search through the keys starts with the whole tree in view, and a person closes
it again the same way.

<!-- breaks, as text: what breaks if it is never done -->
The config section folds one group at a time. A person looking for one key
opens each group by hand, and shuts each again after.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the config section draws an expand-all and a collapse-all button beside its filter, in `src/extension/lib/panel.js`
- a case under `test/level0` presses each one, and every group opens, then shuts
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/clicks.test.js test/level0/panel.test.js


## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check


## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The config section draws an open press and a shut press in one row with its
filter. A press sets `open` on every group of the config tree, through `folded`
in `src/extension/webview/clicks.js`. So a search through the keys starts with
the whole tree in view, and one press shuts it again.


## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: both presses stand beside the filter in `panel.js`
- the cleanup: the filter's margin moves onto the row holding it, and nothing else surfaced
- the fold rule stands in `extension.md#the-folds-press-at-once`, and the code points there


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
