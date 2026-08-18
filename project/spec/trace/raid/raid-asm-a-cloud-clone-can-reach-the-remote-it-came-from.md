---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: raid-asm-a-cloud-clone-can-reach-the-remote-it-came-from
type: "[[raid]]"
kind: assumption
statement: "A cloud box can reach the git remote its clone came from, so the refs the corpus cites can be fetched after the session has started."
owner: the owner
trigger: "the first arrival on a box whose network reaches the agent host but not the git remote"
status: open
impact: "Every record citing ref: main or ref: v2 stays unreadable, and the arrival degrades to the state i15 ran in. The arrival is built to carry on rather than stop, so the failure is quiet by design and the account is the only thing that reports it."
breaks_how_badly: annoying
how_likely: conceivable
probe: "holds here. i35 on 2026-08-17: git fetch --all --prune brought main, v2 and 26 it/* branches. The clone was shallow with one branch, so it had been deliberately narrowed rather than network-limited."
probed: 2026-08-17
source_refs:
  - uc-arrive-on-an-unattended-machine
  - i35-the-cloud-run-s-findings-land-the-fix-fi
weighs_with: none
weighs_against: none
---

## Probe

THE CLONE ARRIVING PROVES NOTHING ABOUT LATER FETCHES. A host may clone the
repository itself, through its own credentials and its own network path, and
hand the agent a checkout on a box with narrower egress than the cloner had.

WHAT THIS BOX SHOWED. The fetch succeeded and was shallow — one branch before,
thirty after. So the clone had been deliberately narrowed rather than
network-limited, which is the benign version of this assumption failing.
