<<<quackitect-archive v1>>>
<<<node: OVERRIDE-M1-scope.md>>>
# Override (M1) — accept the large i0003 scope as one iteration

Logged at the M1 gate, per `guides/milestone-review.md` ("an override blesses past a red-team flag; log it WITH its dissent").

**Decision (human, i0003 M1):** keep the full scope in one iteration — Go port, engine/vehicle split, overlay resolver, hand-rolled parsing, cli-help fix, dependency-check prompt, unique-id guard, and the report trace-graph filter. Do not split.

**Rationale:** the classic over-scope caution is calibrated for human teams' cognitive limits and is weaker for AI-driven work. For a human team the human would have split this iteration. The port-is-separation synergy also means a split would do the separation work twice (the rework the retro hunts).

**Dissent (the red-team position being overridden):** standard systems-engineering guidance says split a large iteration to cut risk and cognitive load. That position is acknowledged and set aside for the reason above.

**Kill-criterion:** if the M5 spike shows report determinism or behavior parity (R1 / R2) is shakier than expected, split the report-shell + trace-filter work out into a follow-on version rather than forcing it into i0003. Re-raise at the M5 gate.
<<<node: adr-engine-vehicle-overlay.md>>>
---
id: adr-engine-vehicle-overlay
type: adr
statement: Separate the engine from the vehicle as an overlay resolution chain (vehicle to engine), where the most-specific layer wins and un-overridden resources are inherited. Prior art is OverlayFS, Kustomize bases and overlays, Hugo theme inheritance, and Rails mountable engines. The chain is nestable. A vehicle can itself be an engine for another.
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)
i0003. File-level override for prompts and guides (simple). Keep semantic merge for rigor and checklists (already exists). Merge granularity is the one open fork.
<<<node: adr-go-language.md>>>
---
id: adr-go-language
type: adr
statement: Implement the engine as a single statically-linked Go binary, rather than Python with uv or a packaged Python executable. Decided for distribution (no web-downloaded executables, so no Windows SmartScreen or antivirus friction) and fast startup. Explicitly not decided for any training-data reason. That premise is false and carries no weight. A packaged Python executable via PyInstaller was rejected as a known antivirus false-positive magnet, worse on the exact axis we care about.
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)
i0003 first ADR. The port IS the engine-vehicle separation. Doing the split in Python then porting later would do the separation twice. At about 1429 lines of code with zero dependencies, this is the cheapest the switch will ever be.
<<<node: adr-handroll-parse.md>>>
---
id: adr-handroll-parse
type: adr
statement: Hand-roll the config.toml and frontmatter parser instead of vendoring a TOML or YAML library. The parsed subset is trivial (key and value, plus simple lists). This keeps the zero-dependency property that motivates the rewrite.
adjudicated_by: human
killer: false
---

## Rationale (not load-bearing)
i0003. Vendoring a compiled-in library was the alternative. Rejected to keep the nothing-vendored, nothing-downloaded property pure.
<<<node: adr-selftest.md>>>
---
id: adr-selftest
type: adr
statement: The end state has ZERO Python. The dependency-free engine carries its own native self-test in Go. Every executed test check invokes the quack binary (quack selftest NAME), never an external toolchain like uv or python, because none exists in a just-unzipped vehicle. The binary already contains the parser, hashing, coverage, and CLI logic, so it verifies them in-process. Parity after cutover means the engine reproduces a baselined golden integrity root (a determinism regression check the binary performs), not a live comparison against Python. At cutover the Python engine and ALL of its uv-run-python executed checks are deleted or retired, including the earlier iterations checks that tested the Python engine itself; their Go equivalents live in quack selftest. The go test files remain only as an optional dev and CI convenience (Go, not Python); the shipped binary needs nothing external to verify itself.
adjudicated_by: human
killer: false
---

