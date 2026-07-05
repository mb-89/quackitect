---
id: man-ch5-vv
type: manifest
mode: chapter
statement: Verification and validation - every requirement against its tests, live.
---
<!-- ai:3 -->
This table derives from the graph at render time. A [bless](term:bless) turns a row verified; a changed input turns it [suspect](term:suspect). The book can never claim more than the [gate](term:gate) states below.
---
```base
filters:
  and:
    - 'type == "test"'
views:
  - type: table
    name: Verification matrix
    order: [file.name, verifies, verify]
    groupBy: verifies
```