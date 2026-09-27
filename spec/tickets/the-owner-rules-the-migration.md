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
    hash_before: 4d7cc6fef3be3ba0ad5dc148f17c5dd5ff37ba89
    hash_after: 4d7cc6fef3be3ba0ad5dc148f17c5dd5ff37ba89
    inputs:
      - name: ask
        hash: 8025c09c1e2f6b05
        size: 889
    def: 9e2520e6318baf46
reason: done
---

# Ask

<!-- line, as text: the smallest case that shows it, why it matters, and what a stranger needs in order to act on it -->

The owner rules four questions of the migration, and a rationale note carries each one, so an agent finds the argument before it decides again.

| the ruling | the note |
|---|---|
| the index reads SQLite through the pure Go driver | `spec/rationales/the-index-drops-cgo.md` |
| the Go code stands in one module | `spec/rationales/go-stands-as-one-module.md` |
| git is the archive and the transport | `spec/rationales/git-stays-the-archive.md` |
| the cage refuses while the engine stands down | `spec/rationales/the-cage-refuses-while-down.md` |

| what | where |
|---|---|
| the smallest case | an agent planning the migration meets cgo in `src/index` and asks whether to keep it |
| why it matters | the owner answered, and a second ask costs the owner a read the first answer paid for |
| where a stranger acts | the four notes above, each naming the chapter the migration replaces |

# decide

<!-- says what the note becomes, and closes it -->

## outcome

<!-- what the note becomes -->
<!-- the form is choice -->

done

## says

<!-- why, in a line, or what the successor carries -->
<!-- the form is text -->

The four rulings stand in spec/rationales: the-index-drops-cgo, go-stands-as-one-module, git-stays-the-archive and the-cage-refuses-while-down, and the migration design input lists them under The settled rulings.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
