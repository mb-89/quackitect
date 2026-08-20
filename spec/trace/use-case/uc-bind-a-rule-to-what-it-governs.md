---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: uc-bind-a-rule-to-what-it-governs
type: "[[use-case]]"
statement: Add a rule to the method by writing it beside the thing it governs, and have every later write enforce it without engine code.
actor: stk-engineer-driving-agents
trigger: the same mistake is made a third time and another sentence of guidance will not stop it
precondition: the thing the rule governs stands as a named node in the trace
guarantee: the rule fires on every write from then on, and no engine file changed to make it exist
refines:
  - sty-a-check-binds-without-engine-code
priority: must
---

## Main scenario

1. Whoever maintains the method sees a rule being broken that guidance already states.
2. They find the node the rule governs — an element, a design spec, a node type.
3. They write the rule into that node, in the shape the trace already uses for it.
4. The engine picks it up from the corpus. No verb is registered and no engine file is touched.
5. The next write that breaks the rule is refused, and the refusal names the node the rule came from.

## Lane doors

- `se_file_write` and `se_file_patch` write the rule, because a rule is a node edit like any other.
- `se_reload` makes a new rule live in the running engine, the same way it makes a changed machine live.
- `se_lint` runs the bound rules over a file without writing it, so a rule can be tried before it binds.

## Extensions

- 2a. The rule governs something with no node — a shape, a convention, a habit. The node is written first. A rule with nothing to bind to is guidance, and guidance is what did not work.
- 3a. The rule cannot be expressed in the shape the corpus offers. That is a gap in the shape, and it is named as one rather than worked around with engine code.
- 4a. The rule is written and never fires. It bound to nothing, or to something no write touches. A rule that cannot fire is reported as unbound rather than passing silently.
- 5a. The rule fires on a write that is correct. It is over-broad, and the fix is the rule rather than an exception in the engine.
- 5b. The rule's subject is the corpus as a whole rather than one write. It reports through the sweep rather than refusing at the write, and that is a property of its subject rather than a weaker setting.
