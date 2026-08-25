---
minted_in: i61-everything-served-to-an-agent-gets-short
id: raid-the-harness-reports-the-session-mode-correctly
type: "[[raid]]"
kind: assumption
statement: The harness reports whether the current session is attended or unattended correctly.
owner: maintainer
trigger: A session receives guidance that is limited to a different session mode.
status: open
impact: Guidance filtering can omit required attended guidance or deliver unattended-only instructions to an attended session.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - req-session-serves-only-applicable-guidance
  - req-zero-worker-ceiling-satisfies-spawn-state
  - req-state-entry-delivers-its-required-form
  - req-blockers-only-stops-only-at-a-blocker
probe: unprobed — exercise attended and unattended session fixtures through guidance selection
probed: 2026-08-24
---

## Probe

Unprobed. Add fixtures that enter both session modes and assert the guidance
returned for each mode.
