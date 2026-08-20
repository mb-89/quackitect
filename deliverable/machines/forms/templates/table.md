---
kind: form-template
name: table
statement: a typed table — the columns are the field's arguments
editor: table
line_help: a markdown table whose header matches the field's declared columns, with at least one data row
---

The field's truth is a markdown table. The header row carries the
declared columns. Every data row fills all of them — the mechanical
check counts the cells and REFUSES prose.

## THE FIELD'S ARGUMENTS

The template stays generic. A field makes it concrete with two lists, in
the same order.

- `columns` — the header.
- `column_help` — what to type in each one.

BOTH RIDE THE REFUSAL. A header of single words leaves the filler
guessing, and counting cells cannot catch a guess, so the message names
what each column wants.

## THE EDITOR IS STILL A TEXT BOX, AND THAT IS A DEFECT

The checker has had a `table` branch since this template existed. The
RENDERER never got one, so the field falls through to the generic
textarea and a person types the markdown by hand.

The check holds either way — prose is refused and the cell count is
enforced — so nothing wrong can be SAVED. What is missing is the widget.
Tracked; see the note filed 2026-08-08.
