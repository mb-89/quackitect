---
id: adr-go-language
type: adr
statement: Implement the engine as a single statically-linked Go binary, rather than Python with uv or a packaged Python executable. Decided for distribution (no web-downloaded executables, so no Windows SmartScreen or antivirus friction) and fast startup. Explicitly not decided for any training-data reason. That premise is false and carries no weight. A packaged Python executable via PyInstaller was rejected as a known antivirus false-positive magnet, worse on the exact axis we care about.
addresses: [req-go-engine]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)
i0003 first ADR. The port IS the engine-vehicle separation. Doing the split in Python then porting later would do the separation twice. At about 1429 lines of code with zero dependencies, this is the cheapest the switch will ever be.
