# M3 — Candidate architectures (i0003_engine_vehicle_go)

Two architecture decisions carry this iteration. For each: the alternatives, the weighted criteria (derived from the requirements), and a rough feasibility check. The decision and ADR are M4.

## Decision A — engine implementation & distribution

### Alternatives
- **A1. Go static binary** — rewrite the ~1429-LOC engine in Go; ship one statically-linked binary; hand-roll the trivial parsing.
- **A2. Packaged Python exe** (PyInstaller / Nuitka) — keep the Python source; freeze it into a single Windows `.exe`.
- **A3. Status quo** — Python run via `uv` (the baseline; the thing we are trying to leave).
- **A4. Rust static binary** — rewrite the engine in Rust; ship one statically-linked binary.

### Criteria (weighted, from the requirements)
| criterion | weight | from |
|---|---|---|
| No web-downloaded executables (AV/SmartScreen-clean) | 5 | req-go-engine, the M1 problem |
| Fast startup (req-responsiveness, <1s) | 4 | req-responsiveness |
| Zero runtime dependency / unzipped-folder run | 4 | req-go-engine |
| Behavior-parity risk (lower is better) | 4 | req-behavior-parity |
| Rewrite cost (lower is better) | 3 | scope/budget |
| Cross-compile to win/mac/linux | 3 | req-go-engine |
| Dev/build toolchain simplicity — a non-technical vehicle author can install and build | 4 | uc-vendor-engine, req-dep-prompt |

### Feasibility (rough)
- **A1 Go:** feasible. Static binary downloads nothing; ~1-5ms start; cross-compiles from one machine. Parity risk is the main cost (map-order determinism, hashing) — bounded by the golden suite. Rewrite is real but cheap at this size. *Strong on every high-weight criterion.*
- **A2 PyInstaller/Nuitka:** feasible but weak where it matters. The frozen `.exe` is a **known AV false-positive magnet** — it makes the headline criterion *worse*, not better. Startup includes unpack overhead. Nuitka needs a C toolchain. No rewrite, but it fails the primary goal.
- **A3 status quo:** baseline. Fails the headline criterion (uv fetches executables) and startup. Zero rewrite, but it is the problem.
- **A4 Rust:** feasible, and a true peer of Go on the *runtime* criteria — static binary, fast start, zero runtime dep, cross-compiles. It loses on **toolchain simplicity**: rustup plus the toolchain and clippy are heavier to install and operate than Go, and in practice non-technical vehicle authors struggle to set it up (a recurring field observation). That conflicts directly with the dependency-prompt / winget / low-friction goal — the build dep should be a one-line `winget install`. Rust also costs more to port and is less gently maintained by LLM assist than Go for a tiny tool whose needs the Go stdlib already covers. Elaborated, then set aside.

## Decision B — engine/vehicle boundary & overlay resolution

### Alternatives
- **B1. File-level overlay** — the resolver picks the most-specific whole file along the vehicle→engine chain (Hugo/Rails style). Simple lookup.
- **B2. Semantic / field merge** — merge resources field-by-field (Kustomize / device-tree style). Powerful, needs a merge engine.

### Criteria (weighted)
| criterion | weight | from |
|---|---|---|
| Simplicity of the resolver (one chain) | 5 | req-overlay-resolver |
| Override power for the vehicle | 3 | uc-vendor-engine |
| Nestability (vehicle-as-engine) | 3 | adr-engine-vehicle-overlay |
| Drift risk (lower is better) | 3 | req-engine-vehicle-split |

### Feasibility (rough)
- **B1 file-level:** feasible and simple; `gather` is already a proto file-resolver. Drift risk if the engine file changes shape under an override — acceptable for prompts/guides.
- **B2 semantic merge:** feasible; quackitect already does a semantic merge for rigor/checklists. Overkill for prose resources.
- **Lean (for M4):** **file-level for prompts/guides, semantic merge kept only for rigor/checklists** — most-specific-wins, inherit otherwise. Best simplicity-to-power.

## Summary
The high-weight criteria point cleanly: **A1 (Go)** for the implementation, **B1+** (file-level overlay, semantic merge retained for checklists) for the boundary. Rust (A4) is the closest contender — a runtime peer — but loses on toolchain simplicity for non-technical vehicle authors, which is the deciding criterion given the low-friction goal. M4 records these as `adr-go-language` and `adr-engine-vehicle-overlay`, with the Pugh scoring.
