# L4 - Build & test · i0020_cold_run_fixes

## The realized fixes (one section per step)

## go-bin shim wired  → i20-m4-shim
The shim was ALWAYS shipped (`product/tools/go.cmd`) - the launchers just never pointed at it. Fixed: `quack.cmd` appends `product\tools` (the retired `.quack\tools` reference is gone, and the stray `.quack/` dir with it - clean-status green again); the scaffolded vehicle launcher (`vehicleLauncherTmpl`, ops.go) appends `tools\vendor\tools`, which the vendoring populates for free. NEW: `product/tools/gofmt.cmd` - go-bin exposes only `go.exe`, so the gofmt shim resolves GOROOT and forwards; this un-broke `selftest go-analysis` AND let the engine's own static-analysis build gate run (it immediately caught unformatted code in this very batch - the gate works). dependencies.md's documented paths now match reality.

## init defaults connections  → i20-m4-edges-default
`vehicleTomlTmpl` (extracted const) now carries `edges = "connections"`, matching `start stubs`. The engine's global default stays frontmatter for legacy boards ([[adr-scaffold-edges-connections]]). compose-reference now states plainly: JSONL connections is THE lane for new work.

## template examples cleaned  → i20-m4-template-clean
Dropped from the stub template: `trace/ex-need`, `trace/ex-criterion`, `trace/ex-rationale`, `trace/ex-force-rationale`, `usecases/ex-usecase`, the `conflicts-with` example connection, and the example edges in `refers`/`refines` jsonl (files stay, empty). Non-trace examples (stakeholders, raid, rules, guides, methods) stay - they teach shapes without entering coverage. Tests amended to the new contract: `example-notes` (asserts survivors present AND trace-enterers absent), `stub-spec` (lanes exist, no ex- edges), `type-stakeholders` (skips the new classes/README).

## defer/retire ported  → i20-m4-defer-port
Minimal stamp port (defer.go, `go-defer-retire`): `quack defer <id> <reason>` / `quack retire <id> <reason>` stamp the check's frontmatter; reason REQUIRED. Boards render `[>] DEFER` / `[-] RETIRED`; `stateSatisfies` releases dependents and versions (a deferred check never blocks the walk, never reads DONE). Strict whitelist extended. **Dogfooded in this very iteration:** `i20-m4-seed` below was deferred with the new command.

## schema home resolves vehicle->engine  → i20-m4-schema-home
`configDir()` now routes through `EngineDir()` instead of the hardcoded dogfood path - a vehicle inherits the vendored config; the "no schema home" lint noise every vehicle saw is gone.

## seed - DEFERRED  → i20-m4-seed
Deferred to i0021_field_ux with the recorded reason (its theme IS "filling becomes vetoing"); stamped via the new `quack defer` - the M3 decision 4 executed exactly as decided.

## vehicle-misuse guard  → i20-m4-guard
`vehicleMisuseFinding()` (defer.go, `go-vehicle-misuse-guard`): lint warns when a VEHICLE's spec holds iterations while product/ is empty - the exact Benjamin-in-zwiftbot signature. Plus the integrate.md bootstrap warning block. The avoid-it-in-the-future ask, structural.

## doc batch  → i20-m4-docs-batch
- NEW guide `vehicles-and-overlays.md` (engine/vehicle/stub model + override-don't-fork, one page).
- `project_types/classes/README.md` - role classes, NOT a project type; type-stakeholders test respects it.
- compose-reference: the NFR convention canonized (qualities need -> ISO-25010 quality use-cases -> quality reqs) + the edges-lane clarity.
- integrate.md warning; AGENTS.md shim wording; README walkthrough-link fold-in (the pre-iteration edit, now owned here).

## Build  → i20-m4-build
All steps above realized; design markers: `go-defer-retire`, `go-vehicle-misuse-guard` (new), plus amended regions in ops.go/config.go/trust.go/cli.go/engine.go.

## Tests pass  → i20-m4-tests-pass (killer, executed)
Red ritual honored: `test-cold-run-fixes` authored first, `red-observed @ 106ce254`, then built to GREEN. Full battery: **selftest exit 0, zero FAIL** - including the two pre-existing failures now fixed (clean-status via the .quack removal; go-analysis via the gofmt shim).

## Internal quality  → i20-m4-quality
Self-review: every change carries its rationale comment and design marker; the analysis gate (now functional) vetoes unformatted code; behavior changes swept their asserting tests in the same walk (three amended, none deleted); no scope beyond the noted fixes + the two owner-sanctioned extras (gofmt shim, README fold-in).

**Verdict:** all seven realized steps green, one honest defer. The killer `tests-pass` computes green. The L4 gate goes to the owner.
