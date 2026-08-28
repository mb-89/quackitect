---
id: wt-rule-on-whether-the-shipped-difficulty-grid-arrives-with-sco
type: "[[work]]"
statement: "Rule on whether the shipped difficulty grid arrives with scores in it. Four cases build a fixture by copying the live grid, then assert a cell is unscored before the case scores it. Every such cell arrives already scored, so two cases fail outright and two more wait for a rejection that never comes, since no gap exists for the code to reject. One side is wrong and which is not obvious: either the grid should ship bare and its scores belong elsewhere, or the fixture should clear what it copies. Changing either without the ruling risks throwing away scores somebody chose."
ready_when: ready when a round takes the difficulty grid or its tests, and before anyone reads a red battery here as a branch's own fault
source: note-a2f7d5c5e5ca
---

## Why it stands

Rule on whether the shipped difficulty grid arrives with scores in it. Four cases build a fixture by copying the live grid, then assert a cell is unscored before the case scores it. Every such cell arrives already scored, so two cases fail outright and two more wait for a rejection that never comes, since no gap exists for the code to reject. One side is wrong and which is not obvious: either the grid should ship bare and its scores belong elsewhere, or the fixture should clear what it copies. Changing either without the ruling risks throwing away scores somebody chose.

## When it comes back

ready when a round takes the difficulty grid or its tests, and before anyone reads a red battery here as a branch's own fault
