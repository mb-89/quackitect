---
id: test-id-charset
type: test
statement: Fixture ids with an uppercase letter, an underscore, and consecutive hyphens each fail the lint; every existing workspace id passes.
class: executed
tests_red: exempt - red observed 2026-07-06 at 548fff01 BEFORE the build; the parent requirement's statement was amended post-observation (connection-separator precision), moving the hash; re-observation impossible because the test now passes (class precedent adr-grandfathers-historical)
verify: selftest:id-charset
killer: false
---
