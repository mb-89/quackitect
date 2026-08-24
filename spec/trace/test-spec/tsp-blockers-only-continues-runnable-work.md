---
minted_in: i61-everything-served-to-an-agent-gets-short
template: item-test-spec
artifact: node
type: "[[test-spec]]"
id: tsp-blockers-only-continues-runnable-work
statement: Stop-hook tests verify that blockers-only does not stop a runnable transition.
method: test
verifies:
  - req-blockers-only-stops-only-at-a-blocker
files:
  - tests/stophook.test.ts
---

# Blockers-only continues runnable work

## Steps

- A blockers-only session continues through a transition that passes its conditions.
- A blockers-only session returns `wait` only when a real blocker remains.
