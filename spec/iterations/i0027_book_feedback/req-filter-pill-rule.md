---
id: req-filter-pill-rule
type: requirement
depends_on: []
statement: Where a table filters on several dimensions, the book shall render one vertical column per dimension: the header names the category, the chips are its filter values with counts. A single dimension shall render one horizontal pill row.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Filter mechanism (owner, 2026-07-17) — generic

- A filter is generic. The column header names a category. The chips under it are the values you filter by.
- In the design-input register the categories are need and type.
- Each chip shows its value's count.
- Chips combine: several may be selected, across columns.
- An empty value stays visible and clickable, showing zero.
- A column of more than ten values scrolls, with a scroll arrow on the top and on the bottom.
- One dimension only renders as a single horizontal pill row.

## Rationale (not load-bearing)
The same mechanism serves every filtered table, not only the register.
