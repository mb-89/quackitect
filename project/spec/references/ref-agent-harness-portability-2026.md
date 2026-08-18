---
id: ref-agent-harness-portability-2026
kind: reference
statement: How agent harnesses differ in 2026, what the cross-harness standards cover, and how the tools claiming to work everywhere really do it.
scanned: 2026-08-18
scanned_at: the harness-portability audit
---

# Agent harness portability, 2026

WHY IT WAS SCANNED LIVE. Every fact below was checked against primary sources
on 2026-08-18. The field moved twice in the last eight months in ways that
change the design, and a model answering from training data would have got the
MCP spec revision, the Copilot CLI's status and the Agent Plugins standard all
wrong.

CONFIRMED means a primary source says it. UNCERTAIN means one weak source, or
an inference. The distinction is kept because acting on the second kind is how
`copilot-cage.json` was wrong in three ways at once.

## Part A — the standards that now exist

### The governance moved, and that is the headline

THE AGENTIC AI FOUNDATION, a Linux Foundation project, formed **2025-12-09**.
Three founding contributions: **MCP** from Anthropic, **goose** from Block, and
**AGENTS.md** from OpenAI. Platinum members include AWS, Anthropic, Block,
Bloomberg, Cloudflare, Google, Microsoft and OpenAI. CONFIRMED.

WHAT THAT MEANS PRACTICALLY: the three things this system already leans on are
now under one neutral roof, and the roof publishes a division of labour —
Agent Skills carry procedural knowledge, MCP carries the runtime tool
connection, Agent Plugins package them, registries handle discovery, and
**trust, permissions and sandboxing are explicitly the CLIENT's job**.

That last clause is the whole portability problem stated by the standards
bodies themselves. Nothing in any of these standards lets a server enforce
anything.

### MCP is at 2026-07-28, and we are pinned two revisions back

CURRENT SPEC REVISION: **`2026-07-28`**. `engine/mcp.ts` pins
`PROTOCOL_VERSION = "2025-06-18"`. CONFIRMED.

What that revision changed, and each one touches this design:

- **Protocol-level sessions REMOVED** (SEP-2567). The `Mcp-Session-Id` header
  is gone. Servers needing cross-call state use **server-minted handles passed
  as ordinary tool arguments**.
- **The `initialize` handshake REMOVED** (SEP-2575). Version and client
  capabilities ride in `_meta` on every request instead.
- **`server/discover` ADDED, and servers MUST implement it.** It carries an
  optional `instructions` string.
- **Roots, Sampling and Logging DEPRECATED** (SEP-2577), minimum 12-month
  window.
- **HTTP+SSE transport DEPRECATED.** Streamable HTTP or stdio only.
- `tools/list` now wants `ttlMs` and `cacheScope`, and servers SHOULD return
  tools in deterministic order so prompt caches hit.

DO NOT MIGRATE YET, AND THE REASON IS MEASURED. `canimcp.dev` tracks 41 MCP
clients against 34 features. **Zero of 41 are verified as implementing the
2026-07-28 stateless core, and zero as implementing `server/discover`.**
The spec's own compatibility matrix says modern-client to legacy-server and
legacy-client to modern-server both FAIL. So the answer is DUAL-ERA: answer
both `initialize` and `server/discover`, and keep stdio.

### AGENTS.md is a filename convention, not a spec

CONFIRMED, from agents.md itself: "AGENTS.md is just standard Markdown. Use any
headings you like; the agent simply parses the text you provide." There is no
RFC 2119 language anywhere in it and there is no adopter registry.

RESOLUTION RULES ARE PER-HARNESS AND DIFFER MATERIALLY.

- **Codex** walks git root down to cwd, at most one file per directory,
  concatenating — and **stops once the combined size hits
  `project_doc_max_bytes`, default 32 KiB**.
- **Claude Code does NOT read AGENTS.md at all.** It reads `CLAUDE.md` and
  `CLAUDE.local.md`. Several 2026 secondary sources claim otherwise and
  Anthropic's own documentation contradicts them.
- **Amp** reads `AGENTS.md`, `AGENT.md` and `CLAUDE.md` as a fallback, and
  supports `globs` in frontmatter.
- **JetBrains supports neither `AGENTS.md` nor `CLAUDE.md`.**

### Agent Skills, and the path that is not shared

