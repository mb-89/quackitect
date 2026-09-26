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

The language server takes its root as `filepath.Abs` answers it, and compares a standing root as a string. The index upper-cases the drive letter first, and the language server skips that step.

| what | where |
|---|---|
| the smallest case | the editor starts `se-lsp` under `c:\tree`, and a shell asks it under `C:\tree` |
| what follows | `current` reads the standing file as another tree's, `reaches` stops that server, and each front stops the other's in turn |
| why it matters | on Windows the editor and the shell spell the drive in two cases, so the server restarts on every ask |
| where a stranger acts | `rootHere` and `current` in `src/lsp/main.go` |
| the rule to share | `rooted` in `src/index/main.go` |

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
