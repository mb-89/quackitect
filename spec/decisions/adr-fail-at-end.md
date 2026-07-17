---
id: adr-fail-at-end
type: adr
decided_in: i0025_clean_state
adjudicated_by: user
statement: The battery collects failures and reports them once, at the end. The runner loop keeps a failure list instead of exiting at the first red. The verdict cache stays the crash-surviving partial store. Datum: a verdict journal file. It loses on simplicity; the cache already survives crashes. This mechanizes the owner's law: discover once, fix batched, confirm once.
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal - architecture, shapes the battery runner
---
