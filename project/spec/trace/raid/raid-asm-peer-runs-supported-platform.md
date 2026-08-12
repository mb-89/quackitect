---
minted_in: i2-parallel-iterations-across-machines-seed
id: raid-asm-peer-runs-supported-platform
type: "[[raid]]"
kind: assumption
statement: The peer machine runs a platform the product actually supports - today that is Windows, where the installer and the packager live.
owner: the owner
trigger: the second machine is named, or any peer's first install fails on a platform difference
status: open
probed: "2026-08-12"
probe: "holds — the owner answered on 2026-08-12: the second machine runs Windows, the supported platform. The installer (RUNME, PowerShell) and the packager (Compress-Archive) both run there. The trigger…"
impact: A non-Windows peer cannot install (RUNME is PowerShell, the packager shells to Compress-Archive), and the two-machine must demonstration stalls at step one.
breaks_how_badly: crippling
how_likely: possible
---

## Probe

One question to the owner: what operating system does the second
machine run? A Windows answer closes it for i2; anything else turns it
into an issue with a named porting cost before the claim work starts.
