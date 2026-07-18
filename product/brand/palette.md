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

Types without an entry yet (function, question, the RAID kinds) get theirs here,
in this list, before any render uses them.
