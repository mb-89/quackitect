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
process_hash: e02a0935ed78eb92
---

# Ask

<!-- line, as text: the smallest case that shows it, why it matters, and what a stranger needs in order to act on it -->

`branch done` stripped the `group` field off every open ticket of the group, then closed the group `done`. So a group closed with its work unbuilt.

| what | where |
|---|---|
| the smallest case | phase 2's shadow group: two tickets landed, five stood open at design, and `branch done` freed the five and closed the group |
| why it matters | a merged group reads as built, and every group waiting on it starts over a hole |
| where a stranger acts | `finish` in `src/scripts/work.js`, and [[spec/design_output/work#a-box-leaves]] |

The fix lands with this note. `branch done` refuses while a ticket naming the group stands open or draft, names each with its step, and frees none. The cases stand in `test/level0/work-done.test.js`.

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
