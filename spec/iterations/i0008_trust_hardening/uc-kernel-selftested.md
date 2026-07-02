---
id: uc-kernel-selftested
type: usecase
refines: [need-qualities]
statement: The trust kernel proves itself on any machine through the shipped dependency-free selftest — hash vectors, suspect-cone exactness, the gate state machine, parser strictness, and the attest chain — with no toolchain and no unseeded randomness.
class: review
killer: false
---
## Rationale (not load-bearing)
Never `go test`: Windows flags freshly built test binaries; selftest ships inside the signed-once binary.
