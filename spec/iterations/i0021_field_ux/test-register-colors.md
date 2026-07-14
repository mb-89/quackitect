---
id: test-register-colors
type: test
statement: On fixture nodes the register computes green for user-adjudicated and mechanically derived values, yellow for deferrable defaults, red for unadjudicated core fields; a self-reported confidence field changes no color.
class: executed
verify: selftest:register-colors
killer: false
tests_red: exempt - red observed at birth; the owner-ruled M6 design rounds of 2026-07-14 moved the hash after the build (adr-red-unobservable)
---
