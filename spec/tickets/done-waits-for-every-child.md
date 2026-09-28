---
kind: [[ticket]]
state: closed
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
todo: false
record:
  - step: decide
    hand: box d7a4248a337e5a · claude-code
    hash_before: 647f994c9dc52b00439d76e0fc5f6c565a2307dc
    hash_after: 647f994c9dc52b00439d76e0fc5f6c565a2307dc
    inputs:
      - name: ask
        hash: 23e44b43bb65c4f6
        size: 734
      - name: [[spec/design_output/work]]
        hash: b7f02b4b69038b04
        size: 36721
    def: 9e2520e6318baf46
reason: done
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

done

## says

<!-- why, in a line, or what the successor carries -->
<!-- the form is text -->

The fix stands on main: finish in src/scripts/work.js refuses while a ticket naming the group stands open or draft, names each with its step and frees none, and test/level0/work-done.test.js holds it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
