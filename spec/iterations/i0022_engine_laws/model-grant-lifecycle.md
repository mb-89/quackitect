---
id: model-grant-lifecycle
type: model
kind: state
statement: what modes does a standing grant have, and what moves it between them?
class: review
killer: false
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: skeleton value
---
```mermaid
stateDiagram-v2
  [*] --> live: owner records the grant (scope, expiry)
  live --> live: in-scope agent bless (stamps the grant id, joins the collection)
  live --> closed: expiry reached
  live --> closed: owner closes it
  closed --> reviewed: morning review runs (each bless confirmed or reopened)
  reviewed --> [*]
```
## Rationale (not load-bearing)
One line to see: three states, and no path back to live - a new stretch records a NEW
grant, so no grant quietly outlives its review.

The self-loop on live is the whole point: every in-scope bless leaves a stamped,
collectable trace. The reviewed exit realizes q-grant-honesty ruling A - the owner's
confirmation is what turns the collection into owner-authorized history. The state
enum and its transition set are the conformance contract for go-grant-store.
