---
id: raid-facet-bulk-tags
type: raid
kind: issue
probability: 0.6
impact: 0.2
mitigation: owner samples the register per facet; a wrong tag is a one-line frontmatter fix, hash-neutral
owner: project-owner
status: open
statement: All 187 requirements were facet-tagged in one pattern-based sweep - individual tags may misclassify.
class: review
killer: false
---
Validation gap (i12 M7): the coverage board computes from bulk-applied tags.
The board's zero-count holes are trustworthy only after the owner has sampled
the tagging. The register's facet filters make the sampling cheap.