`SKILL.md` in a directory, frontmatter plus markdown body. Introduced by
Anthropic 2025-10-16, published as an open standard 2025-12-18.

**The broad cross-platform path is `.agents/skills/`** — Codex and Gemini CLI
read it, Zed reads it.

**CLAUDE CODE DOES NOT READ `.agents/skills/`.** It reads `.claude/skills/`,
`~/.claude/skills/` and enterprise paths. It follows the FORMAT and not the
shared PATH. CONFIRMED.

Copilot reads `.github/skills/`, **`.claude/skills/`** and `.agents/skills/` —
so Copilot is more permissive here than Claude Code is.

### Agent Plugins 1.0 — twelve days old at the time of scanning

RELEASED **2026-08-06**. Vendor-neutral packaging, initiated by Vercel with
Amazon, Cursor, GitHub, Microsoft and OpenAI; Google joined as a Core
Maintainer on launch day. Launch clients: **ChatGPT, Codex, Cursor, GitHub
Copilot, Kiro, VS Code.** CONFIRMED.

The layout is `plugin.json` plus `skills/`, plus an optional `mcp.json`
carrying `stdio`, `streamable-http` or `sse` servers, plus reverse-DNS
per-client namespaces that clients MUST ignore when unimplemented.

**HOOKS, COMMANDS, AGENTS AND LSP SERVERS ARE EXPLICITLY OUT OF SCOPE IN V1.**
So it packages two of the four things this system needs and says nothing about
the other two. It also has no trust model, no permission system and no
sandboxing, by design.

### ACP solves the other axis, and it is not where this system lives

Agent Client Protocol, Apache-licensed, co-developed by Zed and JetBrains.
**MCP is agent-to-tools. ACP is editor-to-agent.** It is modelled on LSP.

IT CARRIES MCP THROUGH IT: `session/new` takes an `mcpServers` array, and
**stdio is mandatory for all agents** while HTTP and SSE are optional and
capability-gated. An ACP Registry was announced 2026-01-28 with Claude Code,
Codex CLI, GitHub Copilot CLI, OpenCode and Gemini CLI registered.

SO ACP IS NOT A PLACE TO PUT THIS SYSTEM. It is the reason an MCP server keeps
working when somebody runs Codex inside Zed.

## Part B — the hard numbers, per harness

THESE ARE THE DESIGN CONSTRAINTS. Budget against the TIGHTEST, never the
loosest.

| limit | value | harness |
| --- | --- | --- |
| tool description | **2 KB, truncated silently** | Claude Code |
| server `instructions` | **2 KB**, and IGNORED ENTIRELY by Claude Desktop and Claude.ai | Claude Code |
| skill `description` + `when_to_use` | **1,536 chars** | Claude Code |
| tool result | warns at 10,000 tokens, caps at **25,000**, then spills to a file with a ~2 KB preview | Claude Code |
| tool result | **20 KiB**, then a temp file plus a preview | Copilot CLI |
| tool result | 4,000,000 chars | Gemini CLI |
| tools per request | **128 hard, including built-ins** | VS Code |
| tools total, ALL servers | **40** | Cursor |
| AGENTS.md chain | **32 KiB** (`project_doc_max_bytes`) | Codex |
| session | **59 minutes, one PR, one repo, ephemeral FS** | Copilot cloud agent |

A 160,000-token spread separates the tool-result ceilings of two mainstream
harnesses. Any design returning large documents as tool results behaves
completely differently across them.

## Part C — how the tools that claim to work everywhere actually do it

THE ANSWER IS NOT A PROTOCOL. It is **install-time generation of per-harness
files from an agent-agnostic source of truth, driven by a CLI.**

- **GitHub spec-kit** keeps neutral content in `.specify/` and writes command
  files into each agent's own directory at install time. Claims 30+ agents.
  Migrating toward Agent Skills directories. **It is not an MCP server.**
- **BMAD-METHOD** generates from `_bmad/_config/` into each IDE's native
  format, and moved to installing whole skill directories verbatim. **Also not
  an MCP server.**
- **Task Master** ships BOTH an MCP server and a CLI, documents MCP as
  recommended and the CLI as the fallback, and has a known wart where API keys
  do not carry between the two contexts.
- **Goose** makes everything an MCP extension and puts the workflow in a YAML
  recipe. It explicitly leaves multi-agent coordination to the user — a
  deliberate trade of orchestration for portability.
