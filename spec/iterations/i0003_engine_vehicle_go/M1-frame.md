# M1 — Frame the problem and vision (i0003_engine_vehicle_go)

The evidence for the four M1 subtasks. Read top-down. Each section is the referent for one gate.

## Vision and scope  → i3-m1-vision-scope-stated

Moore frame (For / Who / The / That / Unlike):

- **For** builders who ship quackitect to other projects and run it on fresh machines,
- **Who** need an engineering-gate engine without a runtime to install or executables to download,
- **The** quackitect engine **is** a single self-contained binary,
- **That** other projects vendor and overlay without forking, and that runs from an unzipped folder with nothing to install,
- **Unlike** the current Python-plus-uv engine, which downloads executables (tripping Windows security), starts slowly, and tangles the engine with quackitect's own project files.

Scope (the agreed FIRST move): the Go port **is** the engine/vehicle separation, in one iteration. In scope: the Go rewrite, the engine/vehicle split, one overlay resolver, hand-rolled parsing, the cli-help fix, the dependency-check prompt, the unique-id guard, and the report trace-graph filter. Out of scope: `drive_as_engine` / `integrate_as_engine` (the manifest + extension-API prompt) — a later version.

## Problem agreed — the delta is real and worth solving  → i3-m1-problem-agreed  *(killer)*

- **Goal:** the engine is a reusable, dependency-free artifact, cleanly separable from any one project, vendored and overlaid by host "vehicles".
- **Actual:** the engine is Python run via `uv`. `uv` fetches executables from the web (SmartScreen / antivirus friction), startup is ~100ms-plus per call, and the engine logic is intermixed with quackitect's own spec and identity under `product/`. There is no engine/vehicle boundary and no dependency-free distribution.
- **Delta:** to open-source quackitect and ship proprietary vehicles, the engine must become a stable, dependency-free, overlay-able artifact. Porting to Go is the cheapest way to get the distribution property **and** the clean boundary at once — at ~1429 LOC with zero dependencies, doing the split in Python and porting later would do the separation twice. The delta is real and worth solving now.

## Success is measurable — Chapter-1 criteria  → i3-m1-success-measurable

Each criterion maps to an executed test (the acceptance contract):

1. A single built binary runs every command on a fresh machine with no Python, no uv, no network, from an unzipped folder. → `test-binary-deps`
2. The Go report determinism root is byte-identical to the Python report for the same spec. → `test-parity-golden`
3. A vehicle run resolves engine + vehicle resources through one overlay chain and never writes under the engine. → `test-split-readonly`
4. No node id is declared twice; `quack lint` fails on any collision. → `test-unique-ids` (already green)
5. Every subcommand answers `-h` / `--help` / `-?` with usage and no side effects; ids starting with a dash are rejected. → `test-cli-help`
6. A dependency-check prompt lists each build dependency with its winget path. → `test-dep-prompt`
7. The report trace graph filters live (one box: iteration + text/regex, AND/OR) and relayouts, without changing the committed HTML. → `test-trace-filter`
8. An external vehicle can integrate quackitect as an engine via a documented path (vendor → build → configure → overlay → run); a vehicle's `quack gather` resolves the engine's resources through the overlay chain. → `test-integrate` *(added at M7: the integration was wrongly deferred; captured backward as `req-integrate`)*

## Top risks logged — RAID  → i3-m1-top-risks-logged

- **R1 (Risk, high):** Report determinism breaks in Go — randomized map iteration yields a non-deterministic integrity root. *Mitigation:* sort every keyed loop; `report-determinism` + `test-parity-golden` guard it.
- **R2 (Risk, high):** Behavior drift — subtle Python/Go differences (hashing, ordering, parsing) silently change the method. *Mitigation:* golden-output parity suite over a fixture vehicle.
- **R3 (Risk, medium):** The hand-rolled parser misreads an edge case the Python `split`-based parser tolerated. *Mitigation:* parser fixtures in the parity suite; keep the parsed subset trivial.
- **R4 (Assumption, low):** The Go toolchain is present on dev machines (build-time only). *Mitigation:* the dependency-check prompt + winget path.
- **R5 (Issue, medium):** The exact engine-vs-vehicle line in `product/` is undecided. *Mitigation:* settled by M2–M4 (`req-engine-vehicle-split`, `adr-engine-vehicle-overlay`).
- **R6 (Dependency, medium):** Scope is large; interruption could lose build progress. *Mitigation:* the M6 plan-build step seeds resumable subtasks; milestone-monotonic gating.
