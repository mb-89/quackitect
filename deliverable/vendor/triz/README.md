---
kind: vendored-data
statement: The TRIZ contradiction matrix as data, vendored under MIT, because 1,254 filled cells are not prose.
---

# Vendored — the TRIZ contradiction matrix

`triz-matrix.json` holds Altshuller's contradiction matrix in a form the
engine can read.

The method that uses it is [[meth-triz]].

## What is in it

- 39 engineering parameters, each with an id, a name and a description.
- 1,254 filled cells, keyed `improving_degrading`, holding the principle
  numbers that historically resolved that conflict.

A `software_equivalent` rides every parameter. That is the translation step
the method card calls the one people skip, and having it written down is most
of why this file is worth vendoring rather than linking.

```
"1_2": [15, 8, 29, 34]
```

Improving parameter 1 while parameter 2 degrades has historically been
resolved by principles 15, 8, 29 and 34.

## WHY IT IS NOT A MARKDOWN TABLE

39 by 39 is 1,521 cells. As prose that is unreadable, unmaintainable and
unsearchable, and it would be the largest file in the repository by a wide
margin for no gain.

The matrix is DATA. It sits beside the method card rather than inside it, the
same way the lint's thresholds sit beside the lint's rules.

## Where it came from

github.com/SharathSPhD/triz-engine, file `triz-engine/data/triz-matrix.json`,
fetched 2026-08-08.

MIT licensed. The licence is kept beside it as `LICENSE-triz-engine.txt`,
which is what MIT asks for, and the only condition it imposes.

## What is NOT vendored, and why

The 40 inventive principles are written out in [[meth-triz]] rather than
taken from here. They are a short list a reader wants in the same breath as
the method, and a card that sends you to a JSON file to learn what principle
15 is called has failed at being a card.

## Upstream is not tracked

This is a snapshot. Nothing watches that repository, and nothing should — the
matrix has not changed since Altshuller published it.

Re-fetch only if a cell is found wrong, and record what changed.
