---
id: why-regenerable-code
type: rationale
tags: [strategy]
statement: The spec is the asset; code is regenerable. Rewrite when the architecture changes, extend when it holds; a regeneration that loses behavior is a spec bug.
class: review
killer: false
provenance:
  statement: user-ruling via chat (2026-07-18)
  class: schema-default (review)
  killer: schema-default (false)
---
With an agent building, code stopped being the expensive artifact. The recorded design input - needs, requirements, decisions, tests, models - is the asset; the code realizes it and can be produced again. Some frameworks take this to the limit and always regenerate from the spec, the way a phoenix server is burned down and rebuilt from its definition on every cycle ([Fowler's Phoenix Server](ref-phoenix-server)).

This method stops one step short, for two reasons. Regenerating code whose architecture has not changed produces the same thing at review cost and verification cost, the two resources that stayed scarce. And the classic warning against rewrites still names a real danger ([Spolsky](ref-spolsky-rewrite)): working code embeds corner-case knowledge. That warning dissolves only where the knowledge is externalized - which is precisely what a traced spec with test-first coverage does. Here, the tests and the ledger hold the corner cases; the code holds nothing the spec does not.

So the rule: rewrite when the architecture must change, extend when it holds. Effort is not the criterion; architecture fit is. Teams should be far more rewrite-eager than the pre-agent era taught - and when a rewrite happens, it replaces incrementally beside the running system, never big-bang ([the six rewrite stories](ref-rewrite-stories)).

The diagnostic falls out for free: if a regeneration from the spec drops behavior the old code had, the code was never the problem. The spec was incomplete. Fix the spec, regenerate again - the loss is the method's own test suite for its design input.
