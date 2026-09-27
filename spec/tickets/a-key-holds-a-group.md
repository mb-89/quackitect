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
    hash_before: 7905a3c7a9fae05484277e8e733d3c971779a97b
    hash_after: 7905a3c7a9fae05484277e8e733d3c971779a97b
    inputs:
      - name: ask
        hash: 7284ded0b200ec4f
        size: 796
      - name: [[spec/design_output/work]]
        hash: b7f02b4b69038b04
        size: 36721
    def: 9e2520e6318baf46
reason: done
---

# Ask

<!-- line, as text: the smallest case that shows it, why it matters, and what a stranger needs in order to act on it -->

A group had no way to wait on the owner's word. A `by: person` step holds no cloud box, and a question ticket named under `depends_on` held only through a child.

| what | where |
|---|---|
| the smallest case | a migration group the owner means to hold until a shadow runs clean, and a cloud box taking it the moment its dependency lands |
| why it matters | the switch of a slice is the one moment the owner decides, and the cloud must wait for it |
| where a stranger acts | `readWork` and `waitsOf` in `src/scripts/work-stands.js`, and [[spec/design_output/work#a-switch-holds-a-group]] |

The fix lands with this note. A group names a key under `enabled_by`, and it waits while the tracked config on `main` reads anything but true there. The cases stand in `test/level0/work-switch.test.js`.

# decide

<!-- says what the note becomes, and closes it -->

## outcome

<!-- what the note becomes -->
<!-- the form is choice -->

done

## says

<!-- why, in a line, or what the successor carries -->
<!-- the form is text -->

The fix stands on main: readWork and waitsOf in src/scripts/work-stands.js hold a group while its enabled_by key reads anything but true on main, and test/level0/work-switch.test.js holds it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
