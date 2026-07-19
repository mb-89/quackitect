---
id: palette
scope: brand
statement: Generic colour tokens (engine default). A vehicle overrides with its own palette.
---
- ink      `#1F2A37`
- surface  `#FFFFFF`
- muted    `#6B7280`
- accent   `#2563EB`
- ok       `#10B981`  · suspect `#F59E0B` · open `#9CA3AF`

## Type colors — one color per node type, every render

Each node type wears ONE color, identical in every surface: trace graph, report,
book, timeline, register, matrix. No render defines its own. A vehicle overrides
this list with its own palette; a new node type gets its entry before any render
uses it.

- need `#ffe0b2`
- usecase `#fff3b0`
- requirement `#cfe3fb`
- design `#cdeccd`
- test `#e9d5f3`
- adr `#d7ccc8`
- function `#d2ede4`
- question `#f6dbe6`
- risk `#c0392b`
- assumption `#2762c4`
- issue `#7d3fa8`
- dependency `#2f8f4e`