## Rationale (not load-bearing)
Surfaced i0003 M6. The test nodes were written with uv-run-python placeholders, which cannot survive removing Python/uv. A vendored, dependency-free engine must self-verify. Verify commands migrate from `uv run python -c ...` to `quack selftest <name>`, which works during the port (the binary is invoked) and after cutover (the Go engine IS the binary). It also sidesteps this machine's app-control policy that blocks go-test temp binaries, since the stable-named quack.exe runs.
<<<node: adr-ship-source.md>>>
---
id: adr-ship-source
type: adr
statement: Distribution ships the Go SOURCE of the engine, not a prebuilt binary. Each vehicle builds the engine locally with the Go toolchain; we do not distribute quack.exe. This keeps the engine rebuildable, so future features can determinize more code (generate code that is compiled into the engine on the next build). Consequence: the Go toolchain is a required BUILD dependency at every vehicle (one winget install), while the built binary stays dependency-free at RUNTIME. Because we ship source and rebuild locally, the Smart App Control / code-signing concern collapses to a local-dev setting (turn SAC off, or sign for local dev) and is NOT a distribution requirement.
adjudicated_by: human
killer: false
---

## Rationale (not load-bearing)
i0003 M6. The original "ship one self-contained binary" idea fought Smart App Control (unsigned binaries blocked) AND could not support self-extending determinizers (a shipped binary is frozen). Shipping source + local rebuild solves both: the user's machine builds a trusted-because-local binary, and new determinizers compile in. The cost is the Go toolchain as a build dependency, surfaced by the dependency-check prompt.
<<<node: adr-unique-ids.md>>>
---
id: adr-unique-ids
type: adr
statement: Guarantee node-id uniqueness by namespacing task ids with the iteration tag at creation (mint_id, i0003 to i3-) plus a deterministic duplicate-id check that reports any collision. Adapted from the sebot determinizer mint tool (a shorthand plus a zero-padded counter); quackitect namespaces by iteration rather than by type, because the collision is iteration-scoped (generic milestone ids like m1-gate). Rejected the alternative of auto path-qualifying ids inside the resolver, a larger semantic change that is risky right before the Go port.
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)
i0003. The stopgap (mint_id, duplicate_ids, the lint guard) lands in the current Python engine now so the i0003 build cannot lose data. The Go port carries the same guarantee.
<<<node: iteration.md>>>
---
iteration: i0003_engine_vehicle_go
status: active
type: default
rigor: systematic
---

Re-establish the engine as a standalone, dependency-free Go binary, cleanly separated from quackitect-the-vehicle: the port IS the separation. Folds in the cli-help convention fix and a dependency-check prompt. Go chosen for distribution (static binary, no web-downloaded executables -> no Windows SmartScreen/AV friction) and startup speed; explicitly NOT for any training-data reason.
<<<node: req-engine-vehicle-overlay.md>>>
---
id: req-engine-vehicle-overlay
type: requirement
statement: The engine shall separate from the vehicle behind one overlay resolver that an external vehicle integrates by a documented path - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. product separates into a read-only ENGINE and a VEHICLE. The engine holds the logic plus default resources (method and project_types). The vehicle holds quackitect's own spec, .quack, and identity files (README, AGENTS, voice). A vehicle run never writes under the engine. The vehicle overrides resources by overlay, never by editing engine files. *(was req-engine-vehicle-split)*
2. One resolver walks the vehicle-to-engine chain. The most-specific layer wins. An un-overridden resource is inherited from the engine. The command surface, guides, the report shell, and gather all resolve their resources through this one resolver. *(was req-overlay-resolver)*
3. An external vehicle can integrate quackitect as an engine with a documented path. There is an integrate prompt with a worked example (vendor the engine source + resources, build, configure, overlay, run). The engine's resource lookup (gather, guides, the report shell) routes through the overlay chain, so a vendored vehicle resolves the engine's rigor and type resources without any hardcoded dogfood path. Saying to a vehicle "run on quackitect as an engine, integrate it" works. *(was req-integrate)*
<<<node: req-go-port.md>>>
---
id: req-go-port
type: requirement
statement: The engine shall ship as one zero-dependency Go binary that preserves the Python engine's observable behavior - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The Go engine preserves the exact observable behavior of the Python engine. Same commands status next start why bless note gather report ship lint verify. Same node model and suspect-bless semantics. Same coverage rules. The report determinism root is byte-identical to the Python output for the same spec. *(was req-behavior-parity)*
2. The engine is a single statically-linked Go binary. It has zero runtime dependencies. It performs no web download at run time. It builds with the Go toolchain and cross-compiles to Windows, macOS, and Linux from one machine. *(was req-go-engine)*
3. The engine parses config.toml and node frontmatter with hand-rolled readers over the trivial subset in use (key and value, plus simple lists). No third-party TOML or YAML library is vendored. *(was req-zero-dep-parse)*
4. Every subcommand reacts to -h and --help and -? by printing its usage and exiting with no side effects. The CLI rejects a version id that starts with a dash. *(was req-cli-help)*
5. A dependency-check prompt lists each build and development dependency with its winget install path. When a required tool is missing, the agent consults this prompt and asks the user to install it. Runtime dependencies are none. The build and development list is go (winget GoLang.Go) and the optional git (winget Git.Git). *(was req-dep-prompt)*
<<<node: req-responsiveness.md>>>
---
id: req-responsiveness
type: requirement
statement: Every user interaction produces visible feedback within 1 second on a 2025 mid-range laptop. If the work takes longer, an acknowledgement appears first within that second (for example started computing). A long-running task reports progress at least once per minute. The more frequent and interactive an interaction, the more it overachieves this bound, where that needs no major architecture rework and degrades no other design goal. This binds the engine and the output it produces.
depends_on: []
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---

