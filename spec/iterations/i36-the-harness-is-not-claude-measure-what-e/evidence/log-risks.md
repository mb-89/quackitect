---
form: log-risks
by: agent
signed_off: 2026-08-19T09:10:04.051Z
reopened: 2026-08-19T09:09:48.135Z — Fresh research and the reported possible MCP stop added one new RAID issue; re-sign the register references.
authors: agent
files: null
---

# Evidence form / log-risks

## current_situation

The refreshed i36 actual state exposes five top risks and issues.

Each has a RAID node under `project/spec/trace/raid`.

Each node passed voice lint individually.

## raid_opened

- project/spec/trace/raid/raid-boot-test-metadata-coupling.md
- project/spec/trace/raid/raid-host-payload-offload-breaks-read-proof.md
- project/spec/trace/raid/raid-failed-tool-calls-stay-local.md
- project/spec/trace/raid/raid-route-remedy-can-repeat-refusal.md
- project/spec/trace/raid/raid-mcp-stop-is-not-diagnosable.md

## follow_up

Use these RAID entries in requirements and implementation planning.

Unfinished runtime fixes remain implementation debt rather than motivation work.

## anything_else

The first attempted brace glob lint matched zero files.

That failed validation call is itself a host/tool-shape signal for i36.
