---
minted_in: i61-everything-served-to-an-agent-gets-short
template: item-test-spec
artifact: node
type: "[[test-spec]]"
id: tsp-zero-worker-ceiling-empties-spawn-hand-list
statement: State-form tests verify that a signed zero-worker ceiling yields no spawn-hand items.
method: test
verifies:
  - req-zero-worker-ceiling-satisfies-spawn-state
files:
  - tests/supply-gap.test.ts
---

# Zero-worker ceiling empties the spawn-hand list

## Steps

- A spawn state with a signed zero-worker ceiling exposes an empty `$spawn_hands` source.
- An empty spawn-hand source accepts an empty hand selection.
