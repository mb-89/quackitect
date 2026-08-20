---
id: ref-agent-harness-portability-2026-08-19
statement: Fresh primary-source findings for iteration 36 harness portability.
scanned: 2026-08-19
---

# Harness portability research addendum

## Decision supported

Iteration 36 needs one research and web path across supported harnesses.

It also needs evidence that distinguishes host cancellation, MCP transport cancellation, server process loss and stop-hook action.

## Query ledger

- `site:modelcontextprotocol.io specification cancellation lifecycle progress logging server restart 2026 MCP`
  - `se_web_search` refused because the Brave key was absent.
- Direct primary-source fetches covered MCP cancellation, MCP progress, MCP Agent Skills, Agent Skills format, VS Code hooks and GitHub Copilot instructions.
- Direct fetches for current Codex and Cursor documentation failed from the server.
- Claude Code hooks returned a page larger than the fetch cap. Its offset was ignored after redirect.

## Source ledger

### Model Context Protocol specification

Source: https://modelcontextprotocol.io/specification/latest

Owner: Model Context Protocol project.

Status: primary.

Proves that the 2026-07-28 specification includes cancellation, progress, error reporting, Tasks and Skills over MCP as distinct capabilities.

### MCP cancellation

Source: https://modelcontextprotocol.io/specification/2026-07-28/basic/utilities/cancellation

Owner: Model Context Protocol project.

Status: primary.

Proves:

- cancellation is optional for ordinary requests
- stdio cancellation uses `notifications/cancelled`
- Streamable HTTP cancellation closes the response stream
- a reason string is optional
- both parties should log reasons
- cancellation does not identify server process exit or restart

### MCP progress

Source: https://modelcontextprotocol.io/specification/2026-07-28/basic/utilities/progress

Owner: Model Context Protocol project.

Status: primary.

Proves that progress is optional and client-requested.

A server may send no progress.

Progress therefore cannot prove liveness by itself.

### Agent Skills specification

Source: https://agentskills.io/specification

Owner: Agent Skills project.

Status: primary.

Proves that a skill is a directory with a required `SKILL.md`.

The file requires `name` and `description` frontmatter.

Optional directories include `scripts`, `references` and `assets`.

### MCP Agent Skills guidance

Source: https://modelcontextprotocol.io/docs/2026-07-28/develop/build-with-agent-skills.md

Owner: Model Context Protocol project.

Status: primary.

Proves that Agent Skills are intended as portable instruction sets.

It recommends distributing `SKILL.md` plus references into each agent's skills location.

### VS Code hooks

Source: https://code.visualstudio.com/docs/copilot/customization/hooks

Owner: Microsoft.

Status: primary.

Proves:

- `.github/hooks/*.json` is a supported hook location
- VS Code can parse Claude Code and Copilot CLI hook configurations
- Claude matcher values are currently ignored by VS Code
- hook diagnostics and output are available through VS Code logs
- the documented default hook timeout is 30 seconds

### GitHub Copilot repository instructions

Source: https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot

Owner: GitHub.

Status: primary but only partially readable in this session because the host offloaded the result.

Proves that GitHub documents repository instruction files and recommends recording validated setup, failure and workaround knowledge.

## Local measurements

- Lane results reported as 8 KB, 9 KB and 10 KB were offloaded by this VS Code host.
- `se_web_search` had no configured Brave key.
- The host tool registry exposed no native web-search tool to this session.
- Direct official URL fetch worked for MCP, Agent Skills, VS Code and GitHub.
- A cancelled pull did not reveal whether the MCP server, transport, host or stop hook ended it.

## Findings

1. MCP cancellation evidence can distinguish an explicit protocol cancellation from silence only when the client sends or records it.
2. Server process lifecycle needs separate instrumentation. MCP cancellation does not provide it.
3. One `se_web_search` verb should select providers behind the lane.
4. Native `WebSearch` must remain outside the cage when the harness exposes it.
5. A project-owned deep-research skill is a valid Agent Skills artifact and should be projected to each supported skill path.
6. The global 60 KB lane answer bound was above the observed host limit.
7. Line paging cannot reconstruct one huge escaped JSON line. Spill recovery needs exact character paging.

## Changes driven by the scan

- `se_web_search` now prefers Brave, falls back to keyless DuckDuckGo HTML and hands off to native search only when server-side providers fail.
- Copilot CLI and VS Code cage paths preserve native web search.
- The lane answer bound is reduced to 6 KB.
- Spill files support exact character paging.
- A canonical deep-research skill projects to `.claude/skills`, `.github/skills` and `.agents/skills`.
- Preflight checks that every projected skill exists and matches its source.

## Unverified

- Current Codex instruction and MCP limits were not freshly fetched.
- Current Cursor MCP, rule and tool limits were not freshly fetched.
- The full Claude Code hooks page was not readable through the current fetch paging behavior.
- The apparent MCP server stop was reported by the owner but not proven by process lifecycle evidence.

These gaps remain named.

They must not be converted into vendor comparisons or architecture claims without another source or a local probe.
