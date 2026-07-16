---
id: adr-grandfathers-historical
decided_in: i0011_geronticide
type: adr
adjudicated_by: human
statement: Historical grandfathers become recorded decisions, not silent constants. Pre-i7 non-EARS statements keep an ears exempt marker citing THIS adr. Pre-i8 tests carry a tests_red exempt marker citing THIS adr. The testsRedSince constant and the forward-only-baseline file die. Retrofitting shipped statements was rejected, since it would be a wording avalanche over history with zero behavior value.
class: review
killer: false
---
## Rationale (not load-bearing)
The decision IS the record. Every exemption now points here; an exemption without a citation fails test-grandfathers-decided.
