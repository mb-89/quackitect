---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-a-declared-class-with-a-named-fallback-pool
type: "[[option]]"
cluster: the-sizing
question: what happens when the standing mapping has no entry
statement: the mapping ships with a default entry and an explicit switch saying whether an unmatched class falls through to it or refuses, so the no-match case is a configured decision rather than a surprise
found_by: prior-art
source: LiteLLM's tag routing, docs.litellm.ai/docs/proxy/tag_routing — a caller attaches a declared tag, config maps tags to deployments, and a `default` pool plus `allow_fail_open` make no-match a named, configurable condition rather than an error nobody planned
---

## Mechanism

THE SAME DECLARED SCHEME, WITH THE HOLE SPECIFIED. A class is declared on the
work, a mapping resolves it, and when nothing matches the behaviour is written
down: fall through to a named default, or refuse and say which class was
unmatched.

WHY IT IS A SEPARATE OPTION RATHER THAN A DETAIL. The current design refuses
and publishes nothing, on the reasoning that a silent fallback is
indistinguishable from a working lookup. That reasoning is sound and it is not
the only defensible answer — a NAMED, LOUD fallback is distinguishable, and it
keeps work moving where refusing would stop it.

THE REAL CHOICE IS FAIL-CLOSED AGAINST FAIL-OPEN-AND-STAMPED, and the cited
system ships both behind one flag rather than picking for you.

IT ALSO ANSWERS THE PORTABILITY PROBLEM SIDEWAYS. Where a name resolves
differently on different hosts, a default pool is what a host without the named
worker falls to — which is the standing open assumption about one list across
three hosts.
