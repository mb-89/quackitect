# L5 - Docs & ship · i0020_cold_run_fixes

## Docs match the changed surface  → i20-m5-docs
Note-by-note outcome - every one of the 10 archived cold-run notes, disposed:

| note | outcome |
|---|---|
| go-bin fallback unwired | **FIXED** - launchers wire `product\tools` (dogfood) / `tools\vendor\tools` (vehicles); NEW gofmt shim; dependencies.md matches reality; test-cold-run-fixes guards it |
| defer/retire not ported | **FIXED (minimal)** - stamp port, boards render [>]/[-], dependents release; cross-iteration move recorded as future work |
| compose toil (seed checklist) | **DEFERRED to i0021_field_ux** - stamped with the new `quack defer`, reason recorded (thematic home) |
| hand-authoring toil (mint/apply for vehicles) | **PARTIALLY ADDRESSED** - authoring lanes documented; full mint extension rides i0021 with seed (same theme) |
| edges default split | **FIXED** - init scaffolds connections like stubs ([[adr-scaffold-edges-connections]]); compose-reference names the lanes plainly |
| vehicle lint schema-home | **FIXED** - configDir() resolves vehicle->engine |
| NFR tracing vs req-traced | **CANONIZED** - the qualities-need -> ISO-25010-quality-use-cases convention is in compose-reference; no engine change needed |
| vehicle/overlay concept unclear | **FIXED** - vehicles-and-overlays guide + integrate.md bootstrap warning + the misuse lint (go-vehicle-misuse-guard) |
| project-type classes smell | **FIXED** - classes/README declares role classes, not a type; type-stakeholders test respects it |
| stub template pollution | **FIXED** - trace-entering ex-* nodes and example edges out; example-notes/stub-spec/type-stakeholders amended to the new contract |

In-flight findings, disposed: the i0016 "orphan tests" alarm was a MISDIAGNOSIS - groom/tray are properly deferred dormant canvas features and tests-pass honors the deferral. The REAL blemishes (why-delta lists deferred/uncached tests as deltas; the two deferral ADRs carry TODO statements) are noted for the next triage. The pre-existing selftest failures are gone: clean-status (the stray .quack removed with the shim fix) and go-analysis (the gofmt shim) - the analysis gate is live again and vetoed unformatted code in this very batch.

Consistency sweep - all of these describe the POST-fix behavior:

- dependencies.md
- AGENTS.md
- compose-reference
- integrate.md
- the new guide
- the launcher comments

No prompt teaches the superseded way (the retired .quack\tools reference is gone).

## Packaged  → i20-m5-packaged
`quack ship` packages product/ -> the data home out/, regenerating the book and report; the committed spec/book.html refreshes in the same move.

**Verdict:** every note fixed, canonized or explicitly deferred with its reason. Battery green (exit 0, zero FAIL). The working-tomorrow goal is covered (fresh clone + `.\quack` bootstraps and ratchets with zero native Go). The killer docs check and the L5 gate go to the owner.
