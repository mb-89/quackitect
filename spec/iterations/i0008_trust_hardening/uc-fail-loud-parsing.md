---
id: uc-fail-loud-parsing
type: usecase
refines: [need-qualities]
statement: ISO/IEC 25010 Reliability/Integrity — malformed or unknown node input can never silently shrink the suspect cone; the engine refuses loudly and names the offender.
class: review
killer: false
---
## Rationale (not load-bearing)
A typo (`depends-on` for `depends_on`) silently dropping an edge is the one failure the tool exists to prevent. Scope: NODE frontmatter only; the gather lane stays format-promiscuous.
