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
    hash_before: 39a5c79081a62e226fab430b6572c643f39f6188
    hash_after: 39a5c79081a62e226fab430b6572c643f39f6188
    inputs:
      - name: ask
        hash: 5139613addf89a3c
        size: 832
    def: 9e2520e6318baf46
reason: done
---

# Ask

<!-- line, as text: the smallest case that shows it, why it matters, and what a stranger needs in order to act on it -->

`branch list` and `branch take` read every ticket on every work branch through one `git cat-file --batch`. The answer grows with the branches, and past the process door's buffer the spawn throws `ENOBUFS`.

| what | where |
|---|---|
| the smallest case | a scratch origin holding this tree's open groups, each cut to its branch: the list and the take both throw |
| why it matters | every cloud box takes work through that read, so one more branch past the line stops the whole queue |
| where a stranger acts | `batch` in `src/doors/git.js`, and `readWork` in `src/scripts/work-stands.js` |

The fix lands with this note: the door asks in pieces of `BATCH_ASKS`. The read still grows with the branches, and a read of each distinct object once would cut it to one branch's worth. The cases stand in `test/level0/git-batch.test.js`.

# decide

<!-- says what the note becomes, and closes it -->

## outcome

<!-- what the note becomes -->
<!-- the form is choice -->

done

## says

<!-- why, in a line, or what the successor carries -->
<!-- the form is text -->

The fix stands on main: batch in src/doors/git.js asks in pieces of BATCH_ASKS, so readWork stays under the process door buffer, and test/level0/git-batch.test.js holds it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
