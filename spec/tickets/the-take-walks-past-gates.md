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

`take` in `src/scripts/work.js` read the first free group alone. A group whose children all wait left the take at that group, and every cloud box stopped there.

| what | where |
|---|---|
| the smallest case | two free groups, the first waiting on a question open on `main`, and a take that claims nothing |
| why it matters | a gate on one migration group held every other group in the tree up |
| where a stranger acts | `take` in `src/scripts/work.js`, and [[spec/design_output/work#the-owner-opens-the-gate]] |

The fix lands with this note. The take reads each free group in turn and claims the first holding a step a hand takes. The cases stand in `test/level0/work-gate.test.js`.

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
