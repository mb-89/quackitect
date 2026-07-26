# quackitect v3

A branch of quack — literally: this folder is a linked git worktree of the
`quackitect` repo on the orphan branch `v3` (like v2 before it). `main`
reaches v1, `v2` reaches v2; `se_file_search` with `ref:` searches either.

The agent is caged: its native tools are blocked, and its
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
name** — Bash, BashOutput, KillShell, Read, Write, Edit, NotebookEdit,
Glob, Grep, WebSearch, WebFetch, Skill (an explicit blacklist by owner
ruling: a tool added in the future is NOT blocked automatically; blocking it
is a deliberate edit to this list). Bare-name deny removes the tool from the
model's context entirely. `mcp__se__*` is allowlisted. Subagents (Task)
stay available and inherit the same denies — they are caged too.

The settings file and `.mcp.json` are GENERATED: edit the templates in
`workspace/_cage/`; the RUNME copies them into place on every run (the
generated copies are gitignored).

**Hard dependencies (owner ruling 2026-07-26): ripgrep and git.** The RUNME
installs ripgrep via npm (`@vscode/ripgrep`) and fails red without either —
there is no fallback search engine.

## The lane (11 tools, drop-in or better)

| native | se | better because |
| --- | --- | --- |
| Read | `se_file_read` | CAS hash on every read; oversize reads refused with the paging remedy, never silently truncated |
| Write | `se_file_write` | CAS: `base_hash` must match disk; `null` creates — read-before-write is mechanical |
| Edit | `se_file_patch` | batch ops across many files, ONE atomic call — all guards checked before anything is written |
| — | `se_file_delete` | hash-guarded, no blind removal |
| ls | `se_file_list` | junk dirs excluded |
| Glob | `se_file_glob` | honest truncation flag |
| Grep | `se_file_search` | ripgrep (hard dep); `ref:` searches any committed branch/tag via git grep (main = v1, v2 = v2); logged `intent` feeds the retro |
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

## Machines

Machines are DRAWN — Advanced Canvas files, compiled at load, refused with
the offending element named on any misparse. Engine-owned machines live in
`product/deliverable/machines/` (they are product behavior and ship with the
engine); owner-authored process machines will live in `product/spec/` later.
States are file nodes onto state notes (`machines/states/*.md`: frontmatter
`state / state_kind / filled_by / legal`, first `# heading` is the
statement, `## Guidance` and `## Evidence form` are sections). Edge role
rides `styleAttributes.role`; the edge label is the guard; groups are
geometric; escape edges are never drawn.

**The boot machine** runs every session: `unbooted → idle → done`. Unbooted
locks the lane (`legal: se_boot`); the SessionStart hook makes the agent
boot immediately and show the returned banner to the user; the state gate
makes boot inevitable anyway — any pre-boot call is refused with `se_boot`
as the remedy (SE-C-110). `se_state` is never gated. `se_exit` closes the
session machine.

## Status

- [x] M1a — cage + lane + log: selftests green, live wire verified.
- [x] M1b (first cut) — the boot machine: canvas compiler (v2 grammar,
      ledger-free), state notes, THE STATE GATE wired into dispatch
      (per-state `legal` lists, enforced not advisory), se_boot/se_exit/
      se_state, auto-boot SessionStart hook, banner.
- [ ] M2 — the Mirror: an HTML projection, same renderer as the packet, so
      the owner reads exactly what the agent reads. Next up.
- [ ] Boot guidance — what the agent reads during boot (contract, stance,
      method pointers): to be designed with the owner, served from the
      unbooted/idle state notes.
- [ ] M3+ — work machines (se_next/se_submit against drawn process
      machines), gates/blessing, minimal ledger. Worktrees later.
