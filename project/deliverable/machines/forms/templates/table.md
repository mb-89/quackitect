---
kind: form-template
name: table
statement: a typed table — the columns are the field's arguments
editor: table
line_help: a markdown table whose header matches the field's declared columns, with at least one data row
---

The field's truth is a markdown table. The header row carries the
declared columns. Every data row fills all of them — the mechanical
check counts the cells.

The editor shows a plain text box for now; write the table directly.
The check holds either way, and generated views build from the rows.
