---
form: probe-assumptions
by: agent
signed_off: 2026-08-12T21:24:57.163Z
authors: agent
files:
---

# Evidence form / probe-assumptions

## current_situation

M3 probe-assumptions: every standing raid assumption checked against its recorded probe. Two were open — raid-asm-dial-carries-adjudication and raid-asm-help-query-vocabulary-overlaps — both now carry a probe result on their own node. The other three (owner-pushes-keep-remote-fresh, peer-runs-supported-platform, remote-serializes-claims) already carried a probe result from earlier iterations.

## probes

| raid | probe | probed |
| --- | --- | --- |
| [[raid-asm-dial-carries-adjudication]] | holds — owner ruling 2026-08-09 records that at high autonomy the agent blesses its own gate (project/guidance/walking.md, and CLAUDE.md contract rule 3: blessing your own gate is sanctioned at this dial). That reads the criterion as naming the dial as the person's standing adjudication, not a literal zero-target. | 2026-08-12 |
| [[raid-asm-help-query-vocabulary-overlaps]] | unprobed — .se/help-demand.jsonl does not exist yet; se_help has no real usage recorded to spot-check against rankDemand. Re-probe once real query traffic accumulates. | not yet — needs real se_help usage to accumulate |
| [[raid-asm-owner-pushes-keep-remote-fresh]] | scheduled — ship an iteration locally unpushed, then ask a second clone to claim a dependent stub and read the refusal text; runs at M7 with the dependency gating | not yet — scheduled at M7 |
| [[raid-asm-peer-runs-supported-platform]] | holds — the owner answered on 2026-08-12: the second machine runs Windows, the supported platform. The installer (RUNME, PowerShell) and the packager (Compress-Archive) both run there. | 2026-08-12 |
| [[raid-asm-remote-serializes-claims]] | holds locally, genuinely concurrent — the M7 race test (tests/claims.test.ts) pushes one claim name from two clients in flight at once against a bare origin: exactly one lands, the loser rejects non-fast-forward and learns the holder. Still faked: the network and the hosted forge's receive layer. | 2026-08-12 |


## follow_up

write-requirements next.

## anything_else

