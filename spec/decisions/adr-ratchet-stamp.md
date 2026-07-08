---
id: adr-ratchet-stamp
type: adr
adjudicated_by: human
statement: quack build writes a version stamp into the vendored source; the launcher ratchets only when the vendored stamp exceeds the installed binary version. Forward only. Mtime comparison is retired (fresh clones rebuilt the binary backward).
class: review
killer: false
---
## Rationale (not load-bearing)
The global binary ratchets itself forward from vendored source.
The first design compared file mtimes.
A fresh clone stamps checkout-time on old source, so the engine rebuilt itself backward.
A committed stamp fixes this, because committed content keeps its value across every clone.
The launcher rebuilds only when the source stamp is strictly newer, so the binary only moves forward.
