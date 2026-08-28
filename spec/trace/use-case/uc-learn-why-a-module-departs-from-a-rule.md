---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: uc-learn-why-a-module-departs-from-a-rule
type: "[[use-case]]"
kind: interaction
statement: Learn why a module departs from a rule the rest of the code obeys.
actor: stk-engineer-driving-agents
trigger: code is found doing what the design says it should not
precondition: the rule stands and its registry and hatch are readable
guarantee: the reader knows whether the departure was decided or drifted, and by whose reasoning
refines:
  - sty-read-why-the-code-departs-from-its-own-design
priority: must
---

## Main scenario

1. The reader finds a module reaching a capability the rule governs.
2. The reader opens the hatch for that rule.
3. The reader looks for the module by path.
4. The hatch names the module and gives the reason it is exempt.
5. The reader judges whether that reason still holds today.

## Extensions

3a. THE MODULE IS ABSENT FROM THE HATCH. It is not exempt, so either the rule
does not govern this call or the code is in breach. The reader asks the rule
which, and a breach is what the sweep would already have named.

4a. THE ENTRY CARRIES NO REASON. It cannot: an entry with no reason is refused
when it is written. Finding one means the hatch was edited outside the lane,
and the sweep is what catches that.

5a. THE REASON NO LONGER HOLDS. The reader deletes the entry, and the module's
next write is refused until somebody either fixes it or writes a reason that
is true now.

5b. THE READER CANNOT TELL WHETHER THE REASON HOLDS. The reason was written
too thinly to judge. Nothing in the mechanism prevents this, and it is the
named failure mode of the whole design rather than a branch with a remedy.
