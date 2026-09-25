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
group: the-drawing-draws-a-route
depends_on: [the-drawing-bundles]
step: do
record:
  - step: do
    hand: box 742a1c2f7477 · claude-code-remote
    hash_before: 54d7b32b2b5d86a60539510e66a90fe7dcc71167
    hash_after: 53f209209aefdab54add2a8280800319e3f96ef6
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
One web page draws a ticket's route from the graph the emitter answers, and a host speaks to it through messages alone. The cloud box proves the page in a browser through a fake host, so the desk host meets a drawing that already works. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#the-drawing-draws-a-route]].

<!-- breaks, as text: what breaks if it is never done -->
The editor host has nothing to hold, and a person reads a route as YAML alone.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the page takes a `graph` message and draws every node and edge the graph carries, laid out by `@dagrejs/dagre`
- the page marks the pointer, a person's node, a dotted node, a skipped node and the returns
- the page answers `ready` once it loads, and takes a `theme` message
- a browser test drives the page through a fake host, and `./RUNME.sh check` runs it
- the protocol stands in one design output note, and the page and the test point at it

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

The page stands, and [[spec/design_output/drawing]] owns it: the classes, the messages and the fake host.

| file | holds |
|---|---|
| `src/extension/webview/route/layout.js` | the graph turned into React Flow's nodes and edges, placed by `@dagrejs/dagre` |
| `src/extension/webview/route/drawing.js` | the entry: it posts `ready`, and reads `graph` and `theme` |
| `src/extension/webview/route/drawing.css` | the marks, in the colours the editor sets on a webview |
| `test/level0/layout.test.js` | the layout in node |
| `test/contract/drawing-page.test.js` | the page in the browser install resolves, driven by a fake host |

The browser case loads the bundle into a blank page with `acquireVsCodeApi` faked. It posts a ticket's graph carrying every mark, and reads the classes back off each node. A box with no browser, or no modules, skips the case and names why.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, line for line
- the cleanup it reveals is in the change: the bundle child's placeholder entry gives way to the page
- the protocol stands in the design output note alone, and every function points at its heading

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
