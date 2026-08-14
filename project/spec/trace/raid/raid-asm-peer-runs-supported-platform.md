---
minted_in: i2-parallel-iterations-across-machines-seed
id: raid-asm-peer-runs-supported-platform
type: "[[raid]]"
kind: assumption
statement: The peer machine runs a platform the product actually supports - today that is Windows, where the installer and the packager live.
owner: the owner
trigger: the second machine is named, or any peer's first install fails on a platform difference
status: open
probed: "2026-08-13"
probe: "held narrowly, on a DIFFERENT platform than the 2026-08-12 answer named. The peer that actually showed up on 2026-08-13 ran Linux 6.18 x64 / Node 22.22, not the Windows the owner's answer assumed. The engine ran there — but only after finding and fixing two headless-Linux startup defects (xdg-open ENOENT killing the engine child; the server quitting when its stdin/console closes, which is what backgrounding does). Both are fixed and committed. The installer (RUNME, PowerShell) and packager (Compress-Archive) were never exercised — this peer bootstrapped through the CLI directly, bypassing both."
impact: A non-Windows peer cannot install (RUNME is PowerShell, the packager shells to Compress-Archive), and the two-machine must demonstration stalls at step one.
breaks_how_badly: crippling
how_likely: expected
---

## Probe

One question to the owner: what operating system does the second
machine run? A Windows answer closes it for i2; anything else turns it
into an issue with a named porting cost before the claim work starts.

## Retro sweep 2026-08-13

The trigger ("the second machine is named") fired again, with a different
answer than 2026-08-12: this peer is Linux, not Windows. The assumption's
statement ("today that is Windows") is now known false for at least one
real peer. Left open rather than closed: the installer and packager still
target Windows only, and whether a Linux peer needs its own installer path
is an owner decision, not settled here. See the i8 field-report §1.4 and
§3.
