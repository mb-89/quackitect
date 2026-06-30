---
id: i3-m6-go-parser
statement: Hand-rolled frontmatter and config.toml parser ported to Go over the trivial subset in use.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-scaffold]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-scaffold so the port proceeds in dependency order and survives interruption.
