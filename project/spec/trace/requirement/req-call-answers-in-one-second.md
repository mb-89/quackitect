---
minted_in: i1
id: req-call-answers-in-one-second
type: "[[requirement]]"
statement: When a driver's call is admitted, the engine shall answer within 1 second or return a background handle whose completion the driver observes, for every admitted call.
kind: quality
fitness_candidate: true
characteristic: performance-efficiency
verify_method: test
breaks_if_removed: The loop's rhythm dies, and drivers batch calls to dodge the lag.
breaks_how_badly: corrosive
refines:
  - uc-quality-performance-efficiency
source_refs:
  - uc-take-a-step
  - uc-resume-after-an-absence
  - uc-capture-a-stray
  - uc-answer-a-question-with-tests
  - ".se/req-mine-v2.md: the loop and serving"
  - ".se/req-mine-v1.md: the mirror — book, report, hand-off"
  - ".se/req-mine-v1.md: The mirror — book, report, hand-off"
  - ".se/req-mine-v2.md: The loop and serving"
  - uc-capture-a-stray step 1
  - uc-capture-a-stray step 3
  - uc-answer-a-question-with-tests ext 3a
priority: should
weighs_against:
  - req-resume-needs-no-person >
---

## Scenario

- Source: any driver at the lane.
- Stimulus: an admitted call.
- Artifact: the serving engine.
- Environment: normal operation on the reference machine.
- Response: the answer, or a background handle.
- Response measure: the answer arrives within 1 second for every admitted call; otherwise a background handle arrives within the same bound and its completion is observable.
