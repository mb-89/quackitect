---
kind: method
statement: "Design for testability: observe + control. What you cannot observe you cannot test; what you cannot control you cannot test deeply - and on physical systems the test rig's cost is set by the system's testability."
---

## Situation
Guidance for M5 architecture and M7 test work. Bites hardest on PHYSICAL systems, where tests do not just run in a pipeline: a system that is hard to observe and control makes testing cost more than developing. Testability is designed in, never bolted on.

## Procedure
- OBSERVE: what you see is what you test. Give every element observation points - outputs, states, internals, resource use. Diagnostic and state-of-health info; version and config readable per component.
- CONTROL: the better you control, the deeper you test. Control points to apply inputs and force states - including error states (a failure you cannot force is a failure you ship untested).
- Ask "how can I test this?" at DESIGN time, per element: simplicity and decomposability (independently testable pieces, few configs), operability (one failure must not block the whole test run), stability (controlled change does not invalidate the suite).
- Build the standing machinery in: built-in self-tests, start-up checks, watchdogs; configurable logging and tracing; a crash recorder for post-mortems; hardware test ports and scriptable test interfaces that STAY accessible after development.
- Start the tracing concept EARLY: one trace across components catches race conditions and error propagation nothing else catches - extraction, visualization, analysis.
- Plan the test architecture as a system of its own: test management, test system and test data on their own bus, a simulated environment beside the real system-under-test - non-invasive injection and observation for real-time behavior.

## Sources
SyA Principles of Systems Testing and Testing Tactics (Sauer/Hahn, owner-mapped digest @ai/sya_kb); Kossiakoff, Systems Engineering Principles; INCOSE SE Handbook (integration best practices).
