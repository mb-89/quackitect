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

| the part | what it is |
|---|---|
| the trial | a probe extension, `quackitect.inset-probe`, under `.claude/skills/inset-probe` |
| the first draw | a long route in an inset over the group ticket's first line, whose page posts its height back |
| the grow | the inset drawn again at the lines that height asks for |
| the finding | `.se/probe/inset.json`, and then the window closes |
| the flag road | `code --new-window --extensionDevelopmentPath=<tree>/.claude/skills/inset-probe --enable-proposed-api quackitect.inset-probe` |
| the list of extensions | untouched, since the probe runs as a development extension |

| the question | what the run shows |
|---|---|
| does the page draw | yes: the API stands on, and the page's script posts back from inside the ticket |
| does a running editor take the flag | yes for the new window the command opens inside it. A window open before the command stays untried |
| does the inset grow with a long route | yes: the inset draws again at the lines the page's height asks for, and the page posts back |
| does the `argv.json` road hold | open: it wants the owner's editor restarted, so the decide step takes it |

The probe reads the page's own report, and sees no pixels. So the owner looks at `decide`: the page stands between the lines, and fits the grown inset.

The linked extension runs in the window a person opens by hand, with no flag. So `argv.json` is the road for daily use, and the flag serves a trial.

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
