---
id: req-strict-frontmatter
type: requirement
refines: [uc-fail-loud-parsing]
statement: When the engine parses a node file, it shall reject malformed frontmatter and any key outside the complete node-key allowlist (including the i7 additions roles, milestone, validates, parent, and verify coverage rules) with a nonzero exit naming the file and the offending key.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
The allowlist must be COMPLETE on day one or the release bricks the repo. Scope is node frontmatter only — `quack gather` stays format-promiscuous.
