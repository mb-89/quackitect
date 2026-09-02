---
id: wk-d2f6e959ef
seq: "73"
type: work
title: written reads back
status: aborted
assignee: main
scope: single-step
traced: true
disposition: dropped
reason: "Dropped as landed, wrongly, since reCompare refusing a compound value was never done and is now carried by wk-5bec911840, lesson wk-644aae4ac6."
aborted_from: backlogged
minted_by: reviewer4
---

## detail

The filter builder writes a person's groups as one string in filterbuild.go:96-115. FromExpression reads a list item back with reCompare at filterbuild.go:123, whose value group is anchored to the end. Two groups joined with && are read back as one comparison and one touch corrupts the file to 0 rows. One group of two rows in parentheses reads back as raw and becomes an uneditable block. Write each ANDed group as its own list item, and read parentheses or use the or: map for a group with two rows. Make reCompare refuse a value that is not a single literal, so a compound falls to Raw. Check: compile every shape the builder can produce, write it, read it back, and require the same groups and rows. Related: wk-5bec911840.
