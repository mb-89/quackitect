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

The sidebar writes a log line by reading `.se/.log/session.jsonl` and writing it back one line longer. A line another writer appends between the read and the write goes.

| what | where |
|---|---|
| the smallest case | the command line appends a row while a press in the sidebar writes its own, and the file keeps the press's row alone |
| why it matters | the session log is the record the owner and the retro read, and a lost row hides what a session did |
| where a stranger acts | `logbookOf` in `src/extension/lib/logbook.js`, and `fileDoor` in `src/extension/editor-files.js` |

The fix lands with this note. `vscode.workspace.fs` offers no append, so the editor door appends through node's `appendFile`, and `logbookOf` calls it. The cases stand in `test/level0/logbook.test.js` and `test/contract/editor-files.test.js`.

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
