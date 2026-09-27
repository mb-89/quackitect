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
    hash_before: 4b5123b60c63be9bce95020b955901362c97c2d5
    hash_after: 4b5123b60c63be9bce95020b955901362c97c2d5
    inputs:
      - name: ask
        hash: cdc3940e9b9938b2
        size: 689
      - name: [[spec/design_output/work]]
        hash: b7f02b4b69038b04
        size: 36721
    def: 9e2520e6318baf46
reason: done
---

# Ask

<!-- line, as text: the smallest case that shows it, why it matters, and what a stranger needs in order to act on it -->

`take` in `src/scripts/work.js` read the first free group alone. A group whose children all wait left the take at that group, and every cloud box stopped there.

| what | where |
|---|---|
| the smallest case | two free groups, the first waiting on a question open on `main`, and a take that claims nothing |
| why it matters | a gate on one migration group held every other group in the tree up |
| where a stranger acts | `take` in `src/scripts/work.js`, and [[spec/design_output/work#the-take-writes-the-record]] |

The fix lands with this note. The take reads each free group in turn and claims the first holding a step a hand takes. The cases stand in `test/level0/work-gate.test.js`.

# decide

<!-- says what the note becomes, and closes it -->

## outcome

<!-- what the note becomes -->
<!-- the form is choice -->

done

## says

<!-- why, in a line, or what the successor carries -->
<!-- the form is text -->

The fix stands on main: take in src/scripts/work.js walks each free group and claims the first holding a step a hand takes, and test/level0/work-gate.test.js holds it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
