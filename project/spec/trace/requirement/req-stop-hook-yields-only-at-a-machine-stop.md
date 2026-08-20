---
minted_in: i36
id: req-stop-hook-yields-only-at-a-machine-stop
type: "[[requirement]]"
statement: While a walk has executable work, the stop hook shall prevent the agent session from ending until the machine reports wait, a blocker, or a completed target.
kind: quality
characteristic: reliability
verify_method: test
breaks_if_removed: An unattended iteration can end between states while work remains executable.
breaks_how_badly: crippling
measure: Across every supported harness stop event, zero sessions end while the active machine has executable unblocked work.
refines:
  - uc-quality-reliability
source_refs:
  - ref-agent-harness-portability-2026-08-19
priority: must
weighs_with:
  - req-a-resolution-is-proven-by-read-back ! — one is a test-authoring discipline, the other prevents a premature session end; different artifacts
  - req-a-wrong-act-never-passes-silently ! — one covers every rule-violating call, the other only a stop event while work remains executable; different triggers
  - req-boot-needs-no-manual-test-metadata-repair ! — one prevents a premature stop, the other repairs boot's own record reading; different mechanisms
  - req-interrupted-call-names-the-stopping-layer ! — one prevents the session ending, the other reports which layer already ended a call; prevention versus diagnosis
weighs_against:
  - none
---

## Scenario

- Source: a harness requesting that an agent session stop.
- Stimulus: a stop event arrives while the active machine still has executable work.
- Artifact: the stop hook and current machine state.
- Environment: an unattended walk on a supported harness.
- Response: the hook blocks the stop and the agent continues the walk.
- Response measure: zero premature session endings across the supported harness stop-event suite.
