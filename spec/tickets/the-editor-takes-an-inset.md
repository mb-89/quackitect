---
kind: [[ticket]]
state: open
steps:
  - name: run
    does: builds the trial and says what it shows
    by: anyone
    reads: [[spec/guidance/working]]
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
process_hash: d68c3df9079c6d4a
group: the-editor-holds-the-drawing
step: run
---

# Ask

<!-- question, as text: the question the trial answers, and what decides it -->
Does the owner's VS Code draw a web page between the lines of a ticket through `createWebviewTextEditorInset`? The trial turns the proposed API on through `--enable-proposed-api quackitect.quackitect` and through `argv.json`. It answers whether the page draws, whether a window already running takes the flag, and whether the inset grows with a long route. A page drawn inside the text decides yes. A refusal sends the host to the side panel. The plan stands in [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]].

# run

<!-- builds the trial and says what it shows -->

## shows

<!-- what the trial does, and what running it shows -->

<!-- the form is text -->

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
