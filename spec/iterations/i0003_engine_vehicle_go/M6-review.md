# M6 — Build review (i0003_engine_vehicle_go)

Evidence for the M6 review subtasks.

## Internal quality ok  -> i3-m6-internal-quality-ok

The Go engine is `product/engine-go/` (one module, ~9 files): parse, engine (load/hash/merkle/attest/gate-state), coverage (rules + mint_id + duplicate-id guard), cli (+ shared help preamble), report (html/template + cytoscape, read from file, inlined for a self-contained email-able file), resolver (vehicle->engine overlay), selftest (in-process, zero external toolchain).

- Parity proven: the Go merkle root equals the Python root over the full graph, re-confirmed after every change.
- Determinism: the report is a pure display (rendering never runs checks — a re-entrancy guard), so it is byte-identical across renders and fast (responsiveness).
- The build is decomposed into 10 resumable subtasks; each left a green, tested tree.
- 13 in-process selftest checks, all green; coverage 0 holes; no duplicate ids.

## Implementation risks acceptable  -> i3-m6-impl-risks-acceptable

- **Determinism (R1):** mitigated. Sorted keys everywhere; the merkle root is stable and parity-checked; selftest:determinism + selftest:parity guard it.
- **Behavior parity (R2):** mitigated. status/lint byte-identical to Python; root identical; golden baselined as a regression gate.
- **Parser edges (R3):** CRLF + trailing-line handled to match Python splitlines (caught by the parity check).
- **No-Python end state:** the 6 old Python-engine tests are migrated to fast Go selftest:. The Python engine is transitional scaffolding, deleted at ship.
- **Distribution:** ship Go source, rebuilt locally (adr-ship-source); Go is a build dependency (dependency-check prompt). Code-signing for other SAC machines is an M7/release concern, not a dev blocker.

Residual to carry to M7: validate against the M1 success criteria; confirm the ship deletes the Python engine; decide signing for public distribution.
