# M2 - Requirements (i0018_mcp_apply)

## Inputs captured  -> i18-m2-inputs
The system-in-focus is the quack engine; the environment around it, IN and OUT:
- **The harness client (IN/OUT)** - an AI agent that discovers and calls quack tools over MCP; the new surface.
- **The console (IN/OUT)** - the human at the terminal; the existing CLI, unchanged.
- **The phone relay (IN/OUT)** - the ntfy ask/await lane from i15; unaffected but part of the picture.
- **The workspace as neighbours (IN/OUT)** - other projects the engine drives with `--base`; the MCP server drives a selectable workspace like every other command.
The seven scope notes are the requirement source; the two new use cases (uc-mcp-drive, uc-field-schemas) fold under existing needs (need-workspace-drive, need-engage); the field-schema keystone carries its i0020 fence (mint defaults and register UX out).

## Stakeholder coverage  -> i18-m2-stakeholders
Five roles, none left out:
- **The driving agent** (the MCP client) - needs discoverable, reliably-invoked tools.
- **The adjudicator** at the console - the CLI and the gate discipline stay exactly as they are.
- **The owner** authoring fields - the schemas make filling checkable; the tester guards the schemas themselves.
- **The maintainer** of the zero-dep engine - the transport decision must not silently import a dependency.
- **An external client program** - a non-agent consumer driving quack over MCP (the general case behind uc-mcp-drive).

## Prior art checked (the requirement set)  -> i18-m2-prior-art
M1 scanned the idea; this scans the concrete requirements against best practice.
- **MCP requirements vs the spec.** req-mcp-server's statements map to the verified conformance points: the three-step handshake, tool-list/tool-call schemas, deterministic version negotiation, stdout-purity (all logging to stderr), clean exit on stdin close. The set is complete against the 2025-03-26/06-18 stable revision; the draft's handshake removal is explicitly out (pin a stable version).
- **Error surface (a miss, recorded).** sebot's lesson - errors as data (`isError` result with the available names), never a dead transport - is not yet a statement; recorded here to fold into req-mcp-server at the M2 review (a one-statement add to the cluster), pending the owner's eye.
- **Schema requirements vs sebot.** req-field-schemas matches sebot's proven shape (per-field type/enum/default, common+per-type merge, field-shape checks separate from referential checks, a fixture selftest asserting exact issue sets). One deliberate improvement recorded: defaults live IN the schema, not split into templates (sebot paid to maintain both).
- **Recorded, not added:** per-connection attestation and the MCP x attest simplification stay ADR-scope (M4), not requirements - the requirement binds only "same attest rules as the CLI channel".

## Requirements verifiable / traced  -> i18-m2-req-has-test, i18-m2-req-traced
Derived, engine-computed: every i18 requirement carries a test (the seven selftests, composed) and traces back to a need through its use case. These pass live from the trace; no user stamp.

## Milestone review  -> i18-m2-gate  (KILLER - owner adjudicates)
Finalized at the hand-off, after the derived checks compute green on a clean build.
