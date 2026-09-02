---
kind: [[guidance]]
scope: ["every guidance file"]
out_of_scope: ["work tokens", "source comments"]
depends_on: ["[[voice]]"]
---

# Motivation

Guidance is what an agent holds before it acts.
An agent handed essays writes essays.
An agent handed rules writes to the rules.

The schema in [[src/schemas/guidance.schema.yaml]] says what shape this is.
The rules below say what goes in it.

# Actionables

1. The engine hands an agent the Actionables and nothing else. *
2. A rule a program can check is a check, not a rule. Move it to the schema or a lint. *
3. Write each rule as what to do. Use a negative for a refusal, a limit or a warning.
4. Name a note, a schema or a file as a link, so a reader walks to it.
5. A rule with a chapter carries a star. The chapter's title starts with that rule's number. *
6. Name what a file rests on in depends_on. Do not repeat a rule it already carries.

# Discussion

## 1. Token economics

Guidance rides with every call and costs tokens. It should be terse.
Motivation keeps the reason from being lost.
Actionables stays small enough to hold.
Discussion takes the argument, so it stops leaking into the other two.

## 2. Checks over prose

A guidance sentence that a program can check is a sentence somebody has to
remember.
The voice checker refuses a semicolon at the write, and nobody has to remember
that rule.
Where a rule cannot be checked it stays as prose, and the prose says what to do
rather than why.

Four rules left this list on the day the schema arrived, because the schema
refuses what they asked for: three chapters in order, a bounded motivation, a
bounded list, and a bounded discussion.

## 5. Stars and numbers

Standards put a star on a term they explain in an appendix, and the reader
follows the star.
Here the star sits on the rule and the number sits on the chapter, so the walk
goes both ways.

Markdown footnotes were tried first and refused.
A footnote renders as a flat list at the foot of the document, which loses the
chapter structure the schema reads and the book draws.
