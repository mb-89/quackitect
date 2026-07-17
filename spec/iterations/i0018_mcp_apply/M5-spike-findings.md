# M5 - Prove the riskiest unknowns (i0018_mcp_apply)

## Riskiest assumptions validated by evidence  -> i18-m5-assumptions  (KILLER - owner adjudicates)
The iteration's riskiest unknown: can a hand-rolled, zero-dependency, stdio MCP server be conformant enough that a REAL client completes the handshake and a tool call? adr-mcp-transport rests on this being true and small. A throwaway spike answered it with evidence, not assertion.

**Verdict: CONFIRMED feasible-and-small. Nothing surprised us.**

- A real MCP client (`claude` CLI 2.1.196) registered the spike binary as a stdio server, performed a live `initialize`, listed the tools, and called them: `echo` -> `hello-from-M5`, `status` -> `ok`. Proof of the real lifecycle, not a mock.
- A deterministic conformance driver (spawns the real binary over pipes) passed ALL 19 assertions - jsonrpc/id echo (numeric and string), protocolVersion echo, capabilities, serverInfo, exactly-2-tools-with-schemas, ok-result shape, unknown-tool isError result listing the tool names, bad-args isError, notification-produces-no-reply, clean EOF exit(0).
- **Cost: 217 lines total, ~180 non-blank, one file, stdlib only, go.mod with zero requires.** The "~200 LOC" estimate that decided adr-mcp-transport was accurate.

## Design is buildable  -> i18-m5-buildable
The spike is the walking skeleton. The M6 build inherits its shape and its ranked conformance list. The attest-once hook was sketched against the real loop: the server process IS the session, so the attested flag is a bool in main's scope closed over by the handlers; read-only tools always run; the first ledger-advancing tool call checks the flag and, if unset, returns the attest challenge AS A TOOL RESULT (not a transport error); the answering `attest` tool flips the flag; it dies with stdin close. No disk, no per-call ledger read. This confirms adr-mcp-attest's per-session model is implementable at one choke point.

## Spike results recorded  -> i18-m5-recorded
The seven conformance subtleties the M6 build must honor, ranked by bite:
1. Notification vs request = PRESENCE of `id`, not its value (absent id = notification, no reply; id:null = a request). Keep id as raw bytes; test length, not zero-value.
2. `id` echoed verbatim, numeric AND string - raw round-trip, no coercion.
3. stdout purity - ALL logging to stderr; one stray stdout write corrupts framing and the client silently disconnects.
4. Tool failures are RESULTS with isError:true; only unknown-method/parse-failure are JSON-RPC errors. Do not conflate.
5. One JSON object per line, newline-terminated, no embedded newlines; Flush after every write or the client blocks.
6. Version negotiation is a pin, not a strict match - echo a version the client understands (2025-06-18).
7. EOF = clean exit(0) within seconds, or zombie processes accumulate under the client.

## Milestone review  -> i18-m5-gate  (KILLER - owner adjudicates)
**Verify:** the assumption was validated against a REAL client plus a 19-assertion conformance harness, with the LOC measured (217) and the subtleties ranked - evidence, not assertion. **Validate:** the spike proves exactly the M4 decision (hand-roll, per-session attest) is buildable and small; nothing forces a revision of the requirements or architecture. **Red-team:** did the spike test the easy path and skip the hard parts? No - it exercised the error-result branch, the notification-no-reply case, string and numeric ids, and clean EOF, which are the conformance traps; the one thing it did NOT do is drive the full quack command surface (that IS the M6 build) or the attest handshake end-to-end (sketched, built at M6). **Verdict: PASS from the agent side** - the riskiest unknown is retired; hand-off for the owner's M5 bless, then M6 builds the real thing.
