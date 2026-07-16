---
id: adr-shim-product-tools
decided_in: i0020_cold_run_fixes
type: adr
adjudicated_by: human
statement: The go-bin fallback shim ships ONCE in the repo at product/tools/go.cmd. The dogfood launcher appends product\tools to PATH. Scaffolded vehicle and stub launchers append tools\vendor\tools. So the documented uv/go-bin lane works for bootstrap AND the engine's internal ratchet rebuild on machines without native Go.
class: review
killer: false
---
## Rationale (not load-bearing)
dependencies.md always documented `product\tools\go.cmd`; the launchers pointed at `.quack\tools` where nothing ships (field failure: 'go' is not recognized on a go-bin-only machine; ratchet warns every command). One shim in product/ vendors into every vehicle for free. Alternatives weighed in i0020 M3-candidates: .quack/tools (nothing ships there), scaffold-time copies (N copies drift).
