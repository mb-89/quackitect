---
id: adr-handroll-parse
type: adr
statement: Hand-roll the config.toml and frontmatter parser instead of vendoring a TOML or YAML library. The parsed subset is trivial (key and value, plus simple lists). This keeps the zero-dependency property that motivates the rewrite.
addresses: [req-zero-dep-parse]
adjudicated_by: human
killer: false
---

## Rationale (not load-bearing)
i0003. Vendoring a compiled-in library was the alternative. Rejected to keep the nothing-vendored, nothing-downloaded property pure.
