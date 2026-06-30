---
id: adr-selftest
type: adr
statement: The end state has ZERO Python. The dependency-free engine carries its own native self-test in Go. Every executed test check invokes the quack binary (quack selftest NAME), never an external toolchain like uv or python, because none exists in a just-unzipped vehicle. The binary already contains the parser, hashing, coverage, and CLI logic, so it verifies them in-process. Parity after cutover means the engine reproduces a baselined golden integrity root (a determinism regression check the binary performs), not a live comparison against Python. At cutover the Python engine and ALL of its uv-run-python executed checks are deleted or retired, including the earlier iterations checks that tested the Python engine itself; their Go equivalents live in quack selftest. The go test files remain only as an optional dev and CI convenience (Go, not Python); the shipped binary needs nothing external to verify itself.
addresses: [req-go-engine, req-behavior-parity]
adjudicated_by: human
killer: false
---

## Rationale (not load-bearing)
Surfaced i0003 M6. The test nodes were written with uv-run-python placeholders, which cannot survive removing Python/uv. A vendored, dependency-free engine must self-verify. Verify commands migrate from `uv run python -c ...` to `quack selftest <name>`, which works during the port (the binary is invoked) and after cutover (the Go engine IS the binary). It also sidesteps this machine's app-control policy that blocks go-test temp binaries, since the stable-named quack.exe runs.
