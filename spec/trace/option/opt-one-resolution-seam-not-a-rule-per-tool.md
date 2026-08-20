---
minted_in: i27
id: opt-one-resolution-seam-not-a-rule-per-tool
type: "[[option]]"
statement: route every path through one resolver that no tool may bypass, so which tree a call reaches is decided in one place rather than per verb
cluster: cluster-the-walk
question: where resolution happens
found_by: heuristic
source: the heuristic catalogue — Small interfaces between big parts beat the reverse.
---

## Mechanism

One function answers which tree a path names. Every lane verb calls it,
including the ones that shell out, and no verb resolves anything itself.

WHY IT IS AN OPTION RATHER THAN AN OBVIOUS TRUTH. Today's guard is the
opposite shape and its cost is measured. SE-C-134 names five write verbs -
se_file_write, se_file_patch, se_file_replace, se_file_delete, se_file_move -
and cannot watch se_run. The i8 field report of 2026-08-12 records what
follows: refused at the guard, the walk reached for se_run instead, and the
write landed on trunk anyway.

A GUARD THAT ENUMERATES ITS TOOLS IS WRONG BY CONSTRUCTION. It is complete
only until the next verb, and nothing tells you when that happens.

THE HOUSE ALREADY RULED THIS ONCE, from v1: guards belong in ONE dispatch
pass, never per handler. This applies the same rule to resolution rather
than to authorisation.

WHAT IT COSTS. Every verb changes to call the seam, and the seam becomes the
quietest and most dangerous line in the engine - a wrong answer there is
wrong everywhere at once. That is the argument for the read-back, and it is
why these two probably ship together rather than apart.

IT IS NOT A RIVAL TO CONFINE OR JUDGE. It is the thing either of them needs
in order to be true. Confinement with a bypass is not confinement.
