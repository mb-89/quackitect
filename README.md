# quackitect v3

A branch of quack. The agent is caged: its native tools are blocked, and its
whole world is the `se` MCP server — every capability it has is one the
engine serves, every call it makes is logged, and (next milestone) every
action it may take is decided by the state machine.

v3 inverts v2's build order: **channel and visibility first, guidance early,
ledger late.** v2's post-mortem in one line: enforcement without guidance
regresses below convention. See `product/spec/v3-plan.md`.

## Layout

```
RUNME.ps1              preflight, selftest, launch the caged agent
workspace/             where the agent runs (cwd of the session)
  AGENTS.md            the one rule + the lane table
  .mcp.json            registers the se server
  .claude/settings.json  the cage: explicit deny list of native tools
product/
  deliverable/         the engine (TypeScript, Node >= 22.6, no build step)
    bin/se-mcp.ts      server entry
    engine/            mcp transport, tool lane, call log, machine kernel
    tests/             the lane's laws — node --test "tests/*.test.ts"
  spec/                plan, decisions, (later) machines and guidance
.se/                   machine-local: calls.jsonl — the raw record (gitignored)
```

## Run

```powershell
.\RUNME.ps1          # preflight + selftests
.\RUNME.ps1 -Agent   # ...then launch Claude Code caged in workspace\
```

## The cage (how it blocks)

`workspace/.claude/settings.json` **denies the current native tools by
name** — Bash, Read, Write, Edit, MultiEdit, NotebookEdit, Glob, Grep,
WebSearch, WebFetch, Skill, SlashCommand (an explicit blacklist by owner
ruling: a tool added in the future is NOT blocked automatically; blocking it
is a deliberate edit to this list). Bare-name deny removes the tool from the
model's context entirely. `mcp__se__*` is allowlisted. Subagents (Task)
stay available and inherit the same denies — they are caged too.

## The lane (11 tools, drop-in or better)

| native | se | better because |
| --- | --- | --- |
| Read | `se_file_read` | CAS hash on every read; oversize reads refused with the paging remedy, never silently truncated |
| Write | `se_file_write` | CAS: `base_hash` must match disk; `null` creates — read-before-write is mechanical |
| Edit | `se_file_patch` | batch ops across many files, ONE atomic call — all guards checked before anything is written |
| — | `se_file_delete` | hash-guarded, no blind removal |
| ls | `se_file_list` | junk dirs excluded |
| Glob | `se_file_glob` | honest truncation flag |
| Grep | `se_file_search` | ripgrep when installed, JS fallback; logged `intent` feeds the retro |
| Bash | `se_run` | full output kept in the call log under a citable ref |
| WebFetch | `se_web_fetch` | HTML→text, paging offsets, declared truncation |
| WebSearch | `se_web_search` | provider-backed (set `SE_BRAVE_API_KEY`); refuses honestly when unconfigured |
| — | `se_log_query` | the agent's own trail is queryable |

Dispatch laws (v2 scar tissue, active from day one): required args enforced
(SE-C-046) and **unknown arg names refused** (SE-C-101) — a wrong argument
name can never again silently coerce to `"undefined"` and answer confidently
on garbage. Every refusal is a typed rejection: clause, expected, got, and
an executable remedy. Every call — result, rejection, error — is appended
raw to `.se/calls.jsonl`.

## Status

- [x] M1a — cage + lane + log (this commit): engine selftests green, live
      wire verified.
- [ ] M1b — the state machine wired to dispatch: `engine/machine.ts` is the
      harvested v2 kernel (edge roles, guards, token joins, sub-machine
      seeding, reopen cones), not yet connected. Next: `se_next`/`se_submit`,
      the per-state legality guard, machine declarations.
- [ ] M2 — the Mirror: an HTML projection, same renderer as the packet, so
      the owner reads exactly what the agent reads. Immediately after M1b.
- [ ] M2b — the canvas compiler (machines are drawn in Obsidian; that is the
      authoring surface) — harvest from v2's `machines/compile.ts`.
- [ ] M3+ — guidance library, gates/blessing, minimal ledger. Worktrees later.
