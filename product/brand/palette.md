---
id: palette
scope: brand
statement: quackitect palette — codex ink on parchment.
---
- ink      `#5A4326`   (codex sepia)
- faint    `#B49A6B`   (construction lines)
- parchment-hi `#F2E6C8` · parchment-lo `#E7D5AE`
- ok `#34D399` · suspect `#F59E0B` · open `#9CA3AF`

## Type colors — one color per node type, every render

Each node type wears ONE color, identical in every surface: trace graph, report,
book, timeline, register, matrix. No render defines its own.

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

A new node type gets its entry here, in this list, before any render uses it.
