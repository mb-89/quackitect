---
id: se.adr-comment-highlight-api
kind: decision
statement: Highlights render through the CSS Custom Highlight API. The content DOM is never mutated. Span-wrapping is rejected as the dom-static breaker, whose bookkeeping is the main reason annotation libraries exist. The hand-roll stands, with no vendored annotator. On a browser without the API, the sidebar still works and highlights degrade to none.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_decided_in: i0013_comments
v1_type: adr
v1_kind: architecture
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
p3_note: comment layer
---

## Rationale (not load-bearing)
Owner decision (hand-roll) 2026-07-07. Tripwire: a real reader on a non-supporting browser complains about missing highlights -> revisit degrade strategy, never span-wrap.
