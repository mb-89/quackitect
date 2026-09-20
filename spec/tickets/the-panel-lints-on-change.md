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
group: the-panel-reads-every-change
step: do
record:
  - step: do
    hand: box 5fb6c1c050cd · claude-code-remote
    hash_before: 6a6c7bccb101ea10af17c262c021e07da13f17bf
    hash_after: 6a6c7bccb101ea10af17c262c021e07da13f17bf
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s); green, src/lsp passes
      - name: check
        exit: 0
        said: The rules pass.
reason: done
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

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Before this change the bridge reads a file off the disk alone, so a Vale finding stays until the file saves. The change carries the buffer to the bridge after a quiet pause.

| where | what changes |
|---|---|
| `src/lsp/panel.go` | a change to an open file waits the quiet span, and every change inside it joins one ask |
| `src/lsp/bridge.go` | `bridgeHeld` posts the held buffers to the bridge, and `lintQuiet` names the span |
| `src/bridge/server.js` | `POST /findings` takes the held buffers |
| `src/bridge/findings.js` | `heldOver` reads each buffer through the Vale door at its own path, the tense reader and the code faults |
| `.claude/skills/level0/lib/vale.js` | `UNREASONED` names the exemption rule once, so the bridge labels its source |

The chapter the code points at says which reader takes the buffer. [[spec/design_output/lsp#the-panel-lints-as-typed]]

What I weigh: the ask names the span as a second. The test on the one ask holds the server's own span, and the test on the burst holds a short one. A file the editor closes inside the span asks nothing, because the close reads the disk for it already.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask. A change asks the bridge inside the quiet span, and a burst joins one ask, both under `src/lsp/panel_test.go`.
- the cleanup the change reveals is in the change. `decoded` reads the bridge's answer for both asks, and `ceilingsOf` reads the ceilings for both routes.
- every fact the change adds stands in one place, and a note points at the file. The span stands in `bridge.go`, the route in `findings.js`, and the chapter points at both.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
