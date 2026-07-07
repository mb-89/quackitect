---
id: req-id-charset
type: requirement
depends_on: []
statement: The lint shall refuse a node id containing a character outside lowercase letters, digits, and hyphens, or containing consecutive hyphens outside a connection id's separators.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
Ships BEFORE migration: '--' is the connection-id separator, and Windows folds case (red-team findings 8/9). Zero violations exist today.
