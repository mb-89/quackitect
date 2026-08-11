---
id: req-shutdown-fires-only-idle-or-end
type: "[[requirement]]"
statement: While the shutdown toggle is set, the engine shall shut the system down after 5 idle minutes with a once-per-minute countdown shown, or when the walk passes the main machine's end state, and at no other moment.
kind: functional
verify_method: test
breaks_if_removed: The machine runs all night after the person left, or dies under a walk that was mid-work.
breaks_how_badly: crippling
refines:
  - uc-set-the-autonomy
source_refs:
  - note-778f403c7e96 — the 2026-08-11 field failure and the countdown design
  - note-3805a28e27b5 — the shutdown-on-end trigger
  - reverse-engineered from tests/power.test.ts
priority: must
---

## Detail

- Idle means the WALK stands at idle; a session that just acted is not idle, and an act by either hand resets the clock.
- The countdown ticks once per minute for 5 minutes, visibly; releasing the toggle cancels it.
- The end trigger fires as the last act before the machine ends, so "finish everything, then stop the machine" is one instruction.
- The idleness check runs on its own clock — a silent machine still evaluates it. The 2026-08-10 field failure was a check that only ran when a call arrived.
- Exactly one place shuts the machine down; the agent holds no shutdown act.
