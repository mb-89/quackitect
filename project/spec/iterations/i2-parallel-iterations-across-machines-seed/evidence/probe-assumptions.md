---
form: probe-assumptions
by: agent
signed_off: 2026-08-12T12:12:51.331Z
reopened: "2026-08-12T12:11:45.018Z — the platform assumption's probe stood \"awaiting the owner's answer\"; the owner answered 2026-08-12 (Windows) — the probe result must be recorded, which is this state's own…"
authors: agent
files:
---

# Evidence form / probe-assumptions

## current_situation

Three assumptions stand in the register. The platform assumption now carries the owner's answer (2026-08-12); the two remaining carry their scheduled M7 checks.

## probes

| raid | probe | probed |
| --- | --- | --- |
| [[raid-asm-remote-serializes-claims]] | scheduled — the check IS the build's race test: two clients push one claim name against origin, one accepted, one rejected non-fast-forward; it runs at M7 with the claim verb, before the mechanism is called done, and an agent push today would break the never-push law | not yet — scheduled at M7 |
| [[raid-asm-peer-runs-supported-platform]] | holds — the owner answered on 2026-08-12: the second machine runs Windows, the supported platform. The installer (RUNME, PowerShell) and the packager (Compress-Archive) both run there. The trigger stays live: re-check if the second machine changes or a peer install fails. | 2026-08-12 |
| [[raid-asm-owner-pushes-keep-remote-fresh]] | scheduled — ship an iteration locally unpushed, then ask a second clone to claim a dependent stub and read the refusal text; runs at M7 with the dependency gating | not yet — scheduled at M7 |

## follow_up

The platform assumption holds on the owner's answer (Windows, 2026-08-12). The two M7 probes ride the build plan so they cannot be forgotten; a red on either reshapes the claim mechanism before it ships.

## anything_else

