---
minted_in: i36
id: req-interrupted-call-names-the-stopping-layer
type: "[[requirement]]"
statement: When a lane call ends without a normal result, the system shall report whether the server, transport, host, or stop hook ended it, or shall report that the layer is unknown.
kind: quality
characteristic: reliability
verify_method: test
breaks_if_removed: Recovery begins from guesswork and can repeat the same interruption.
breaks_how_badly: corrosive
measure: Every interrupted-call report names one evidenced layer or explicitly says unknown; zero reports infer an unobserved cause.
refines:
  - uc-quality-reliability
source_refs:
  - raid-mcp-stop-is-not-diagnosable
priority: must
weighs_with:
  - req-a-resolution-is-proven-by-read-back ! — one is a test-authoring discipline, the other is a runtime diagnostic on an interrupted call; different artifacts
  - req-a-wrong-act-never-passes-silently ! — one covers every rule-violating call, the other only a call that ended without a normal result; different triggers
  - req-boot-needs-no-manual-test-metadata-repair ! — one diagnoses an interrupted call, the other tolerates an old test-record shape at boot; different triggers
  - req-stop-hook-yields-only-at-a-machine-stop ! — one reports which layer already ended a call, the other prevents the session ending in the first place; diagnosis versus prevention
weighs_against:
  - none
---

## Scenario

- Source: an engineer watching an active walk.
- Stimulus: a lane call ends without a normal result.
- Artifact: host, transport, server-lifecycle, and stop-hook evidence.
- Environment: an active walk on any supported harness.
- Response: the system names the evidenced stopping layer and preserves the prior walk position.
- Response measure: one evidenced layer or explicit unknown on every interrupted call; zero unsupported diagnoses.
