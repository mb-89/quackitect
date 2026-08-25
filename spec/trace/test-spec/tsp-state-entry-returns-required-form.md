---
minted_in: i61-everything-served-to-an-agent-gets-short
template: item-test-spec
artifact: node
type: "[[test-spec]]"
id: tsp-state-entry-returns-required-form
statement: Pull tests verify that entering a state returns its incomplete required form in that response.
method: test
verifies:
  - req-state-entry-delivers-its-required-form
files:
  - tests/pull.test.ts
---

# State entry returns its required form

## Steps

- A pull that enters a state with an incomplete required form returns `fill`.
- The same pull includes the required form for the entered state.
