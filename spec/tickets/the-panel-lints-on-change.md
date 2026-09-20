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
group: the-panel-reads-every-change
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Every source redraws a file on change, as typed, the way the server's own rules do today. The bridge's findings, Vale among them, refresh on change and wait for no save.

<!-- breaks, as text: what breaks if it is never done -->
A Vale finding stays on the panel after a person fixes the line, until the file saves, so the panel lags the editor.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- a change to an open file asks the bridge again within a second, which `src/lsp/panel_test.go` covers
- the server gathers the changes of a second into one lint, which `src/lsp/panel_test.go` covers

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
