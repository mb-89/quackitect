---
id: req-marker-scan
type: requirement
statement: The design scan shall stop a region's statement at the next marker.
---
## Statements
1. If a comment block runs into the next design marker, then the scan shall end the statement before it.

The i24 wave's assembler found the absorption: a region whose comments touch the next marker pollutes its own derived statement with the neighbor's text.
