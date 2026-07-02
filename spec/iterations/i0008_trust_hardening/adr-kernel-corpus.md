---
id: adr-kernel-corpus
type: adr
addresses: [req-kernel-selftest]
adjudicated_by: human
statement: Kernel corpora are baked as in-code Go literals (golden vectors, the linear/diamond/shared-subtree DAGs, tampered attest chains), and the property battery uses a hand-rolled xorshift64* PRNG with a baked seed — chosen over go:embed files (spreads the kernel's truth for no gain) and math/rand (stream stability across Go versions not ours to guarantee).
depends_on: []
class: review
killer: false
---
