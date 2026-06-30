---
id: i3-m6-deps-prompt
statement: Author method prompts dependencies file listing build dependencies with their winget paths.
milestone: M6
class: review
killer: false
depends_on: [i3-m6-overlay-resolver]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-overlay-resolver so the port proceeds in dependency order and survives interruption.
