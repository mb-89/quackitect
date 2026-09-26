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

`BRANCH` in `src/scripts/pull-route.js` lists the branch verbs a step may name under `needs`. The list drifts from the verbs `work` answers, in `src/scripts/work.js`:

| the verb | `BRANCH` | `work` |
|---|---|---|
| `new` | lists it | answers nowhere |
| `open` | lacks it | answers it |
| `unblock` | lacks it | answers it |

| what | where |
|---|---|
| the smallest case | a step carrying `needs: [branch open]`: `holdsVerb` answers false on a box that runs the verb |
| why it matters | the pull refuses a route over a verb the box holds, and the list drifts again each time a verb moves |
| where a stranger acts | `BRANCH` built from the verb table in `work`, so one place owns the names, and a case holding the two together |

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
