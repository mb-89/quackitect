# M2 — Requirements (i0024_hygiene)

## inputs captured -> i24-m2-inputs-captured-context

Context: the engine, its MCP surface, and the harness around them. Everything is inside one workspace; the one external contact is the MCP client (Claude Code), probed at M5.

Sources feeding the requirement set:

- Five triaged seed notes:
  - the card defect
  - the walk slip
  - the MCP arming seed
  - the trust gap
  - the spike residue
- Three owner rulings from the 2026-07-15 chat:
  - the query lane
  - the hot reload
  - the statement cleanup
- Two research passes from the compose:
  - the harness capability probe
  - the prior-art scan

Use cases: all eight requirements fold into existing use-cases.

- `uc-lawful-walk`: query, MCP birth, self-arm, reload
- `uc-authoring-guard`: voice
- `uc-verdict-integrity`: root hashing
- `uc-battery-trust`: red-edit guard
- `uc-bless-readout`: delta message

The card class guard verifies existing `req-register-render.2`. No new needs. No new use-cases.

## stakeholder coverage -> i24-m2-stakeholder-coverage-no

Roles touched, from the always-on class set:

- The driving agent: query, apply guard, reload — the whole read/write lane.
- The project owner: hand-off cards, grant collection, voice-clean statements.
- The newcomer: MCP-armed scaffolds with zero hand edits.
- The assessor: a fully hashed root, no silent content edits.

No role is left out: this iteration ships no reader-facing book content (communicator unaffected beyond re-render).

## prior art checked -> i24-m2-prior-art-checked

The M1 scan positioned the idea. The requirement set itself checks out against practice:

- Query: prior graph-query MCP tools confirm filtered rows and a refusal on unknown fields as the standard shape (`req-query.4` mirrors the CLI-help guide).
- Reload: mcpmon's buffer-then-notify sequence confirms `req-mcp-reload.3` (wait for open replies).
- Voice ratchet: standard lint-debt practice is fix-then-gate, exactly `req-voice-zero.2`.
- Root hashing: the i11 evidence-hash fix is the in-repo precedent; `.base` and references close the same class.

Miss found and added by the scan: none open. The scaffold's committed harness approval (from the merged seed) rides `req-mcp-birth.1` as the explicit-path `.mcp.json`.

## Review Verdict -> i24-m2-gate

Verify: eight requirements, each with a test and a use-case edge. The two derived checks (`req-traced`, `req-has-test`) compute live. Every statement is EARS-shaped; lint flags none of them.

Validate: the set covers all five seed notes and all three owner rulings from 2026-07-15. Nothing in the set exceeds the approved plan.

Red-team: the weakest link was visibility, not substance — the prior-art evidence had not been shown to the owner at fill time. Corrected mid-walk: findings and links presented in chat; the show-research law is now baked in engage.md. The voice and root items cite convention and in-repo precedent rather than external research; recorded here as accepted scope, not hidden.

Verdict: pass. Ready for the gate bless.
