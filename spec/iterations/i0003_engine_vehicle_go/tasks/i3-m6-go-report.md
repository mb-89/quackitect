---
id: i3-m6-go-report
statement: Report shell ported to Go html template with a deterministic server-baked layout and a byte-identical integrity root.
milestone: M6
class: review
killer: false
depends_on: [i3-m6-go-cli-help]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-cli-help so the port proceeds in dependency order and survives interruption.
