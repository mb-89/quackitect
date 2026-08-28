---
id: note-entry
statement: Putting something into the system from the surface — a note or a piece of work. The engine READS this file; edit it here.
---

# The entry panel

From the owner's sketch, 2026-08-01. One line carries BOTH the title and the
text, split on a forward slash, and a value without the separator is REFUSED
rather than guessed at. Enter drops the note. A MoSCoW priority sits beside it.

WHY ONE FIELD AND NOT TWO. Capturing is meant to be cheap. Two fields and a tab
between them is more ceremony than a stray is worth. One line, one separator,
one key.

A NOTE IS FOR THE NEXT RETRO, and the work entry beside it is for everything
else. Contract rule 4 carries the test: name the state where the thing gets
done and it is a token, not a note.

THE SEPARATOR IS DECLARED, not hard-coded in a handler. Changing it is an edit
to this file.

## The work entry

A piece of work goes in the same way a note does. One line, one button, and it
lands in the backlog until somebody places it.

IT SITS HERE AND NOT IN THE EDITOR. The editor is two database views, and a
database view lists what exists rather than making more of it. Both entries are
the same act, so they are in the same panel.

IT TAKES THE SAME SEPARATOR A NOTE DOES. Four words name the work, then a
forward slash, then everything else. The name goes on the bar and the rest goes
into the token's body.

FOUR WORDS, AND THE NAME IS REFUSED ABOVE THAT. A token NAMES its work; it does
not describe it. The bar draws the work in hand beside the position, and a
sentence there is unreadable at a glance.

EVERY OTHER SEPARATOR COUNTS AS A SPACE — an underscore, a dash, a colon. So
joining words together does not fit more in, which is the workaround the count
exists to close.

THE DETAIL IS NOT OPTIONAL IN PRACTICE. A token holding nothing but four words
tells the next hand — a person, or another agent — nothing about what was
actually asked for. Writing no slash is legal, and it is a token nobody else can
pick up.

## Parameters

- note | text | note_body | title / the text — the slash splits them | / | one line: a title, a forward slash, then the body
- | choice | note_priority | could | should | must | how much it matters — you judge it, never the person
- ADD | action | /note | drop the note and clear the line
- work | text | work_statement | four words / then the details | / | four words name it, then a slash, then everything the next hand needs — a dash, an underscore or a colon counts as a space in the name
- ADD WORK | action | /work/mint | add it to the backlog and clear the line
