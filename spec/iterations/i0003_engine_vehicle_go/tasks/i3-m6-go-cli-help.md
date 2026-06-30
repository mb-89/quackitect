---
id: i3-m6-go-cli-help
statement: Command surface ported with a shared help preamble: every subcommand answers -h and --help and -? with no side effects, and ids starting with a dash are rejected.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-coverage-ids]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-coverage-ids so the port proceeds in dependency order and survives interruption.
