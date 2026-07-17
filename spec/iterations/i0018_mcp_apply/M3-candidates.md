# M3 - Candidate architectures (i0018_mcp_apply)

## Alternatives elaborated  -> i18-m3-alternatives  (KILLER - owner adjudicates)
Two open forks, each with real candidates. The transport fork is q-mcp-transport (the owner decides at M4).

### Fork 1 - the MCP transport
**Candidate 1A - hand-rolled JSON-RPC over stdio (zero-dep).**
- The server reads newline-delimited JSON on stdin, writes it on stdout, routes all logging to stderr, implements initialize / tools/list / tools/call, pins a stable dated protocol version.
- Evidence it is small: sebot hand-rolled a working MCP server in ~555 LOC (3 methods) on pure stdlib and it satisfied Claude Code; the framing is line-delimited (no Content-Length), the message directions are restricted (servers never initiate), and quack's single-shot model already matches stdio's stdin-close shutdown.
- Pros: keeps the zero-dependency law intact; small, auditable surface; no supply-chain or vendoring exposure; the engine stays one static binary.
- Cons: protocol conformance is our responsibility; a spec revision is a manual update; no SDK ergonomics (schema helpers, typed handlers).

**Candidate 1B - adopt the official modelcontextprotocol/go-sdk.**

- Depend on the SDK; register tools through its API; it owns framing, lifecycle, and version negotiation.
- Pros: conformance maintained upstream; less code to write; future protocol changes handled for us; typed tool declarations.
- Cons: the engine's FIRST runtime dependency - a direct breach of the zero-dep law that has defined the project since the Go rewrite; dependency weight in a static binary; SDK API churn; vendoring/supply-chain surface. The whole distribution story (one ratcheting static binary) rests on zero deps.

### Fork 2 - the field-schema home and format
**Candidate 2A - frontmatter-keyed schema notes in the method layer (the sebot shape).**
- One `SCHEMA-<type>.md` per node/item type; rules in frontmatter (`required`, `enum_<field>`, `pattern_<field>`, `min_/max_`), a common schema merged with the per-type one; the body is human explanation. A hand-rolled parser reads them (the engine already parses frontmatter).
- Pros: proven end-to-end in sebot; human-readable and diffable; matches quackitect's node-as-markdown ethos; zero-dep parsing; defaults live in the schema (the sebot improvement).
- Cons: frontmatter cannot express conditionals or nesting - the sebot tripwire says the day a rule needs that, generate real JSON Schema from the frontmatter (frontmatter stays the authored source).

**Candidate 2B - JSON schema files in method/config (the config-loader precedent).**

- Schemas as `.json` under `method/config/` beside retired-vocabulary.json and weasel-words.json; possibly real JSON Schema.
- Pros: structured and machine-native. Reuses the existing config lane from i17. JSON Schema is a standard the MCP tool declarations also want.
- Cons: less readable than frontmatter notes. JSON Schema is heavier than today's needs (the tripwire says adopt it only when conditionals arrive). A second schema format to learn.

## Criteria weighted (from the requirements)  -> i18-m3-criteria
Derived from the M2 requirement set, weighted 0..1 by how load-bearing each is to the project's identity:
- **Zero-dependency law preserved - 1.0.** The distribution model (one static ratcheting binary) depends on it; this is the project's spine, not a preference.
- **Protocol / schema conformance - 0.9.** A non-conformant server that a real client rejects fails the killer criterion.
- **Maintenance surface - 0.6.** LOC to write and to keep current against spec drift.
- **Attest integrity across channels - 0.8.** The MCP channel must enforce the same attest rules as the CLI; a transport that complicates that is penalized.
- **Startup + call latency - 0.5.** Launch-on-demand must stay fast; the resident-daemon path is already rejected on other grounds.

## Feasibility rough-checked per candidate  -> i18-m3-feasibility
- **1A (hand-roll):** sized small - a line reader/writer, a 3-method dispatch, a version constant, stderr logging. The one real risk is stdout purity (any stray print breaks the protocol); mitigated by routing every existing print through a stderr-safe path in serve mode. The M5 spike proves it against a real client handshake before commitment.
- **1B (SDK):** feasible technically but sized against the zero-dep law it breaks; the dependency and its transitive weight, plus version-pin maintenance, are the cost. Kept as the recorded fallback if the spike shows hand-rolling is unexpectedly hard.
- **2A (frontmatter schemas):** sized against the existing frontmatter parser - a small merge + per-field check layer, plus the fixture-selftest-as-contract-test. Directly reuses proven machinery.
- **2B (JSON config):** sized against the i17 config loader - also cheap, but adds a format and reaches for JSON Schema before the need (conditionals) exists.

## Milestone review  -> i18-m3-gate  (KILLER - owner adjudicates)
**Verify:** each fork carries >=2 elaborated candidates with pros/cons grounded in the prior-art evidence; the criteria are derived from the M2 requirements and weighted; feasibility is sized per candidate. **Validate:** the forks match the open questions (q-mcp-transport is Fork 1) and the scope (no candidate reaches into i0020). **Red-team:** is the zero-dep weighting (1.0) a thumb on the scale that pre-decides Fork 1? It is a real project invariant, not a bias - but M4's Pugh matrix runs the SDK as a genuine datum and includes the reverse-sensitivity check (the first world where the SDK wins), so the decision is earned, not assumed. **Verdict: PASS from the agent side** - hand-off for the owner's M3 bless. The deciding ADRs come at M4.
