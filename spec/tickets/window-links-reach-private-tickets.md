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

## says

<!-- why, in a line, or what the successor carries -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
