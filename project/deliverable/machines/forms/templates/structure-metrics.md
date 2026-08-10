---
id: template-structure-metrics
statement: The structure numbers computed off the element matrix, each owed one typed line saying what it moved.
editor: structure-metrics
line_pattern: ""
line_help: "one line per number — what it moved. A number that moved nothing says so."
---

# structure-metrics

A READING with an interpretation beside it. The numbers take no input.

## What the field declares

```
- name: metrics
  template: structure-metrics
```

## What is computed

- interface debt — flows crossing element boundaries with no interface
  carrying them.
- allocation spread — functions implemented by more than one element.
- two-way pairs — element pairs with crossings in both directions.
- idle elements — elements implementing nothing.
- unimplemented functions — functions no element carries.
- undemanded interfaces — declared contracts no crossing demands.

## What a person still owes

ONE LINE PER NUMBER: what the number moved. A metric that changes no
decision is noise, and saying "moved nothing" is a complete answer.

## What it stores

Only the typed interpretation lines. The numbers are computed on every
look, so they cannot drift from the structure.