- **Cline and Roo** are file convention only. `.clinerules` and `.roorules` are
  the same markdown; portability is a rename.
- **context-mode** is the closest analogue to this system and uses a two-layer
  model: an MCP server as the portable core, plus **a thin per-harness adapter
  shim** mapping the hooks. There is no way around the shim.

THE TWO HIGHEST-ADOPTION AGENT-AGNOSTIC WORKFLOW SYSTEMS ARE BOTH GENERATORS
AND NEITHER IS AN MCP SERVER. That is the uncomfortable finding and it should
be argued with rather than ignored.

## Part D — what can and cannot be enforced

### Cannot: tool ordering, from the server

CONFIRMED. MCP has no mechanism to force a first call or a sequence. An LLM may
call tools in any order. `tool_choice: "required"` is a client-side control a
server cannot set, and it forces SOME tool rather than a named one.

And from Anthropic's own documentation, which settles the question for the home
harness: "CLAUDE.md content is delivered as a user message after the system
prompt … Claude reads it and tries to follow it, but there's no guarantee of
strict compliance," while "settings rules are enforced by the client regardless
of what Claude decides to do."

SO EVERYTHING ADVISORY IS ADVISORY EVERYWHERE. The only hard gates are the
client's own hooks and permissions, and the server's refusal to do the work.

### Can: refuse the work, and say why in a result

THE ONE PORTABLE ENFORCEMENT PRIMITIVE. An application error returned as a
`result` with `isError: true` is SEEN by the model and can be recovered from. A
JSON-RPC `error` object typically prevents the model from seeing any result at
all.

THIS SYSTEM ALREADY DOES THE RIGHT THING HERE. `engine/mcp.ts` returns
rejections as `isError: true` results with the clause and the remedy in the
body, and the comment beside it says why. That choice ports everywhere.

### Can: the single-tool loop, which is what se_pull already is

The strongest enforcement pattern found in the scan is a server exposing ONE
tool that returns the next step, so there is no wrong tool to call. `se_pull`
is that shape. The 33 other verbs are the part that is not.

### Can: server-minted handles as ordinary tool arguments

AWS published this as the token-messenger pattern on 2025-08-13: every tool
consumes a short-lived server-minted token and emits the next, validated
server-side, with the dependency communicated through **parameter
descriptions** — the one field every client passes to the model verbatim.

The 2026-07-28 spec then made this the blessed way to carry state, since
sessions are gone.

### A caution about folklore

The widely-repeated claim that escalating prompt urgency — "CRITICAL", "do NOT
skip", "your VERY FIRST call" — is simply ignored by agents has **no controlled
experiment behind it** that this scan could find. It has strong face validity
and it is not evidence. This system's guidance uses that register heavily, and
whether it earns its keep is a measurement nobody has made.

## Sources

- https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
- https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/
- https://modelcontextprotocol.io/specification/latest
- https://modelcontextprotocol.io/specification/2026-07-28/changelog
- https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning
- https://modelcontextprotocol.io/specification/2026-07-28/server/discover
- https://modelcontextprotocol.io/community/working-groups/skills-over-mcp
- https://canimcp.dev/
- https://codylindley.github.io/ai-harness-engineering-compatibility-matrix/
- https://agents.md/
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/mcp
- https://code.claude.com/docs/en/skills
- https://learn.chatgpt.com/docs/agent-configuration/agents-md
- https://agentskills.io/
- https://github.com/agentplugins/agent-plugins-spec
- https://aaif.io/blog/from-skills-and-tools-to-portable-agent-plugins
- https://agentclientprotocol.com/
- https://zed.dev/blog/acp-registry
- https://github.com/github/spec-kit
- https://deepwiki.com/bmad-code-org/BMAD-METHOD/2.2-ide-integration-setup
- https://block-goose.mintlify.app/
- https://ampcode.com/manual
- https://github.com/mksglu/context-mode/issues/46
- https://gouthamnekkalapu.com/posts/hooks-across-ecosystems/
- https://aws.amazon.com/blogs/devops/flexibility-to-framework-building-mcp-servers-with-controlled-tool-orchestration
- https://developer.microsoft.com/blog/securing-mcp-a-control-plane-for-agent-tool-execution/
- https://github.com/microsoft/vscode/issues/254933
- https://github.com/cursor/cursor/issues/3369
- https://github.com/anthropics/claude-code/issues/43749
