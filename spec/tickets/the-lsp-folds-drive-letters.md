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
    hash_before: 841b0b57e2bdccdb436192d06ef3b938d9299f84
    hash_after: 841b0b57e2bdccdb436192d06ef3b938d9299f84
    inputs:
      - name: ask
        hash: c1ef18e1b9acb394
        size: 720
    def: 9e2520e6318baf46
reason: done
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

done

## says

<!-- why, in a line, or what the successor carries -->
<!-- the form is text -->

Fixed in cb50e5323: rootHere and current in src/lsp/main.go fold the drive letter the way rooted in src/index does, and a case in src/lsp/serve_test.go holds it. The file leaves with the lsp switch.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
