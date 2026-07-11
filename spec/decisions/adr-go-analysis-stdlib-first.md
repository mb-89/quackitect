---
id: adr-go-analysis-stdlib-first
decided_in: i0017_pruning
type: adr
adjudicated_by: user
statement: quack build always runs gofmt and go vet (the toolchain is already required) and fails on findings; staticcheck runs grab-if-present from the tools lane, never as a required dependency.
class: review
killer: false
---
## Rationale (not load-bearing)
What golangci-lint would add and what forgoing it costs (owner discussion 2026-07-10): it aggregates ~50 linters with caching and one config - the real marginal value over vet+staticcheck is errcheck (unchecked errors), gosec (security patterns), unused/ineffassign, and CI ergonomics. For THIS codebase the loss is modest: staticcheck alone carries the highest-signal bug classes; errcheck would drown in our deliberate `raw, _ :=` ignore patterns and get configured down to noise; gosec matters most at network/input surfaces we barely have. The costs it would import are real at our size: an external required binary against the zero-dep spirit, and a suppression-config culture. REVERSIBLE: golangci is a dev-lane tool - if CI ever hosts this repo (GitHub Actions), adopting it THERE is the standard play and touches no engine code; recorded as the future option, not a loss.
