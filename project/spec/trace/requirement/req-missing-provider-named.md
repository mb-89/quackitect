---
id: req-missing-provider-named
type: "[[requirement]]"
statement: "If no web-search provider is configured, then the engine shall name the missing provider and keep serving direct URL fetches."
kind: functional
verify_method: test
breaks_if_removed: "A missing provider is worked around silently and the gap never gets fixed."
refines:
  - uc-research-and-record-an-answer
source_refs:
  - uc-research-and-record-an-answer ext 2a
  - ".se/req-mine-v1.md: Refusals and honesty"
priority: should
---
