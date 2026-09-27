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

`withPort` in `.claude/skills/level0/lib/vehicle.js` hands a vehicle the first free port from `PORT_BASE` up. `PORT` in `src/bridge/window.js` stands at `PORT_BASE + 1`, so the second vehicle on a box takes the window door's port.

| what | where |
|---|---|
| the smallest case | two vehicles attached on one box: the second server takes the port the window door listens on |
| what follows | whichever of the two starts second finds its port taken |
| why it matters | the window and the second vehicle fail on a box running both, and the fault names neither |
| where a stranger acts | `withPort` and `PORT_BASE` in `.claude/skills/level0/lib/vehicle.js`, and `PORT` in `src/bridge/window.js` |
| what done looks like | the vehicles take a range the window stays out of, and a case holds the two apart |

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
