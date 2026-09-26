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

Code nothing runs stands in the tree. A search for each name over `src`, `test` and `.claude` finds the callers below:

| what | where | its callers |
|---|---|---|
| `readThroughTheReader` | `src/scripts/cli-read.js` | none |
| `lintedBy` | `src/scripts/prepush.js` | `test/level0/prepush.test.js` alone |
| `branches`, `frontField`, `ticketsOn` | `src/scripts/work-stands.js` | none |
| `freeNow` | `src/scripts/work-free.js` | `test/level0/stand.test.js` alone |
| `WordsIn`, `PointerIn`, `RuleIn` | `src/lsp/config.go` | none |
| the inset probe | `.claude/skills/inset-probe` | `test/level0/inset-probe.test.js`, for a closed trial |

| what | where |
|---|---|
| the smallest case | `readThroughTheReader`, which one search over the tree shows standing alone |
| why it matters | a reader opens code that runs nowhere, and a test holds a road no caller takes |
| where a stranger acts | each row above leaves with its cases |
| what stays | `spec/tickets/the-editor-takes-an-inset.md` keeps the probe's findings once its folder goes |

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
