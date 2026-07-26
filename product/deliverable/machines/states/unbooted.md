---
state: unbooted
state_kind: work
filled_by: agent
legal: se_boot
---

# Boot

The session machine's entry state. Nothing is legal here but `se_boot` —
the lane is locked until the session boots.

## Guidance

Call `se_boot` as your very first action, before anything else. It returns
a banner — show it to the user verbatim as your first output, then proceed
with their request. (The guidance served during boot grows here later:
contract, working stance, method pointers. For now boot is the lock-turn.)
