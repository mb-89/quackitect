---
id: test-mint-connection
type: test
statement: Minting a directed edge creates it in the kind's default lane; minting the same edge again is a no-op; a symmetric kind mints canonical endpoint order; an unknown kind refuses.
class: executed
verify: selftest:mint-connection
killer: false
---
