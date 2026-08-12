---
form: specify-build
by: agent
signed_off: 2026-08-12T12:25:37.820Z
authors: agent
files:
---

# Evidence form / specify-build

## current_situation

Seventeen design specs stood from i1. i2's one new element (el-claim-ledger) and its interface lacked one; dsp-claim-lane closes that gap. The chunk machine is authored: ten chunks, risk-first at the claim verb, parallel strands for the rest, and the tier cut-over as the one drawn chain.

## design_specs

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-claim-lane]] | el-claim-ledger · if-claim-ledger-to-record-store | project/deliverable/engine/claims.ts · project/deliverable/engine/gitlane.ts · project/deliverable/engine/tools.ts |

## promotions

| experiment | promote | chunk |
| --- | --- | --- |
| [[exp-claim-verb-race]] | the verb's mechanism as measured — record then announce, rebase-and-retry on rejection, release as a second commit — enters the M7 build through the gate; the spike code itself is throwaway | b1-claim-verb |

## follow_up

observe-red watches the new specs' reds. The build realizes the chunks in dependency order. The origin race runs at b1 before the claim lane is called done.

## anything_else

