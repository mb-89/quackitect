---
kind: method
statement: "What you cannot observe you cannot test. What you cannot control you cannot test either."
---

## Situation

Guidance for M5 architecture and M7 test work.

It bites hardest on PHYSICAL systems, where tests do not just run in a
pipeline. A system that is hard to observe and control makes testing cost more
than developing.

Testability is designed in, never bolted on.

## Procedure

- OBSERVE. What you see is what you test.
  - Give every element observation points: outputs, states, internals,
    resource use.
  - Expose diagnostic and state-of-health information.
  - Make version and config readable per component.
- CONTROL. The better you control, the deeper you test.
  - Give every element control points, to apply inputs and force states.
  - Include error states. A failure you cannot force is a failure you ship
    untested.
- ASK "HOW CAN I TEST THIS?" AT DESIGN TIME, per element.
  - Simplicity and decomposability: independently testable pieces, few
    configs.
  - Operability: one failure must not block the whole test run.
  - Stability: a controlled change does not invalidate the suite.
- BUILD THE STANDING MACHINERY IN, so it stays reachable after development.
  - Built-in self-tests, start-up checks and watchdogs.
  - Configurable logging and tracing.
  - A crash recorder for post-mortems.
  - Hardware test ports and scriptable test interfaces.
- START THE TRACING CONCEPT EARLY. One trace across components catches race
  conditions and error propagation that nothing else catches.
  - Extraction.
  - Visualization.
  - Analysis.
- PLAN THE TEST ARCHITECTURE AS A SYSTEM OF ITS OWN.
  - Test management, test system and test data on their own bus.
  - A simulated environment beside the real system-under-test.
  - Non-invasive injection and observation, for real-time behaviour.

## Sources

- SyA Principles of Systems Testing and Testing Tactics (Sauer and Hahn), from
  the owner-mapped digest at @ai/sya_kb.
- Kossiakoff, Systems Engineering Principles.
- INCOSE SE Handbook, integration best practices.
