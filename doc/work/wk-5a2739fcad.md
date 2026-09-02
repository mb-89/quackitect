---
id: wk-5a2739fcad
seq: "14"
type: work
title: how a reviewer reviews
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
rounds: "3"
minted_by: main
evidence:
  - outcome
---

## detail

v3 carries guidance on reviewing in three phases. Find it, read it, and give the reviewer the same, so a reviewer can pull the guidance that applies and judge against it. Research what is known about review outside this project too. What makes a review find defects rather than agree, and what makes one worth the time it costs.

## evidence: outcome

doc/guidance/reviewing.md carries the v3 rounds and prior art that names its sources. Line 84 carries the rule that a finding names a check that is red before the fix and catches the class. Every verb and the flag form of se now go through parse and Stray. se --config /nope exits 1 the way se lint /nope does. TestNothingParsesItsOwnFlags matches any Parse outside the door, and engine-args.mjs drives the real binary on those exits. sh .se/scratchpad/battery.sh answers all ok.
