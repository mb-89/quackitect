---
minted_in: i61-everything-served-to-an-agent-gets-short
template: item-test-spec
artifact: node
type: "[[test-spec]]"
id: tsp-session-guidance-filters-by-session-mode
statement: Session guidance tests verify that an attended session omits unattended-only guidance.
method: test
verifies:
  - req-session-serves-only-applicable-guidance
files:
  - tests/pull-offer.test.ts
---

# Session guidance filters by session mode

## Steps

- An attended session receives guidance that applies to attended work.
- An attended session omits guidance that applies only to unattended work.
