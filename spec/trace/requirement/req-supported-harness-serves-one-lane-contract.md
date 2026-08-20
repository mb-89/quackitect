---
minted_in: i36
id: req-supported-harness-serves-one-lane-contract
type: "[[requirement]]"
statement: When a session starts in a supported harness, the system shall identify that harness and serve the lane contract within every measured host limit before the first work state.
kind: quality
characteristic: compatibility
verify_method: test
breaks_if_removed: A supported host can receive incomplete rules or tool descriptions and silently drive a different walk.
breaks_how_badly: crippling
measure: Every supported harness is named, and zero instruction or tool-description payloads exceed its measured limit.
refines:
  - uc-quality-compatibility
source_refs:
  - ref-agent-harness-portability-2026-08-19
priority: must
weighs_with:
  - req-every-artifact-is-readable-text ! — one is zero binary files under the product root, the other is fitting served payloads to a harness's measured limits; different measures
weighs_against:
  - none
---

## Scenario

- Source: an engineer starting a Quackitect session.
- Stimulus: a supported harness connects to the lane.
- Artifact: the harness profile and projected lane contract.
- Environment: a fresh session before its first work state.
- Response: the lane identifies the harness and serves compatible instructions and tool descriptions.
- Response measure: every supported harness is named; zero served payloads exceed the profile limit.
