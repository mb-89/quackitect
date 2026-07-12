# M1 - Frame the problem & vision (i0018_mcp_apply)

## Vision & scope  -> i18-m1-vision
The engine reaches outward without losing what makes it trustworthy. **In scope:** the MCP server (the command surface as tools an agent discovers and calls directly), `apply` promoted to the default bulk-edit lane in the methods, await console-exit, first-class informed-by edges, honest lint exit codes, the report-refresh debounce, and the keystone - field schemas with their tester. **Out of scope (fenced):** mint-time field defaults and the register UX (they consume the schemas, so they wait for i0020); the "all agent file-IO through apply" generalization (an owner gate, not assumed); Benjamin, pylib, and the arm (parked). The theme: one engine, more faces, same ledger discipline behind every face.

## Problem agreed  -> i18-m1-problem  (KILLER - owner adjudicates)
The delta is real, and it has three strands the record already documents:
- **The agent channel is friction.** Every quack call is a fresh process with a launch tax, and every ledger command crosses a shell-quoting seam (the byte-safe-edit scars, the `--key` plumbing). sebot's own history names the consequence: deterministic tools behind a CLI incantation get skipped, and the agent redoes the work by hand. An MCP surface is how the tools become discoverable and reliably used.
- **Field values are checked by people, not the engine.** The red-team read landed it: the book's registers carry values a reader has to trust; nothing mechanically enforces a field's type, enum, or range. The schema + tester turns "a reviewer vouches" into "the engine refuses" - the same shift the whole project is built on, applied to the last unchecked surface.
- **The mechanical leads burn trust.** The retro measured it: lint exits nonzero on advisory-only output (67 of 80 runs read as failures), a bless fires dozens of duplicate renders (143 in one iteration), a stray await holds the binary against build swaps. Each is a small dishonesty in the tooling that a careful operator learns to distrust.
Worth solving now: MCP is the discoverability the tools have lacked since v0, the schemas are the keystone i0020 is blocked on, and the leads are cheap rungs that pay their cost back every iteration.

## State of the art checked  -> i18-m1-prior-art
Two scans positioned the idea: an adversarially-verified web scan of the MCP protocol and Go tooling, and a read-only mine of the local sebot projects (the owner's prior knowledge-tool attempts). Full findings in NOTE-20260711-184944 (web) and NOTE-20260711-184422 (sebot).

**MCP over stdio is hand-roll-friendly (web scan, 10 claims verified 3-0).**
- Framing is newline-delimited JSON-RPC - no Content-Length headers; a simple line reader/writer suffices. A message must not contain an embedded newline.
- The one hard conformance rule: the server must write nothing to stdout that is not a valid MCP message; stderr is free for logging. For a Go binary this means routing every log line to stderr.
- Lifecycle is a three-step handshake (initialize -> capabilities -> notifications/initialized) with deterministic version negotiation; stdio shutdown has no message - the client closes stdin and the server exits, which matches quack's single-shot model exactly.
- Message directions are restricted (servers never initiate requests) - the server loop stays simple.
- Caution: the newest DRAFT spec removes the handshake into per-request _meta; pin to a stable dated version, do not chase the draft.

**The transport fork is well-evidenced (both scans).** An official modelcontextprotocol/go-sdk exists but is NOT zero-dependency. sebot hand-rolled a working MCP server in ~555 LOC (3 methods: initialize, tools/list, tools/call) on pure stdlib, and it satisfied Claude Code. So hand-rolling stdio to keep the zero-dependency law is proven feasible; adopting the SDK would be the engine's first runtime dependency. The decision is q-mcp-transport, ruled at M3/M4 - not pre-empted here.

**Where this differs / what to take (sebot lessons):**
- AVOID sebot's resident daemon - every hard fix in its server was Windows daemon scar tissue (Smart App Control, ghost discovery files, pid shims, cwd resets, concurrency collisions). sebot chose HTTP+daemon only because its server had to outlive the agent; quack has no such need, so stdio launch-on-demand keeps the single-shot property that sidesteps all of it.
- AVOID bearer-token-in-a-file auth - it authenticates the transport, not the actor. quack's attest/key model is strictly stronger; carry the key as a tool argument, not a header.
- TAKE the one-core-many-faces pattern: MCP tool declarations generated from the same command definitions the CLI reads (no second surface to drift).
- TAKE the schema pattern for req-field-schemas: per-field typed rules, common+per-type merge, field-shape checks separated from referential checks, and a fixture selftest asserting exact issue sets as the contract test. Put field defaults IN the schema (sebot split them into templates and paid to maintain both).
- The motivating lesson (sebot atom 0052): deterministic tools behind a CLI incantation get SKIPPED by the agent, which then redoes the work by hand. Discoverability is the product - which is the whole case for the MCP surface.

**Verdict: the idea is positioned.** MCP-over-stdio is a small, conformant, zero-dependency target; the field-schema system has a proven shape to adapt; the one genuine fork is recorded as an open question for the owner.

## Success is measurable  -> i18-m1-success
Every requirement maps to a named selftest (the seven are already composed: mcp-serve, apply-default-lane, await-console-exit, informed-by-edges, lint-exit-honest, report-debounce, field-schemas). The killer acceptance is behavioral, not structural: a real MCP client drives a status-to-bless walk over the server end-to-end (the M5 spike + the M7 killer-use-case demo), and a planted field-schema violation is caught by `quack lint`, not by a human reader. "The engine refuses" is the measurable bar for both the MCP surface and the schema.

## Top risks logged (RAID)  -> i18-m1-risks
- **R: zero-dep law vs MCP conformance** (q-mcp-transport). Mitigation: the M5 spike proves a hand-rolled stdio server against a real client before committing; the SDK stays the recorded fallback. Owner rules at M4.
- **R: a long-lived server vs staged build swaps.** The build stages a new binary while a server runs; a superseded binary must never answer. Mitigation: stated as an invariant in req-mcp-server; exit-vs-re-exec is a design decision at M6. (sebot's daemon scar tissue is the warning; stdio launch-on-demand is the leading mitigation.)
- **R: schema checks mass-flagging blessed history.** Turning on field enforcement could light up hundreds of old nodes. Mitigation: the grandfathering precedent (explicit exempt markers citing a decision) and a report-only first pass before any gate.
- **A: attest semantics must not drift between the CLI and MCP channels.** The MCP tools enforce the same attest rules as the CLI; the simplification idea rides the M4 ADR, not a silent divergence.
- **I: the MCP×attest simplification** is an open design lead, not a commitment - decided with the transport at M4.

## Milestone review  -> i18-m1-gate  (KILLER - owner adjudicates)
**Verify:** every M1 check names its referent - the two prior-art scans (verified claims + file-path evidence), the composed selftests, the recorded question and RAID. **Validate:** the vision's in/out scope matches the owner's sequencing ruling exactly (i0020 and the generalizations fenced out); the problem's three strands each cite recorded evidence (sebot 0052, the red-team read, the retro measurements). **Red-team:** the sharpest attack - is the MCP surface a feature in search of a need? No: the discoverability problem is documented in sebot's own history (tools behind an incantation get skipped), and the schemas are a hard blocker for i0020, not a nice-to-have. Second attack: the zero-dep law could make MCP conformance painful - carried as q-mcp-transport with an M5 spike gate and an SDK fallback, so the risk is bounded, not open. **Verdict: PASS from the agent side** - hand-off for the owner's M1 bless.
