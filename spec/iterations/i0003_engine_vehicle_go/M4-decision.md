# M4 — Decide the architecture (i0003_engine_vehicle_go)

The decision, scored against M3's weighted criteria, traced to the ADRs.

## Chosen architecture  → i3-m4-architecture-stated

- **Implementation:** the engine is a single statically-linked **Go binary**; trivial config/frontmatter parsing is hand-rolled (zero-dependency). → `adr-go-language`, `adr-handroll-parse`
- **Boundary:** `product/` splits into a read-only **engine** and the **vehicle**; one **overlay resolver** walks vehicle→engine, **file-level** for prompts/guides, with the existing **semantic merge** retained for rigor/checklists. → `adr-engine-vehicle-overlay`
- **Identity integrity:** node ids are namespaced by iteration tag and guarded by a duplicate-id check. → `adr-unique-ids`

## Choice traced to the criteria  → i3-m4-choice-traced

Pugh scoring for Decision A. Datum = A3 (status quo). Cells are −1 / 0 / +1 versus the datum, times the M3 weight.

The headline criterion is **real-world AV/SmartScreen cleanliness**, not merely "nothing downloaded". That is the pain we are solving, so it is scored on how the artifact behaves in practice.

| criterion (weight) | A1 Go | A2 PyInstaller | A4 Rust |
|---|---|---|---|
| AV/SmartScreen-clean in practice (5) | +5 | **−5** | +5 |
| Fast startup (4) | +4 | 0 | +4 |
| Zero runtime dep (4) | +4 | +4 | +4 |
| Parity risk — lower better (4) | −4 | 0 | −4 |
| Rewrite cost — lower better (3) | −3 | 0 | −3 |
| Cross-compile (3) | +3 | 0 | +3 |
| Toolchain simplicity (4) | +4 | +4 | **−4** |
| **Weighted total** | **+13** | **+3** | **+5** |

- **A1 Go = +13** — the clear winner.
- **A2 PyInstaller = +3** — a frozen `.exe` is a known AV false-positive magnet, so it scores **negative** on the exact pain we are solving. The real-world penalty is the whole point: scored honestly, the apparent tie disappears. Zero rewrite cost does not offset failing the goal.
- **A4 Rust = +5** — a true runtime peer of Go, sunk by toolchain simplicity: non-technical vehicle authors cannot easily set up rustup and clippy. A static binary that no one in the audience can build is a poor fit.

## Sensitivity check

Go beats PyInstaller **structurally** — the AV penalty holds under any weighting. Go versus Rust hinges on the one **toolchain-simplicity** criterion: zero its weight and the two tie at +9, broken only by rewrite cost and LLM-assisted maintenance, both favouring Go but under-weighted here. So the win over PyInstaller is structural; the win over Rust is a deliberate call on real-world setup pain for non-technical authors.

## ADRs recorded  → i3-m4-adr-recorded *(derived: coverage:adr-traced)*

Four ADRs, each addressing a requirement (computed live):
- `adr-go-language` → req-go-engine
- `adr-handroll-parse` → req-zero-dep-parse
- `adr-engine-vehicle-overlay` → req-engine-vehicle-split, req-overlay-resolver
- `adr-unique-ids` → req-unique-ids
