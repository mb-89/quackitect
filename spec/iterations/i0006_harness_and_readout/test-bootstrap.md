---
id: test-bootstrap
type: test
verifies: [req-bootstrap-flow, req-empty-spec-autostart, req-readme-onboarding]
statement: Selftest asserts the onboarding flow and empty-spec-autostart rule are present on the entry surface and the README leads with conversational onboarding (raw CLI demoted).
class: review
verify: selftest:bootstrap
killer: false
---
## Rationale (not load-bearing)
i0006 test. Selftest built in M4; RED until then.
