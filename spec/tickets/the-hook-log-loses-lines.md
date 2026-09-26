---
kind: [[ticket]]
state: open
steps:
  - name: decide
    does: says what the note becomes, and closes it
    from: anyone
    by: retro
    to: retro
    input: ask
    evidence:
      - name: outcome
        form: choice
        options: ["dropped", "done", "became"]
        says: what the note becomes
      - name: says
        form: text
        says: why, in a line, or what the successor carries
step: decide
process: [[spec/processes/note]]
process_hash: 9d7b26202041cf4d
---

# Ask

<!-- line, as text: the smallest case that shows it, why it matters, and what a stranger needs in order to act on it -->

The bridgehead writes a log row by reading `.se/.log/session.jsonl` and writing it back one line longer, because `$.fs` offers no append. A row the server or the command line appends between the two goes.

| what | where |
|---|---|
| the smallest case | the server falls while the command line writes a row, and the hook writes the file back without that row |
| why it matters | the rows the hook writes say the bridge fell, which is the moment the owner reads the log for |
| where a stranger acts | `wrote` in `.claude/skills/level0/hooks/level0.js` |
| the note to change with it | the list under "Every writer appends" in `spec/design_output/log.md` |
| a road that keeps every line | the row through `$.process.run` to a node append, or through the server's log door once it answers |

# decide

<!-- says what the note becomes, and closes it -->

## outcome

<!-- what the note becomes -->

<!-- the form is choice -->

## says

<!-- why, in a line, or what the successor carries -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
