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
.\RUNME.ps1           # preflight, deps, cage install, selftests, launch the caged agent
.\RUNME.ps1 -Manual   # ...or open the MIRROR and walk the machines yourself, tick by tick
```

**The tick** is the universal walk operation: tick without arguments =
information about where the machine is; tick with arguments = complete the
current state and move on. The agent (se_boot/se_exit), the manual Mirror
buttons, and `POST /tick` on the manual server all drive the same core.

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
`product/deliverable/machines/`; owner-authored process machines will live
in `product/spec/` later. **Authoring rules: `machines/CANVAS-GUIDE.md`** —
notably: file refs are VAULT-relative (the Obsidian vault root is
`product/`), agent-facing fields (`state`, `state_kind`, `legal_tools`,
`guidance`) live in the state note's FRONTMATTER while the body is prose
for humans, and start/terminal states are drawn as pills.

**start and end are MECHANICAL** — every machine has exactly one of each,
sharing the same two notes; the machinery walks out of start and the
machine is done when end activates. **The MAIN machine** (`main.canvas`)
runs every session: `start → boot → idle → end`, where **boot is a
sub-machine** (`boot.canvas`: `start → read_contract → prepare_idle → end`)
and future work states branch from idle. `se_boot` drives the sequence one step per call;
the SessionStart hook makes the agent boot immediately and show the booted
banner to the user; THE STATE GATE makes boot inevitable anyway — any
pre-boot call is refused with `se_boot` as the remedy (SE-C-110). Each
state's `legal_tools` list is enforced at dispatch; `se_state` is never
gated; `se_exit` closes the session from idle.

## Status

- [x] M1a — cage + lane + log: selftests green, live wire verified.
- [x] M1b — the main machine: canvas compiler (v2 grammar, ledger-free,
      vault-relative refs), boot as a sub-machine with stepwise se_boot,
      THE STATE GATE wired into dispatch (per-state `legal_tools`, enforced
      not advisory), auto-boot SessionStart hook, banner, CANVAS-GUIDE.
- [x] M2 (first cut) — the Mirror in manual mode: RUNME -Manual serves the
      drawn machines as HTML (live position highlighted, the packet shown
      verbatim — one source, two projections) with tick·info / tick·advance
      buttons; manual ticks land in the call log.
- [ ] Boot guidance — what the agent reads during read_contract (contract,
      voice, stance) and what prepare_idle actually checks: to be designed
      with the owner.
- [ ] M3+ — work machines (se_next/se_submit against drawn process
      machines), gates/blessing, minimal ledger. Worktrees later.
