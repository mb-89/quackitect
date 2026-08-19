---
minted_in: i36
id: opt-serve-the-lowest-common-denominator-bound-always
type: "[[option]]"
statement: Serve every harness the same payload and instruction size, fixed to the smallest known host limit, and never identify which harness is connected at all.
cluster: cluster-the-arrival
found_by: without
source: "Trimming (meth-trimming.md): what if identify-the-harness does not exist, and who does its job instead."
---

## Mechanism

If the cluster goes, nothing takes over identifying the harness. Nobody
needed to be identified, because every session gets the same fixed bound
regardless of who is asking.

IT GOES, AND NOTHING TAKES OVER is the honest first answer, and it is a
real option: pick the tightest limit across every supported host today
(Claude Code's tool-description truncation) and serve that to everyone,
always.

WHAT IT COSTS. Every host that could safely take more — a larger tool
description, a fuller instruction set — never gets it. The bound moves in
lockstep with whichever host is tightest today, and a new, tighter host
silently shrinks what every other host receives too.

WHY IT STAYS ANYWAY. The whole point of req-supported-harness-serves-one-lane-contract
is that different hosts genuinely differ by a wide margin (2 KB truncation
against a 32 KiB project-doc ceiling), so a single global floor wastes most
of that margin on every host that is not the tightest one.
