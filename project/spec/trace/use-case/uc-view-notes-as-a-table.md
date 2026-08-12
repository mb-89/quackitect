---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: uc-view-notes-as-a-table
type: "[[use-case]]"
statement: See every note of a kind as one row each, live from the files, and edit them there.
actor: stk-engineer-driving-agents
trigger: a register has grown past what a folder listing can show
precondition: a view file names the kind and the columns
guarantee: every row derives from a note, and every edit landed in exactly that note
refines:
  - sty-work-the-register-as-a-table
priority: could
---

## Main scenario

1. The engineer opens the view. Every note of the kind is one row, derived from the files at that look.
2. They read a cell. It carries the note's own frontmatter value, in the type the value actually holds.
3. They edit a cell. The key lands on the note; the body is untouched.
4. They edit a note directly instead. The table agrees at the next look, with nothing to synchronise.

## Extensions

- 1a. A note in the folder does not parse. The row says so instead of vanishing.
- 2a. The cell holds a list. It renders one entry per line, never a serialization artifact.
- 3a. The edit's value does not fit the key's type. The write refuses and the note is untouched.
- 3b. The cell is computed (a file field, a nested value). It is locked, with the reason shown.
