---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-asm-one-model-list-serves-every-host-the-engine-supports
type: "[[raid]]"
kind: assumption
statement: One fixed list of model names in the repository is treated as usable identically on every host, while the engine registers three hosts and two of them are a different vendor whose model names are not ours.
owner: the owner
trigger: the first time the list is read on a host that is not Claude Code, and the first time a name on it is not servable where it is read
status: open
impact: On a host that cannot resolve a name, the machine's recommendation is unusable and the walk either ignores it or stops. The ruling that a weaker model needs a recorded reason then has nothing to measure against.
breaks_how_badly: corrosive
how_likely: expected
probe: "MEASURED AT THE i38 KICKOFF GATE, 2026-08-20. engine/harness.ts registers three supported hosts — claude-code, copilot-cli and vscode-copilot. Two of the three are GitHub Copilot and do not serve our vendor's model-name namespace. No list exists in the tree yet, so no per-host evidence has ever been taken. RAISED TO EXPECTED THE SAME DAY by a prior-art scan of the vendor's own documentation: a model ALIAS resolves to a different model per provider — the same short name reaches Sonnet 5 on the vendor API and Sonnet 4.5 on Bedrock and on Microsoft Foundry, and aliases are documented as pointing at the recommended version for your provider and updating over time. So a byte-identical table already produces different models on different hosts unless it pins full names."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
weighs_with: none
weighs_against: none
---

## What was actually ruled, and what it answered

THE OWNER RULED ONE FIXED LIST, identical everywhere, maintained by hand, and
rejected per-host resolution because a system that behaves differently on one
machine than another is the thing being avoided.

THE ARGUMENT GIVEN WAS ABOUT DRIFT OVER TIME: models do not change that often,
so hand maintenance is cheap.

THE QUESTION THAT WAS NOT ASKED IS PORTABILITY ACROSS HOSTS. Those are
different problems. A list can be perfectly current and still name something
the host in front of it cannot serve.

## Why this is an assumption and not a risk

THE DESIGN IS ALREADY RELYING ON IT. The whole point of the fixed list is that
the answer is the same everywhere; if it is not, the mechanism has a hole in
it on two of the three hosts the engine already knows about.

## Probe

TAKE ONE NAME FROM THE LIST TO EACH REGISTERED HOST AND ASK FOR IT. The
engine already knows the three: `claude-code`, `copilot-cli` and
`vscode-copilot`. The check is whether the host can serve a model the list
names, and it is a single call on each box.

WHAT WOULD FALSIFY THE ASSUMPTION, in order of how likely each is to arrive:

- A Copilot host that cannot resolve a vendor model name at all, which is the
  expected outcome on two of the three.
- A host that resolves the name but serves something else under it, which is
  worse than a refusal because it is silent.
- A name retired by its vendor between two sittings of hand maintenance.

THE CHEAP HALF COSTS NOTHING TODAY: read `engine/harness.ts` and list what the
engine says it supports. That half is done, and it is what moved this entry
from conceivable to plausible. The expensive half needs a box this machine
does not have, which is why the entry stands open rather than answered.

## What would settle it

NAME WHAT THE LIST HOLDS. A vendor model name, a capability word the host maps
itself, or a per-host column inside the one file. The third keeps the ruling —
one list, in the repo, identical on every host — while letting the entry that
is read differ by where it is read. That is not per-host RESOLUTION; it is one
list with a wider row.

AND DECIDE WHAT HAPPENS WHEN THE NAME IS NOT THERE, which the ruling does not
say. A full name pinned and absent should fail closed; an alias should fail
open to something stamped. Either is defensible and neither is written down,
so today the answer is undefined.

THERE IS PRIOR ART FOR THE SHAPE. LiteLLM's tag routing is the same design —
the caller attaches a declared tag, config maps tags to deployments — and it
ships a `default` pool plus an explicit fail-open switch, so "nothing matches
this tag" is a named, configurable condition rather than a surprise. That is
the part worth copying, and it is small.

ALIASES ALSO MOVE UNDER YOU. The vendor documents them as tracking the
recommended version over time, so a list of aliases is not a fixed list at all
— it is a fixed list of moving targets, which is the opposite of what the
ruling asked for.
