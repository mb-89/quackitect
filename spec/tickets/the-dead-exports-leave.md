---
kind: [[ticket]]
state: closed
todo: false
step: decide
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
process: [[spec/processes/note]]
process_hash: e02a0935ed78eb92
record:
  - step: decide
    hand: box d7a4248a337e5a · claude-code
    hash_before: 0792b508ae61d105eee111d1e968953c2a01ae33
    hash_after: 0792b508ae61d105eee111d1e968953c2a01ae33
    inputs:
      - name: ask
        hash: fcf3b38e9837c736
        size: 1040
    def: 9e2520e6318baf46
reason: done
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

dropped

## says

<!-- why, in a line, or what the successor carries -->
<!-- the form is text -->

Every row but the probe stands in a file the migration ports and deletes, src/scripts in phase 4 and src/lsp in phase 7, and a port takes no dead export. The inset probe left in 7f7aaca27.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
