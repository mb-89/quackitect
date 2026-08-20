---
minted_in: i36
id: raid-asm-the-stop-hook-fires-the-same-on-posix
type: "[[raid]]"
kind: assumption
statement: The stop hook that blocks a premature session end fires the same way on a POSIX cloud host as it was measured firing on Windows.
owner: the driving agent
trigger: the first unattended POSIX run that exercises a stop event, and any change to how the hook is registered per host
status: open
probe: "No cheap check exists this session: it needs a POSIX host with a stop event forced mid-walk. raid-lane-works-on-posix proved the lane itself survives on a Linux container (i35, 2026-08-18), but that probed lane survival, not this stop hook's own behaviour. Stays unprobed until that host is available."
probed: "unprobed 2026-08-19"
breaks_how_badly: crippling
how_likely: plausible
  - raid-lane-works-on-posix
weighs_with: none
weighs_against: none
---

## Probe

Force a stop event mid-walk on a Linux container with executable work still
standing, exactly as raid-lane-works-on-posix did for the lane's survival,
and confirm the session does not end.