## Rationale (not load-bearing)
M2 non-functional requirement. Subsumes the startup-speed motivation of the Go port as one instance of a general fast-tooling goal. The durable principle is guides/responsiveness.md (scope: always), so it also binds future iterations and vehicles. The Go binary makes the 1-second bound easy for the engine; the report trace-filter (client-side) keeps the output instant.
<<<node: req-trace-filter.md>>>
---
id: req-trace-filter
type: requirement
statement: The report trace graph has a single filter box that filters the graph live in the browser. The box accepts one unified expression. An iteration term filters by iteration: a bare iteration id (0001 means only that iteration) and the comparisons <= and >= and < and > against an iteration. Any other term matches a node id and statement, as plain text or as a /regex/. Terms combine with AND and OR. Focusing or clicking the box reveals help that explains both the iteration and the text syntax. On any change the visible subgraph re-layouts automatically on the client so it re-packs. The committed report keeps its deterministic server-baked layout as the initial state. Filtering and relayout are runtime view interactions and never change the determinism root.
depends_on: []
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [operation]
discipline: [software]
quality: [usability]
---

## Rationale (not load-bearing)
M2. One box, not two: the parser classifies each term by shape (an iteration predicate looks like 0001 or <=0002; everything else is a text or /regex/ match), so the reader types one expression. On-focus help keeps the UI clean. v1 has AND binding tighter than OR and no parentheses. Auto-reorder runs a built-in cytoscape layout (breadthfirst, rooted at needs) over the visible subset, so no extra JS library is vendored. The determinism boundary is the key constraint: the integrity root is hashed over ledger data, not layout or view state, so live filtering does not conflict with req-behavior-parity.
<<<node: req-unique-ids.md>>>
---
id: req-unique-ids
type: requirement
statement: Every node id is globally unique across the whole spec. The engine provides a deterministic id creator that namespaces a local name by its iteration tag, and a duplicate-id check that reports any collision. A reused id can never silently shadow another iteration's data.
depends_on: []
class: review
killer: true
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [engineering]
discipline: [software]
quality: [functionality]
---

