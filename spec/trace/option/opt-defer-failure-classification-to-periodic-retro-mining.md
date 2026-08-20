---
minted_in: i36
id: opt-defer-failure-classification-to-periodic-retro-mining
type: "[[option]]"
statement: Do not classify a repeated failure shape as it happens; leave every occurrence in the call log and let the retro's existing log-mining step find the patterns periodically instead.
cluster: cluster-the-walk
found_by: without
source: "Trimming (meth-trimming.md): what if route-a-failure-shape does not exist, and who does its job instead."
---

## Mechanism

If the cluster goes, cluster-the-account absorbs the job: the retro's
existing log-mining step (meth-retro's tool-audit and clause-ranking pass)
already groups calls by tool and by refusal clause periodically.

IT GOES, AND ANOTHER CLUSTER ABSORBS IT. This is the status quo this
iteration's own onboard-retro observed: 136 rejected records sat unmined
until the retro looked, which is exactly raid-failed-tool-calls-stay-local.

WHAT IT COSTS. Between retros, a repeated failure shape is invisible as a
pattern; each occurrence is recovered locally and the shape itself is not
visible until somebody chooses to run a retro. A fatal or urgent shape gets
no faster path than a routine one.

WHY IT STAYS ANYWAY. uc-route-failed-calls-into-improvement's own extension
4a demands that one fatal occurrence route immediately rather than waiting
for a retro or a repeat threshold, which periodic mining alone cannot do.
