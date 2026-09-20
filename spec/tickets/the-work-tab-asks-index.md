---
kind: [[ticket]]
state: open
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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The work tab draws off the index query and redraws on the index callback, so it is live on any box, and `work.json` goes.

<!-- breaks, as text: what breaks if it is never done -->
The tab waits for `branch answer`, and a person opening the TUI reads an empty tab or a stale one.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `src/tui/work.go` reads the index and no file, which `go -C src/tui test ./...` covers
- `.se/.runtime/work.json` stands nowhere in the tree, which `grep -rn work.json src` decides
- `spec/design_output/tui.md` says what the tab draws, and no longer says it stands empty

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
