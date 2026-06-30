---
id: adr-ship-source
type: adr
statement: Distribution ships the Go SOURCE of the engine, not a prebuilt binary. Each vehicle builds the engine locally with the Go toolchain; we do not distribute quack.exe. This keeps the engine rebuildable, so future features can determinize more code (generate code that is compiled into the engine on the next build). Consequence: the Go toolchain is a required BUILD dependency at every vehicle (one winget install), while the built binary stays dependency-free at RUNTIME. Because we ship source and rebuild locally, the Smart App Control / code-signing concern collapses to a local-dev setting (turn SAC off, or sign for local dev) and is NOT a distribution requirement.
addresses: [req-go-engine]
adjudicated_by: human
killer: false
---

## Rationale (not load-bearing)
i0003 M6. The original "ship one self-contained binary" idea fought Smart App Control (unsigned binaries blocked) AND could not support self-extending determinizers (a shipped binary is frozen). Shipping source + local rebuild solves both: the user's machine builds a trusted-because-local binary, and new determinizers compile in. The cost is the Go toolchain as a build dependency, surfaced by the dependency-check prompt.
