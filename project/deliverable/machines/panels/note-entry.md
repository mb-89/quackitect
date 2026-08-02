---
id: note-entry
statement: Capturing a stray, as parameters. The engine READS this file; edit it here.
---

# The note entry

From the owner's sketch, 2026-08-01. One line carries BOTH the title and the
text, split on a forward slash, and a value without the separator is REFUSED
rather than guessed at. Enter drops the note. A MoSCoW priority sits beside it.

WHY ONE FIELD AND NOT TWO. Capturing is meant to be cheap — contract rule 4
says note it and keep walking. Two fields and a tab between them is more
ceremony than a stray is worth. One line, one separator, one key.

THE SEPARATOR IS DECLARED, not hard-coded in a handler. Changing it is an edit
to this file.

## Parameters

- note | text | note_body | title / the text — the slash splits them | / | one line: a title, a forward slash, then the body
- | choice | note_priority | could | should | must | how much it matters — you judge it, never the person
- ADD | action | /note | drop the note and clear the line
