---
kind: [[ticket]]
state: draft
steps:
  - name: run
    does: builds the trial and says what it shows
    by: anyone
    evidence:
      - name: shows
        form: text
        says: what the trial does, and what running it shows
  - name: decide
    does: keeps the trial, drops it, or grows it into a ticket of its own
    by: person
    to: owner
    input: run
    evidence:
      - name: decision
        form: choice
        options: ["keep", "drop", "grow"]
        says: keep moves the code into the tree, drop takes it out, grow mints a ticket
      - name: why
        form: text
        says: the reason under the decision, for a reader who was not there
process: [[spec/processes/experiment]]
process_hash: 9cd59862253a3a09
---

# Ask

<!-- question, as text: the question the trial answers, and what decides it -->

Can the owner follow the decision `ticket pull` takes, drawn as a graph in the editor's own React Flow? The owner decides it by reading the drawing. Keep grows a ticket that ports the queue to a graph file, and drop leaves the queue in code.

# run

<!-- builds the trial and says what it shows -->

## shows

<!-- what the trial does, and what running it shows -->

<!-- the form is text -->

The trial stands under `.se/scripts/queue-diagram`, in three files:

| file | holds |
|---|---|
| `graph.js` | the decisions of the pull as nodes and edges, each naming its source line |
| `app.jsx` | the page drawing them with the webview's own React Flow and layout |
| `build.mjs` | the bundle into one page, and a shot of it in Chromium |

The page draws every node with no page error. It shows three parts:

- a chain of guards, each ending the pull early
- pools sorted by score
- a loop over candidates, where each check skips to the next one

# decide

<!-- keeps the trial, drops it, or grows it into a ticket of its own -->

## decision

<!-- keep moves the code into the tree, drop takes it out, grow mints a ticket -->

<!-- the form is choice -->

## why

<!-- the reason under the decision, for a reader who was not there -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
