---
id: template-exposure-pick
statement: The register's exposure chart — damage against likelihood, every standing entry a dot — with the pick list beneath it.
editor: exposure-pick
resolves: artifact
line_pattern: ""
line_help: one register ref per line — the picked unknowns
---

# exposure-pick

A READING with a pick beneath it. The chart takes no input.

## What the field declares

```
- name: seeded
  template: exposure-pick
  of: raid
```

## What is computed

- Every standing register entry (not closed, not superseded), placed by
  its two grades: damage on the horizontal, likelihood on the vertical.
- The axis orders come from the catalogue cards — meth-damage-scale and
  meth-likelihood-scale. The hot corner is top right.
- Hover a dot for the entry's name and statement. Click it to open the
  entry in the editor.
- An ungraded entry cannot be placed and is named beside the chart.

## What a person still owes

THE PICK: which entries earn a spike. One register ref per line in the
rows beneath the chart. The chart informs; the list decides.

## What it stores

Only the picked refs. The chart recomputes from the register on every
look, so it cannot drift from the grades.
