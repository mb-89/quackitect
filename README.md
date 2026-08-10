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
regresses below convention. See `project/spec/v3-plan.md`.

## Layout

```
RUNME.ps1              the install. Run it once.
project/               THE FOLDER YOU OPEN. Everything being built lives here.
  AGENTS.md            the one rule + the lane table
  .mcp.json            registers the se server
  .claude/settings.json  the cage: explicit deny list of native tools
  deliverable/cage/    the originals those two are placed from
  guidance/            the method layer - contract, voice, authoring/, methods/
  deliverable/         the engine (TypeScript, Node >= 22.6, no build step)
    engine/            mcp transport, tool lane, call log, machine kernel
      bin/             entries: se-mcp (the server), se-manual (the mirror)
    tests/             the lane's laws — node --test "tests/*.test.ts"
  spec/                v3's own record: plan, decisions, iterations
.se/                   machine-local: calls.jsonl — the raw record (gitignored)
```

## Run

```powershell
.\RUNME.ps1           # once: installs the extension and opens the editor
```

After that, open `project/` in VS Code. The extension starts the server, places
the attach configs and installs the engine's dependencies by itself.

## What a change needs before you see it

This used to cost an evening, because nobody could say which restart applied to
which edit. Here is the whole rule.

| you changed | you need |
| --- | --- |
| `project/deliverable/deliverable/brand/palette.css` | nothing. It is read on every render. |
| a machine drawing, guidance, a rigor-matrix row | nothing. They are read live. |
| `project/deliverable/engine/**.ts` | restart the se server. Node caches modules at import, so a correct file on disk means nothing to a process already running. |
| `project/deliverable/vscode/src/extension.ts` | re-run `RUNME.ps1`. |

The last row is the trap. VS Code loads the extension **copy** under
`~/.vscode/extensions`, so reloading the window re-reads that copy and not your
edit. The copy exists because the product's name is rendered into it at install
time; until that rendering moves to activation time, this row stands.

## Give it to someone else

The export makes a fresh copy under a new name, carrying no history.

```powershell
.\RUNME.ps1 --export C:\path\to\empty "Blue Heron" BH
```

All three arguments are required. There is no default, because a forgotten
argument would ship this project's own name to somebody else.

- The folder must be empty, or not exist yet.
- The name is what a person reads on every surface.
- The abbreviation is two or three letters. It becomes the button in the editor.

The copy carries the engine, the machines, the guidance and the workspace.
It starts as a fresh git repository with one commit on `main`.

Four things stay home:

- the git history
- this project's own records in `project/spec`
- the session state in `.se/`
- everything the ignore file already excludes

Then, on the other machine:

```powershell
cd C:\path\to\empty
.\RUNME.ps1
```

**The pull** is the walk operation and `se_pull` the machinery's ONE
verb, legal in every state: the agent says pull and the machine answers
with an instruction — `read`, `fill`, `choose`, `do`, or `wait` — walking
the happy path itself and offering options only where the road splits.
The Mirror's buttons drive the same core by the person's hand.

## The cage (how it blocks)

`project/.claude/settings.json` **denies the current native tools by
name** — Bash, BashOutput, KillShell, Read, Write, Edit, NotebookEdit,
Glob, Grep, WebSearch, WebFetch, Skill (an explicit blacklist by owner
ruling: a tool added in the future is NOT blocked automatically; blocking it
is a deliberate edit to this list). Bare-name deny removes the tool from the
model's context entirely. `mcp__se__*` is allowlisted. Subagents (Task)
stay available and inherit the same denies — they are caged too.

The settings file and `.mcp.json` are GENERATED: edit the templates in
`project/deliverable/cage/`; the extension places them when the window opens (the
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
`project/deliverable/machines/`; owner-authored process machines will live
in `project/spec/` later. **Authoring rules: `project/guidance/authoring/machines.md`** —
notably: file refs are VAULT-relative (the Obsidian vault root is
`project/`), agent-facing fields (`state`, `state_kind`, `legal_tools`,
`guidance`) live in the state note's FRONTMATTER while the body is prose
for humans, and start/terminal states are drawn as pills.

**start and end are MECHANICAL** — every machine has exactly one of each,
sharing the same two notes; the machinery walks out of start and the
machine is done when end activates. **The MAIN machine** (`main.canvas`)
runs every session: `start → boot → idle → end`, where **boot is a
sub-machine** (`boot.canvas`: `start → read_contract → prepare_idle → end`)
and future work states branch from idle. `se_pull` walks it — the whole
happy path per call; the SessionStart hook makes the agent pull
immediately and show the landing banner verbatim; THE STATE GATE makes
the walk inevitable anyway — any pre-idle lane call is refused with
`se_pull` as the remedy (SE-C-110). States carry `legal_tools` (enforced
at dispatch) and SCXML-style enter/leave conditions (SE-C-112 when
unmet), and the pull is never gated.

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
