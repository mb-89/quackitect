---
form: find_prior_art
by: agent
signed_off: 2026-08-19T11:18:05.053Z
authors: agent
files: null
---

# Evidence form / find_prior_art

## current_situation

The function structure and criteria are blessed; M4 enumerate-space now runs its four parallel finders over the clusters this change touched. This is finder 1 of 4, prior art and benchmarking together.

## applies

yes

## options

- opt-mcp-clientinfo-identifies-the-harness
- opt-mcp-cancellation-notification-carries-a-reason
- opt-exit-code-blocks-the-stop-event-until-cleared

## literature

- MCP specification 2025-06-18, Lifecycle: the `initialize` handshake's `clientInfo`/`serverInfo` fields are a named identity exchange — opt-mcp-clientinfo-identifies-the-harness.
- MCP specification 2025-06-18, Cancellation utility: `notifications/cancelled` carries an optional `reason` string — opt-mcp-cancellation-notification-carries-a-reason.

## shipped

- Claude Code's own Stop hook, documented and running today: a blocking exit code on the Stop event prevents the session ending and the conversation continues — opt-exit-code-blocks-the-stop-event-until-cleared. The vendor page names no override ceiling; this project's own live testing found the block stops enforcing after eight consecutive blocks, which is this project's finding rather than the vendor's.

## dry_wells

- cluster-the-record-life's new member, tolerate-old-test-records, turned up no literature and no shipped precedent specifically about CI systems tolerating historical test-record schema drift at boot. Either the problem is genuinely narrow to this project's own append-only test-timings format, or it is filed under a term this search did not try.

## follow_up

The other three finders (contradiction/TRIZ, analogy/heuristic/transform, probing) run next over the same clusters.

## anything_else