## Rationale (not load-bearing)
M2 killer. Found during i0003 compose. The generic milestone ids (m1-gate) collide across iterations on the flat id keyspace, silently shadowing the earlier iteration on load. See adr-unique-ids.
<<<node: tasks/i3-m1-gate.md>>>
---
id: i3-m1-gate
statement: Milestone M1 (Frame the problem and vision) passed its review.
milestone: M1
class: review
killer: true
depends_on: [i3-m1-problem-agreed,i3-m1-success-measurable,i3-m1-top-risks-logged,i3-m1-vision-scope-stated]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless.
<<<node: tasks/i3-m1-problem-agreed.md>>>
---
id: i3-m1-problem-agreed
statement: Problem agreed. The delta is real and worth solving.
milestone: M1
class: review
killer: true
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i3-m1-success-measurable.md>>>
---
id: i3-m1-success-measurable
statement: Success is measurable. Chapter-1 success criteria are defined.
milestone: M1
class: review
killer: false
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i3-m1-top-risks-logged.md>>>
---
id: i3-m1-top-risks-logged
statement: Top risks logged as RAID.
milestone: M1
class: review
killer: false
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i3-m1-vision-scope-stated.md>>>
---
id: i3-m1-vision-scope-stated
statement: Vision and scope stated. The For Who The That Unlike frame is drafted.
milestone: M1
class: review
killer: false
depends_on: []
---

