---
minted_in: i1
id: sty-work-the-register-as-a-table
type: "[[story]]"
statement: An engineer opens a register of a hundred notes as one live table, edits cells instead of files, and every edit lands in the note it came from.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: should
---

## Deck

A register is a folder of notes, and a folder of notes is unreadable as a
whole. I want the fifty requirements in front of me at once, sortable,
groupable, filterable — without the view becoming a second copy of anything.
|||
This is i1's own goal: prove a bases-equivalent live table. The spike exp-trunk-read-cost sized it; the chunk trunk-batch-reader built it.

---

I open the register as a table. Every note is a row, every frontmatter key
a column, and the table is derived from the files on every look. There is
no import step and no sync button.
|||
engine/bases.ts and engine/tables.ts derive the rows live; the stored-copy-never-beats-derived law in guidance/craft/software.md is the design rule.

---

I type into a cell. The note behind the row changes, and only that key —
the body stays byte-identical. I edit the note in the editor instead, and
the table agrees at the next look.
|||
The frontmatter writer engine/forms.ts withFrontmatter touches one key; the tsp-live-table suite pins the round trip, green in the 2026-08-11 battery.

---

I sort, group and filter, and the shape I built is written to the view's
own file, verbatim. Another tool that understands the format reads the
same view; nothing about it is ours alone.
|||
The view file is Obsidian's own bases format, read and written by engine/vault.ts and engine/basesclient.ts.

---

I ask the table something it cannot do. It refuses by name and lists what
it accepts, instead of hiding rows or guessing.
|||
The expression lane engine/expr.ts refuses unknown filters by name; the refusal shape is the house's typed remedy.
