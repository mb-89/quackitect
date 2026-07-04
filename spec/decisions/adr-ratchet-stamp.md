---
id: adr-ratchet-stamp
type: adr
addresses: [req-ratchet-semantic]
adjudicated_by: human
statement: quack build writes a version stamp into the vendored source; the launcher ratchets only when the vendored stamp exceeds the installed binary version. Forward only. Mtime comparison is retired (fresh clones rebuilt the binary backward).
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
