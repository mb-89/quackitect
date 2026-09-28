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
    hash_before: bd54ac28b16e5cea18aa1104c711cbeef28c0d69
    hash_after: bd54ac28b16e5cea18aa1104c711cbeef28c0d69
    inputs:
      - name: ask
        hash: 34340ca527c1507d
        size: 739
    def: 9e2520e6318baf46
reason: done
---

# Ask

<!-- line, as text: the smallest case that shows it, why it matters, and what a stranger needs in order to act on it -->

`TicketPath` in `src/tui/draw/link.go` answers `spec/tickets/<name>.md` for every ticket. A private ticket stands under `.se/tickets`, and its link opens a file that stands nowhere.

| what | where |
|---|---|
| the smallest case | `./RUNME.sh ticket note slow-lint "..."`, then the work tab in the window: the row's link points under `spec/tickets` |
| why it matters | the work tab draws private notes beside travelling tickets, and a click on a private one opens nothing |
| where a stranger acts | `TicketPath` and `NotePath` in `src/tui/draw/link.go` |
| the callers | `pathOf` and `workFields` in `src/tui/work/work.go` |
| the folders | `TICKETS` in `.claude/skills/level0/lib/folders.js`, and `TRAVELS` in `src/scripts/ticket.js` |

# decide

<!-- says what the note becomes, and closes it -->

## outcome

<!-- what the note becomes -->
<!-- the form is choice -->

done

## says

<!-- why, in a line, or what the successor carries -->
<!-- the form is text -->

The window already links a row through the path the index answers, and the index reads .se/tickets with its own path. Commit 63270f0a2 adds a case in src/tui/work/workitems_test.go holding a private note there.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
