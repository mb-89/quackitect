# L3 - Design · i0020_cold_run_fixes

## Approach per design-bearing fix  → i20-m3-approach

**1. Shim home** - options:

- (a) `product/tools/go.cmd` (dependencies.md's documented path; vendors into vehicles naturally as `tools/vendor/tools/`)
- (b) `.quack/tools` (what quack.cmd's PATH line points at today; nothing ships there)
- (c) write the shim at scaffold time

**Chosen: (a)** - ship ONE shim in the repo at `product/tools/go.cmd`. The dogfood launcher appends `product\tools`, scaffolded launchers append `tools\vendor\tools`. Docs were right, the launcher was wrong - the fix makes reality match dependencies.md. ADR: [[adr-shim-product-tools]].

**2. Edges default** - options: (a) flip the engine's global default to connections (DANGER: legacy workspaces without an `edges` key silently flip lanes and the strict parser refuses their frontmatter edges), (b) scaffold-time default only. **Chosen: (b)** - `start init` writes `edges = "connections"` exactly as `start stubs` already does. The engine's global default stays `frontmatter` for legacy compatibility. Compose-reference says plainly: JSONL connections is the lane for NEW work, frontmatter is the legacy lane pending `migrate-edges`. ADR: [[adr-scaffold-edges-connections]].

**3. Template examples** - options:

- (a) drop the trace-entering `ex-*` nodes from the stub template
- (b) engine-side exclusion of example ids from coverage/strict graph
- (c) commented-out examples

**Chosen: (a)** - drop from the template:

- the `ex-need`, `ex-usecase`, `ex-criterion` and `ex-rationale` nodes
- the example connections (`refers` ex-line, `conflicts-with` example)

Keep inert non-trace examples only if they enter no graph. (b) would teach the engine to ignore ids by prefix - a hack that could mask real nodes.

**4. Seed shape** - options: (a) full checklist seeding at `start` (moderate engine feature), (b) explicit defer. **Chosen: (b) defer to i0021_field_ux** - thematically it IS that iteration ("filling quackitect becomes vetoing, not authoring"). A rushed generator today risks the working-tomorrow goal. Recorded as the explicit defer the checklist step allows.

**5. Vehicle-misuse guard** - `quack lint` warns when the workspace is a VEHICLE (engine resolves through `tools/vendor/`) AND `spec/iterations/` holds iterations AND `product/` is effectively empty - the exact signature of composing a driven project inside the vehicle's spec. Plus one warning sentence in integrate.md's bootstrap flow. No options worth weighing - it is the cheapest lint that catches the observed failure.

**6. defer/retire port** - options:

- (a) full move-a-check-across-iterations semantics
- (b) minimal status-stamp port: `quack defer <id> --reason` / `quack retire <id> --reason` stamp the task frontmatter (`deferred:`/`retired:` + reason), and `next`/board/ready exclude stamped checks honestly (counted separately, never DONE)

**Chosen: (b)** - self-contained and honest. It unblocks the documented reaches. The cross-iteration move can come with i0021.

**7. NFR convention (owner ruling, this session)** - canonize in compose-reference: reserve a **qualities need**. Its **use-cases are the ISO/IEC 25010 quality characteristics**. Quality requirements refine those use-cases. Keeps `req-traced` exact with zero engine change. Documentation only.

## ADRs traced  → i20-m3-adr-traced (derived)
Two ADRs minted, each addressing an existing requirement: [[adr-shim-product-tools]] -> req-go-port; [[adr-scaffold-edges-connections]] -> req-connections-lanes. Decisions 3-7 are implementation choices under existing contracts - recorded here, no ADR node.

**Verdict:** approach set for all eight steps (one explicit defer). Gate blessed actor=agent per the owner's L2/L3 authorization.
