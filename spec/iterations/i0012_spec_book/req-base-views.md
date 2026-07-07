---
id: req-base-views
type: requirement
depends_on: []
statement: Where a spec note embeds a base block, the engine shall evaluate it deterministically within the pinned subset - filter trees, comparisons, file predicates, order, sort, limit, groupBy with count - and shall refuse volatile functions and out-of-subset constructs with an error.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [compatibility, usability]
---
## Rationale (not load-bearing)
The query language is Obsidian Bases (obsidian.md/help/bases/syntax) so the owner gets live authoring preview; the engine is authoritative. The subset is pinned and grows only on template demand (groupBy+count arrived with the coverage board). now()/today() break byte-identical regeneration - refused, not ignored. Fail loudly is the standing rule.
