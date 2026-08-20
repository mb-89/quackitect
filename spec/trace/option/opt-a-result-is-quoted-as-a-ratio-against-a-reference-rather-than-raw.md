---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-a-result-is-quoted-as-a-ratio-against-a-reference-rather-than-raw
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how two results are made comparable
found_by: prior-art
statement: "Numbers are published relative to a named reference run rather than in absolute units, so results survive being taken on different machines."
source: "ref-agent-benchmark-harnesses-2026 \u2014 SPEC CPU reference machine and ratios; RECALLED rather than fetched"
---

## What it buys

It makes a number portable across hosts, which matters here because i36 has
already shown the harness is not constant.

## How it competes with what is ruled

The owner ruled the paired delta, which is the same idea with the reference
being the SAME iteration on the previous machine version rather than a fixed
reference run. This option is the alternative shape: one canonical baseline for
everything, quoted as a ratio.

IT IS NOT DEAD. A canonical baseline would let two different iterations be
compared, which the paired delta explicitly cannot do.

## Mechanism

One run on a named reference configuration is measured once and kept. Every later result is divided by it and published as the ratio, so the units cancel and the host drops out.

## Ruled out by the owner, 2026-08-19

NOT TAKEN. The owner: "I am not sure that there is ever gonna be a use for
comparing two different iterations against each other."

THE ONLY ADVANTAGE THIS HAD over the ruled paired delta was cross-iteration
comparison, and that comparison is not wanted. Without it the option adds a
canonical baseline run that must be maintained and re-taken whenever the
reference configuration moves, and buys nothing.

WHAT REPLACES THE WORRY IT WAS ANSWERING. Cycling comes back round. A pair
arrives when the cycle returns to an iteration, and until then a run still
yields its design audit. Coverage first, pairing later.
