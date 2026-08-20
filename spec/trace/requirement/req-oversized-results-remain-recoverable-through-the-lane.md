---
minted_in: i36
id: req-oversized-results-remain-recoverable-through-the-lane
type: "[[requirement]]"
statement: When a lane result exceeds the smallest measured inline host limit, the system shall return a bounded first response and reconstruct the complete result through a lane-owned cursor.
kind: quality
characteristic: performance-efficiency
verify_method: test
breaks_if_removed: The host offloads or truncates results and the agent must read host storage to continue.
breaks_how_badly: crippling
measure: The first serialized response is at most 6,000 characters, and cursor paging reconstructs 100 percent of the original result bytes.
refines:
  - uc-quality-performance-efficiency
source_refs:
  - raid-host-payload-offload-breaks-read-proof
priority: must
weighs_with:
  - req-a-clear-jump-is-one-call ! — one measures result byte size and reconstruction, the other measures call count for a walk; different axes of performance-efficiency
  - req-call-answers-in-one-second ! — one measures payload size, the other measures wall-clock latency; different axes
  - req-surface-answers-in-one-second ! — one is the lane's own payload bound, the other a person's render latency at the mirror; different boundaries
  - req-work-past-its-bound-says-it-is-working ! — one bounds payload size, the other signals that a slow operation is still running; different failure modes
weighs_against:
  - none
---

## Scenario

- Source: an agent requesting a large structured result.
- Stimulus: the serialized result exceeds 6,000 characters.
- Artifact: the lane response and spill cursor.
- Environment: a host that offloads results around 8 to 10 KB.
- Response: the lane returns a bounded page and an exact continuation cursor.
- Response measure: first response at most 6,000 characters; reconstructed result equals every original byte.
