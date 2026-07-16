---
id: req-adopt-honest
type: requirement
statement: The ratchet shall adopt honestly or say why it cannot.
---
## Statements
1. If adoption cannot replace the binary, then quack build shall report staged and pending with the blocker.
2. The ratchet shall park displaced binaries under unique names, so a pinned image never wedges later adoptions.

The wedge class cost two debug loops on 2026-07-15. The supervisor pin made it chronic.
