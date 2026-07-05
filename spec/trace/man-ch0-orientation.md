---
id: man-ch0-orientation
type: manifest
mode: chapter
statement: Orientation - who reads what, and where to start.
---
<!-- ai:3 -->
This book compiles from the project's [ledger](term:ledger) and [trace](term:trace). Nobody wrote it by hand. Pick the view that matches your question - each button narrows the book to the chapters that serve you. Every claim traces to a verified check, and every AI-written paragraph says so in its margin.
---
```base
filters:
  and:
    - 'type == "stakeholder"'
views:
  - type: table
    name: Stakeholders
    order: [file.name, role, interest, influence, weight]
    sort:
      - property: role
        direction: ASC
```
---
fig: context-star