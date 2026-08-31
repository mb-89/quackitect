---
id: wk-d2f6e959ef
seq: "73"
type: work
title: written reads back
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: reviewer4
---

## detail

A writer and a reader of one file that do not agree, with a safety net the writer's own output slips through. The filter builder compiles a person's groups into one string: rows inside a group joined with || inside parentheses, groups joined with && (filterbuild.go:96-115), and SetFilter writes the lot as one list item. FromExpression reads a list item back with reCompare (filterbuild.go:123), whose value group is anchored to the end of the string.

TWO SHAPES THE BUILDER PRODUCES AND THE READER CANNOT READ, both reproduced end to end against a lab tree.

Two groups. status == "open" && assignee == "main" is written correctly and the pane answers 12 rows. Read back, reCompare matches it as ONE comparison whose value is open" && assignee == "main. The page redraws its builder from that and one touch sends it back: the file becomes status == "open\" && assignee == \"main" and the pane answers 0 rows. Adding a second filter group empties the table on the next visit.

One group, two rows. (status == "open" || status == "in_work") is written correctly and answers 13 rows. Read back it is raw, so the person's two rows become an uneditable block the builder will not draw.

THE REMEDY IS PROVED for the first: written as two list items the same filter answers the same 12 rows and round-trips exactly, because the list is already ANDed. For the second the parentheses have to be understood or the or: map used, which the reader already handles.

AND THE NET HAS TO CATCH THE REST: make reCompare refuse a value that is not a single literal, so a compound falls to Raw instead of being misread.

THE CHECK, RED TODAY: compile every shape the builder can produce, write it, read it back, and require the same groups and rows.

Found on wk-5bec911840.

