---
id: req-zero-dep-parse
type: requirement
refines: [uc-run-dep-free]
statement: The engine parses config.toml and node frontmatter with hand-rolled readers over the trivial subset in use (key and value, plus simple lists). No third-party TOML or YAML library is vendored.
depends_on: [req-go-engine]
class: review
killer: false
---

## Rationale (not load-bearing)
M2. Keeps the zero-dependency property that motivates the switch. See adr-handroll-parse.
