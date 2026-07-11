---
id: adr-comment-highlight-api
decided_in: i0013_comments
type: adr
kind: architecture
adjudicated_by: user
statement: Highlights render through the CSS Custom Highlight API - the content DOM is never mutated; span-wrapping is rejected as the dom-static breaker whose bookkeeping is the main reason annotation libraries exist. Hand-roll stands; no vendored annotator. On a browser without the API the sidebar still works and highlights degrade to none.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner decision (hand-roll) 2026-07-07. Tripwire: a real reader on a non-supporting browser complains about missing highlights -> revisit degrade strategy, never span-wrap.
