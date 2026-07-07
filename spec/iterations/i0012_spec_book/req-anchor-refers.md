---
id: req-anchor-refers
type: requirement
depends_on: []
statement: If a note refers to a heading anchor that does not exist, then quack lint shall flag the dangling referent.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [usability]
---
## Rationale (not load-bearing)
Heading slugs are the stable anchors rationale notes key to (man-ch1-motivation#where-we-want-to-be); a renamed heading must not silently orphan its rationales. Extends ref-integrity to the heading-anchor referent class. Caught in the final redteam pass.