## Rationale (not load-bearing)
Subtask of milestone M1. Human judgment.
<<<node: tasks/i3-m2-gate.md>>>
---
id: i3-m2-gate
statement: Milestone M2 (Requirements) passed its review.
milestone: M2
class: review
killer: true
depends_on: [i3-m2-inputs-captured,i3-m2-requirements-traced,i3-m2-requirements-verifiable,i3-m2-stakeholder-coverage, i3-m1-gate]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless. Depends on its subtasks and the prior milestone gate (monotonic).
<<<node: tasks/i3-m2-inputs-captured.md>>>
---
id: i3-m2-inputs-captured
statement: Inputs captured. Context, stakeholders, and use cases are recorded.
milestone: M2
class: review
killer: false
depends_on: [i3-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Human judgment. Gated behind i3-m1-gate (milestone-monotonic).
<<<node: tasks/i3-m2-requirements-traced.md>>>
---
id: i3-m2-requirements-traced
statement: Requirements traced. Every requirement traces to a need.
milestone: M2
class: executed
killer: false
verify: coverage:req-traced
depends_on: [i3-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Derived from the trace (req-traced).
<<<node: tasks/i3-m2-requirements-verifiable.md>>>
---
id: i3-m2-requirements-verifiable
statement: Requirements verifiable. Every requirement has a test.
milestone: M2
class: executed
killer: false
verify: coverage:req-has-test
depends_on: [i3-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Derived from the trace (req-has-test).
<<<node: tasks/i3-m2-stakeholder-coverage.md>>>
---
id: i3-m2-stakeholder-coverage
statement: Stakeholder coverage. No role is left out.
milestone: M2
class: review
killer: false
depends_on: [i3-m1-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M2. Human judgment. Gated behind i3-m1-gate (milestone-monotonic).
<<<node: tasks/i3-m3-alternatives-elaborated.md>>>
---
id: i3-m3-alternatives-elaborated
statement: At least two architecture alternatives elaborated.
milestone: M3
class: review
killer: true
depends_on: [i3-m2-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment. Gated behind i3-m2-gate (milestone-monotonic).
<<<node: tasks/i3-m3-criteria-weighted.md>>>
---
id: i3-m3-criteria-weighted
statement: Decision criteria weighted and derived from the requirements.
milestone: M3
class: review
killer: false
depends_on: [i3-m2-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment. Gated behind i3-m2-gate (milestone-monotonic).
<<<node: tasks/i3-m3-feasibility-checked.md>>>
---
id: i3-m3-feasibility-checked
statement: Feasibility rough-checked per candidate.
milestone: M3
class: review
killer: false
depends_on: [i3-m2-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M3. Human judgment. Gated behind i3-m2-gate (milestone-monotonic).
<<<node: tasks/i3-m3-gate.md>>>
---
id: i3-m3-gate
statement: Milestone M3 (Candidate architectures) passed its review.
milestone: M3
class: review
killer: true
depends_on: [i3-m3-alternatives-elaborated,i3-m3-criteria-weighted,i3-m3-feasibility-checked, i3-m2-gate]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless. Depends on its subtasks and the prior milestone gate (monotonic).
<<<node: tasks/i3-m4-adr-recorded.md>>>
---
id: i3-m4-adr-recorded
statement: ADR recorded and traced. Every ADR addresses a requirement.
milestone: M4
class: executed
killer: false
verify: coverage:adr-traced
depends_on: [i3-m3-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M4. Derived from the trace (adr-traced).
<<<node: tasks/i3-m4-architecture-stated.md>>>
---
id: i3-m4-architecture-stated
statement: Chosen architecture stated.
milestone: M4
class: review
killer: false
depends_on: [i3-m3-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M4. Human judgment. Gated behind i3-m3-gate (milestone-monotonic).
<<<node: tasks/i3-m4-choice-traced.md>>>
---
id: i3-m4-choice-traced
statement: Choice traced to the weighted criteria.
milestone: M4
class: review
killer: false
depends_on: [i3-m3-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M4. Human judgment. Gated behind i3-m3-gate (milestone-monotonic).
<<<node: tasks/i3-m4-gate.md>>>
---
id: i3-m4-gate
statement: Milestone M4 (Decide the architecture) passed its review.
milestone: M4
class: review
killer: true
depends_on: [i3-m4-adr-recorded,i3-m4-architecture-stated,i3-m4-choice-traced, i3-m3-gate]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless. Depends on its subtasks and the prior milestone gate (monotonic).
<<<node: tasks/i3-m5-design-buildable.md>>>
---
id: i3-m5-design-buildable
statement: Design is buildable.
milestone: M5
class: review
killer: false
depends_on: [i3-m4-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment. Gated behind i3-m4-gate (milestone-monotonic).
<<<node: tasks/i3-m5-gate.md>>>
---
id: i3-m5-gate
statement: Milestone M5 (Prove the riskiest unknowns) passed its review.
milestone: M5
class: review
killer: true
depends_on: [i3-m5-design-buildable,i3-m5-riskiest-validated,i3-m5-spike-recorded, i3-m4-gate]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless. Depends on its subtasks and the prior milestone gate (monotonic).
<<<node: tasks/i3-m5-riskiest-validated.md>>>
---
id: i3-m5-riskiest-validated
statement: Riskiest assumptions validated by evidence.
milestone: M5
class: review
killer: true
depends_on: [i3-m4-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment. Gated behind i3-m4-gate (milestone-monotonic).
<<<node: tasks/i3-m5-spike-recorded.md>>>
---
id: i3-m5-spike-recorded
statement: Spike results recorded. Design advanced as needed.
milestone: M5
class: review
killer: false
depends_on: [i3-m4-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M5. Human judgment. Gated behind i3-m4-gate (milestone-monotonic).
<<<node: tasks/i3-m6-build-planned.md>>>
---
id: i3-m6-build-planned
statement: Build planned. The build is decomposed into small, resumable build subtasks seeded under M6.
milestone: M6
class: review
killer: true
depends_on: [i3-m5-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment. Gated behind i3-m5-gate (milestone-monotonic).
<<<node: tasks/i3-m6-build.md>>>
---
id: i3-m6-build
statement: Build the design. The planned steps below realize it, in dependency order.
milestone: M6
class: review
killer: false
depends_on: [i3-m6-parity-perf]
---

## Rationale (not load-bearing)
Generic build parent for milestone M6, seeded by the plan-build step. The planned build steps are
its children (parent: i3-m6-build) and chain in dependency order; this gate rolls up when the last
step is done. Verification runs after build.
<<<node: tasks/i3-m6-deps-prompt.md>>>
---
id: i3-m6-deps-prompt
statement: Author method prompts dependencies file listing build dependencies with their winget paths.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-overlay-resolver]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-overlay-resolver so the port proceeds in dependency order and survives interruption.
<<<node: tasks/i3-m6-detailed-design-complete.md>>>
---
id: i3-m6-detailed-design-complete
statement: Detailed design complete. Every requirement has a realized design.
milestone: M6
class: executed
killer: false
verify: coverage:designs-realized
depends_on: [i3-m6-parity-perf]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Derived from the trace (designs-realized).
<<<node: tasks/i3-m6-gate.md>>>
---
id: i3-m6-gate
statement: Milestone M6 (Build and verify) passed its review.
milestone: M6
class: review
killer: true
depends_on: [i3-m6-build-planned,i3-m6-go-scaffold,i3-m6-go-parser,i3-m6-go-engine-core,i3-m6-go-coverage-ids,i3-m6-go-cli-help,i3-m6-go-report,i3-m6-go-trace-filter,i3-m6-overlay-resolver,i3-m6-deps-prompt,i3-m6-parity-perf,i3-m6-detailed-design-complete,i3-m6-impl-risks-acceptable,i3-m6-internal-quality-ok,i3-m6-verification-green, i3-m6-build, i3-m5-gate]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless. Depends on its subtasks and the prior milestone gate (monotonic).
<<<node: tasks/i3-m6-go-cli-help.md>>>
---
id: i3-m6-go-cli-help
statement: Command surface ported with a shared help preamble: every subcommand answers -h and --help and -? with no side effects, and ids starting with a dash are rejected.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-coverage-ids]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-coverage-ids so the port proceeds in dependency order and survives interruption.
<<<node: tasks/i3-m6-go-coverage-ids.md>>>
---
id: i3-m6-go-coverage-ids
statement: Coverage rules, derived gates, mint_id, and the duplicate-id guard ported to Go.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-engine-core]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-engine-core so the port proceeds in dependency order and survives interruption.
<<<node: tasks/i3-m6-go-engine-core.md>>>
---
id: i3-m6-go-engine-core
statement: Engine core ported to Go: node model, load_all, norm, stmt_hash, full_hash merkle fold, suspect and bless, gate_state.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-parser]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-parser so the port proceeds in dependency order and survives interruption.
<<<node: tasks/i3-m6-go-parser.md>>>
---
id: i3-m6-go-parser
statement: Hand-rolled frontmatter and config.toml parser ported to Go over the trivial subset in use.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-scaffold]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-scaffold so the port proceeds in dependency order and survives interruption.
<<<node: tasks/i3-m6-go-report.md>>>
---
id: i3-m6-go-report
statement: Report shell ported to Go html template with a deterministic server-baked layout and a byte-identical integrity root.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-cli-help]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-cli-help so the port proceeds in dependency order and survives interruption.
<<<node: tasks/i3-m6-go-scaffold.md>>>
---
id: i3-m6-go-scaffold
statement: Go module scaffold and build setup. A quack entrypoint compiles to one static binary and cross-compiles.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-build-planned]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-build-planned so the port proceeds in dependency order and survives interruption.
<<<node: tasks/i3-m6-go-trace-filter.md>>>
---
id: i3-m6-go-trace-filter
statement: Report trace-graph single filter box: iteration expression plus text or regex, AND and OR, on-focus help, client-side breadthfirst relayout.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-report]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-report so the port proceeds in dependency order and survives interruption.
<<<node: tasks/i3-m6-impl-risks-acceptable.md>>>
---
id: i3-m6-impl-risks-acceptable
statement: Implementation risks acceptable.
milestone: M6
class: review
killer: false
depends_on: [i3-m6-parity-perf]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment. Gated behind i3-m5-gate (milestone-monotonic).
<<<node: tasks/i3-m6-internal-quality-ok.md>>>
---
id: i3-m6-internal-quality-ok
statement: Internal quality ok on review.
milestone: M6
class: review
killer: false
depends_on: [i3-m6-parity-perf]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Human judgment. Gated behind i3-m5-gate (milestone-monotonic).
<<<node: tasks/i3-m6-overlay-resolver.md>>>
---
id: i3-m6-overlay-resolver
statement: One vehicle-to-engine overlay resolver; the command surface, guides, report shell, and gather route through it; the engine stays read-only.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-go-trace-filter]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-go-trace-filter so the port proceeds in dependency order and survives interruption.
<<<node: tasks/i3-m6-parity-perf.md>>>
---
id: i3-m6-parity-perf
statement: Golden parity suite over the real spec and rendered report plus a perf harness; writes the evidence markers and the built binary, turning the executed tests green.
milestone: M6
parent: i3-m6-build
class: review
killer: false
depends_on: [i3-m6-deps-prompt]
---

## Rationale (not load-bearing)
M6 build subtask (resumable). Seeded by the build-planned step. Chained after i3-m6-deps-prompt so the port proceeds in dependency order and survives interruption.
<<<node: tasks/i3-m6-verification-green.md>>>
---
id: i3-m6-verification-green
statement: Verification green. The executed tests pass.
milestone: M6
class: executed
killer: true
verify: coverage:tests-pass
depends_on: [i3-m6-build]
---

## Rationale (not load-bearing)
Subtask of milestone M6. Derived from the trace (tests-pass).
<<<node: tasks/i3-m7-acceptance-obtained.md>>>
---
id: i3-m7-acceptance-obtained
statement: Acceptance obtained. Sign-off evidence recorded.
milestone: M7
class: review
killer: false
depends_on: [i3-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment. Gated behind i3-m6-gate (milestone-monotonic).
<<<node: tasks/i3-m7-gate.md>>>
---
id: i3-m7-gate
statement: Milestone M7 (Validate and accept) passed its review.
milestone: M7
class: review
killer: true
depends_on: [i3-m7-acceptance-obtained,i3-m7-meets-need,i3-m7-validation-gaps, i3-m6-gate]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless. Depends on its subtasks and the prior milestone gate (monotonic).
<<<node: tasks/i3-m7-meets-need.md>>>
---
id: i3-m7-meets-need
statement: Meets the need. Validated against ALL needs across every iteration (regression), demonstrated by the success criteria.
milestone: M7
validates: needs
class: review
killer: true
depends_on: [i3-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment. Gated behind i3-m6-gate (milestone-monotonic). Validation
checks every need across all iterations — not just this iteration's — so shipping new work cannot
silently break an old need. (Verification's counterpart is tests-pass, which runs every test globally.)
<<<node: tasks/i3-m7-validation-gaps.md>>>
---
id: i3-m7-validation-gaps
statement: Validation gaps captured as RAID.
milestone: M7
class: review
killer: false
depends_on: [i3-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment. Gated behind i3-m6-gate (milestone-monotonic).
<<<node: tasks/i3-m8-config-baselined.md>>>
---
id: i3-m8-config-baselined
statement: Configuration baselined.
milestone: M8
class: review
killer: false
depends_on: [i3-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment. Gated behind i3-m7-gate (milestone-monotonic).
<<<node: tasks/i3-m8-docs-complete.md>>>
---
id: i3-m8-docs-complete
statement: Docs complete and match the actual surface.
milestone: M8
class: review
killer: true
depends_on: [i3-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment. Gated behind i3-m7-gate (milestone-monotonic).
<<<node: tasks/i3-m8-gate.md>>>
---
id: i3-m8-gate
statement: Milestone M8 (Package and hand over) passed its review.
milestone: M8
class: review
killer: true
depends_on: [i3-m8-config-baselined,i3-m8-docs-complete,i3-m8-handover-accepted,i3-m8-packaged-versioned, i3-m7-gate]
---

## Rationale (not load-bearing)
The milestone GATE. Reviewed in increasing-scrutiny rounds (verify, validate, red-team) before bless. Depends on its subtasks and the prior milestone gate (monotonic).
<<<node: tasks/i3-m8-handover-accepted.md>>>
---
id: i3-m8-handover-accepted
statement: Handover accepted.
milestone: M8
class: review
killer: false
depends_on: [i3-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment. Gated behind i3-m7-gate (milestone-monotonic).
<<<node: tasks/i3-m8-packaged-versioned.md>>>
---
id: i3-m8-packaged-versioned
statement: Packaged and versioned.
milestone: M8
class: review
killer: false
depends_on: [i3-m7-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M8. Human judgment. Gated behind i3-m7-gate (milestone-monotonic).
<<<node: test-binary-deps.md>>>
---
id: test-binary-deps
type: test
statement: A built engine binary exists and is self-contained. It runs from an unzipped folder with no Python, no uv, and no web download.
class: executed
verify: selftest:deps
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Placeholder that stays OPEN until the Go binary is built and vendored under .quack/engine. EXTEND during build to assert no dynamic non-system deps and no network calls.
<<<node: test-cli-help.md>>>
---
id: test-cli-help
type: test
statement: Each subcommand invoked with -h or --help or -? prints usage and makes no state change. An id starting with a dash is rejected.
class: executed
verify: selftest:help
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the shared argument preamble lands and the help test writes HELP_OK.
<<<node: test-dep-prompt.md>>>
---
id: test-dep-prompt
type: test
statement: The dependency-check prompt exists and lists each build dependency with a winget path. A missing-tool path surfaces the prompt to the user.
class: executed
verify: selftest:deps-prompt
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Passes once the dependencies prompt is authored during build.
<<<node: test-integrate.md>>>
---
id: test-integrate
type: test
statement: The engine resolves its rigor/type resources through the overlay chain (not a hardcoded path), and the integrate prompt with a worked example exists.
class: executed
verify: selftest:integrate
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Asserts the resource resolution is overlay-driven (so a vendored vehicle works) and that method/prompts/integrate.md is present. Demonstrated end-to-end by scaffolding a throwaway vehicle and running quack gather against it.
<<<node: test-parity-golden.md>>>
---
id: test-parity-golden
type: test
statement: A golden-output suite runs each command on a fixture vehicle. The Go output matches the Python baseline, including the report determinism root, byte for byte.
class: executed
verify: selftest:parity
suite: standalone
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the parity harness writes PARITY_OK. EXTEND during build to run the real Go-vs-Python golden diff. Covers the hand-rolled parser via parity.
<<<node: test-responsiveness.md>>>
---
id: test-responsiveness
type: test
statement: On the reference machine, each interactive command gives feedback within 1 second (an acknowledgement if the work runs longer), and long tasks report progress at least once per minute.
class: executed
verify: selftest:perf
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the perf harness times the built binary on the reference machine and writes PERF_OK. A latency assertion is timing-sensitive, so the harness measures and records rather than asserting inline here.
<<<node: test-split-readonly.md>>>
---
id: test-split-readonly
type: test
statement: A vehicle run resolves engine and vehicle resources correctly and never writes under the engine directory.
class: executed
verify: selftest:split
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the split lands and the resolver test writes SPLIT_OK. EXTEND during build to assert the overlay chain order and engine read-only.
<<<node: test-trace-filter.md>>>
---
id: test-trace-filter
type: test
statement: The rendered report exposes one filter box that accepts iteration predicates and text-or-regex terms combined with AND and OR, shows help on focus, and re-layouts the visible subgraph on change. The determinism root is unchanged by any filter interaction.
class: executed
verify: selftest:report
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Stays OPEN until the single filter box lands in the report shell. Asserts the box, the regex path, and the client-side relayout. Determinism is covered separately by test-parity-golden over the data root.
<<<node: test-unique-ids.md>>>
---
id: test-unique-ids
type: test
statement: No node id is declared in more than one file across the whole spec. The duplicate-id check is clean.
class: executed
verify: selftest:ids
killer: false
tests_red: exempt - predates the red-observation mechanism (adr-grandfathers-historical)
---

## Rationale (not load-bearing)
M6 executed. Passes now (the i3- prefix removed the collision). Stays green as a structural gate against future id clashes.
