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

Four places pick the home folder, each in its own order, and one of them reads `HOME` alone:

| the place | the order it reads |
|---|---|
| `main` in `src/scripts/trust.js` | `HOME` alone |
| `homeIn` in `src/scripts/editor.js` | `USERPROFILE`, then `HOME` |
| `cacheOf` in `src/scripts/browser.js` | `LOCALAPPDATA`, then `HOME`, then `USERPROFILE` |
| `ENV` in `src/stub/.claude/skills/level0/hooks/bridgehead.js` | `HOME`, then `USERPROFILE` |

| what | where |
|---|---|
| the smallest case | a Windows box carrying `USERPROFILE` and no `HOME` runs `node src/scripts/trust.js` as its setup, and no trust flag lands |
| a second case | a Git Bash box carrying both reads one home in the editor verb and another in the bridgehead |
| why it matters | the trust flag, the editor link and the stub's vehicle land under different folders on one box |
| where a stranger acts | `homeIn` as the one owner, the other three calling it, and a case per variable order |

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
