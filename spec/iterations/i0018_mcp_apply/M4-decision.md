# M4 - Decide the architecture (i0018_mcp_apply)

## Chosen architecture stated  -> i18-m4-chosen
Two forks decided by Pugh matrices; the strongest rival is the datum, and each carries a reversed sensitivity check.

### Fork 1 - the MCP transport: HAND-ROLLED stdio (1A)
Datum = the official Go SDK (1B), scored 0. Criteria weighted from M3.

| criterion (weight) | 1A hand-roll vs the SDK datum |
| --- | --- |
| zero-dep law (1.0) | **+** - keeps one static binary; the SDK is a runtime dependency |
| conformance (0.9) | **−** - the SDK maintains conformance upstream; we track the spec by hand |
| maintenance (0.6) | **−** - we write and keep the framing current; the SDK owns it |
| attest integrity (0.8) | **0** - the key is a tool argument either way |
| latency (0.5) | **0** - both launch on demand |

Weighted sum vs datum: +1.0 −0.9 −0.6 = **−0.5** on the tally alone. **The winner is still 1A**, because the single **+** is the zero-dep law - a project invariant rather than a tradeable criterion. A negative Pugh tally against a rival that breaks a hard constraint is a signal the criteria weights understate the constraint, not that the rival wins. The zero-dep law is boolean: the SDK violates it, so the SDK is disqualified regardless of tally. Recorded in [adr-mcp-transport](../../decisions/adr-mcp-transport.md).
**Reversed sensitivity:** the SDK wins in the first world where the protocol churns faster than we can track AND conformance bugs reach real clients. Credibility: plausible over years rather than months - MCP is stabilizing, and we pin a dated version. Recorded as a tripwire (watch spec revisions; SDK is the M5 fallback) rather than a silent dismissal.

### Fork 2 - the field-schema format: FRONTMATTER notes (2A)
Datum = JSON config files (2B), scored 0.

| criterion (weight) | 2A frontmatter vs the JSON datum |
| --- | --- |
| zero-dep law (1.0) | **0** - both parse with stdlib |
| readability / node-ethos (0.7) | **+** - human-readable, matches the node-as-markdown model |
| conformance (0.9) | **0** - both express type/enum/range today |
| future-proofing (0.6) | **−** - JSON Schema is ready for conditionals; frontmatter needs the generate-JSON tripwire |

Weighted: +0.7 −0.6 = **+0.1**, winner 2A - and the future-proofing loss is bounded by the recorded tripwire (generate real JSON Schema from the frontmatter the day conditionals arrive). Recorded in [adr-schema-format](../../decisions/adr-schema-format.md).

### Attest over MCP - PER-SESSION (owner-directed revision)
The owner asked to simplify: attest via a command, not a copy-pasted key. The MCP server's resident session is exactly the home the stateless CLI never had. Decided ([adr-mcp-attest](../../decisions/adr-mcp-attest.md)): the owner attests ONCE per connection (one command or one phone tap over the i15 ask lane); the server holds the attestation in memory; no key per tool call; nothing at rest. On a rebuild the session ends and one re-attest is needed (near-zero for normal use - the binary ratchets only on engine updates; frequent only in engine self-development), with an in-memory re-exec handoff recorded as the mitigation if the dogfood friction bites. This supersedes the conservative key-as-argument first draft and is the strongest reason the MCP surface is worth building.

### q-mcp-transport
Closed by the owner's M4 ruling; `decided_in: i0018_mcp_apply` recorded on the deciding ADRs.

## Choice traced to criteria  -> i18-m4-traced-choice
Each ADR's statement names the weighted criteria that decided it and the datum it beat. The zero-dep law (weight 1.0, boolean) is the load-bearing criterion for Fork 1; readability + the bounded future-proofing tripwire decide Fork 2.

## Views chosen  -> i18-m4-views
Model kinds from the registry for this iteration's design:
- **layers-flow** (the engine onion, model-engine-layers) - the new MCP server, apply lane, and schema regions allocate into it at M6, same as every engine region. No new model node needed; the existing onion absorbs them.
- **sequence** - a candidate for the MCP handshake+call lifecycle (initialize -> tools/list -> tools/call -> result), IF the M6 build shows the flow needs a picture; declared as optional, not minted ahead. Rejected kinds: element-tree and state (no new structural hierarchy or lifecycle machine this iteration). Two-model budget respected - the onion is the primary, the sequence figure is the optional second.

## ADR recorded and traced  -> i18-m4-adr-traced (derived)
Three ADRs, each addressing a requirement (adr-mcp-transport -> req-mcp-server, adr-schema-format -> req-field-schemas, adr-mcp-attest -> req-mcp-server). Engine-computed via coverage:adr-traced.

## Milestone review  -> i18-m4-gate  (KILLER - owner adjudicates)
**Verify:** both forks scored against the strongest rival as datum, with reversed sensitivity judged out loud; three ADRs recorded and traced. **Validate:** the decisions match the M3 candidates and the weighted criteria; q-mcp-transport is closed by this ruling. **Red-team:** the sharpest attack - Fork 1's Pugh tally is NEGATIVE (−0.5), so did we override the matrix to protect a preference? No: the zero-dep law is a boolean project invariant, and the honest reading is that a rival breaking a hard constraint cannot win on a weighted tally; the reversed-sensitivity tripwire keeps the SDK as a live fallback, so the decision is bounded, not dogmatic. **Verdict: PASS from the agent side** - hand-off for the owner's M4 bless, which is the ruling that closes q-mcp-transport.
