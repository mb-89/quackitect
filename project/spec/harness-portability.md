---
id: harness-portability
statement: What this system asks of its harness, which of those asks Claude Code answers and other harnesses do not, and the work that closes the gap.
scanned: 2026-08-18
---

# Harness portability — what this system asks of its harness

## Who this is for

THIS IS THE BRIEF FOR THE AGENT THAT FIXES ITS OWN HARNESS. It is written to
be read by an agent running under GitHub Copilot, working on the integration
that carries it. Read it whole before designing anything.

## What was done to produce it

- AN INWARD AUDIT of this repository on 2026-08-18: every mechanism, what it
  rests on, and what is already built for hosts other than Claude Code.
- AN OUTWARD SCAN of GitHub's own documentation, changelogs and issue
  trackers, live on the same day, because this field moves faster than any
  model's training data. The scan and its citations stand beside this file in
  `spec/references/ref-agent-harness-portability-2026.md`.
- THREE BREAKS FOUND BY ARITHMETIC, not by opinion. They are in Part 6, and
  each one is a number against a documented threshold.

## The one thing to take from it

THE HARNESS COUPLING IS NOT ONE PROBLEM, IT IS THREE, and they have different
cures. A mechanism resting on a CONFIG SLOT is a file away. One resting on a
HOST FEATURE either exists or does not, and writing does not change it. One
resting on THE AGENT CHOOSING TO COMPLY does not port at all — it varies by
model and it fails silently, which is exactly what "it runs worse" feels like
from outside.

Most of what is already built addresses the first tier. Most of what is left
is in the third.
## Part 1 — every mechanism, and what it actually rests on

THREE TIERS, AND THE TIER IS THE WHOLE STORY. A mechanism that rests on a
CONFIG SLOT ports the moment the host has a slot. One that rests on a HOST
FEATURE ports or does not, and no amount of writing changes it. One that rests
on the AGENT CHOOSING TO COMPLY does not port at all in the sense that matters:
it works better or worse per model, and it degrades silently.

The third tier is where "it runs worse on Copilot" actually lives.

### Tier A — harness config: a file or a flag

| mechanism | what it needs | Claude Code | Copilot CLI | VS Code agent mode |
| --- | --- | --- | --- | --- |
| the se lane is reachable | an MCP server entry | `project/.mcp.json` | `--additional-mcp-config @.copilot/mcp-config.json` | `.vscode/mcp.json` |
| the cage (native tools removed) | tool exclusion BY NAME | `permissions.deny` in settings | `--excluded-tools <names>` | `toolsExclude` on `workbench.action.chat.open` |
| the lane pre-approved | an allow entry | `mcp__se__*` | `--allow-tool se` | not applied when the panel is opened by hand |
| the rules reach the model | an instruction file | `CLAUDE.md` | `AGENTS.md` | `.github/instructions/protocol.instructions.md` |

ALL FOUR ROWS ARE BUILT AND ALL FOUR ARE VERIFIED FOR CLAUDE. The Copilot CLI
column was verified live on 2026-07-30 against CLI 1.0.76, and that probe
corrected three wrong assumptions at once, each of which had read exactly like
the right one. The record of it is `cage/copilot-cage.json`.

### Tier B — harness feature: the host has it or it does not

| mechanism | what it needs | notes |
| --- | --- | --- |
| the arrival is automatic | a SessionStart hook | Claude fires `se-hook-arrive.ts` from the committed root `.claude/settings.json`. This is the ONLY hook a fresh cloud clone can fire, because the cage's own settings file is placed BY the arrival. |
| the unsanctioned stop is refused | a Stop hook | `se-hook-stop.ts`, and it already runs on both: Claude from `.claude/settings.json`, Copilot CLI from `.github/hooks/se-stop.json` naming the PascalCase `Stop` event. One script, one parser. |
| the native web search reaches the feed | a PostToolUse hook | `se-hook-websearch.ts`, Claude only. Where it does not fire, the query never lands in the log and the mirror tells a shorter story than the session did. |
| thinking budget and MCP output budget | env keys the host reads | `MAX_THINKING_TOKENS`, `MAX_MCP_OUTPUT_TOKENS`, `alwaysThinkingEnabled`. Claude-only keys. Nothing equivalent is set anywhere else. |
| the voice | an output style | Claude-only as a style, BUT `voice.md` is also one of the four prompt sources, so the rule reaches every host through the prompt layer. This one is already solved and is worth naming as the pattern to copy. |
| a subagent inherits the cage | subagent inheritance | Claude's subagents inherit the parent deny list. A Copilot subagent is a SEPARATE session that does not inherit `--excluded-tools`, so `task` is excluded there — an uncaged twin is the one hole big enough to walk the whole cage through. |

### Tier C — agent compliance: nothing enforces it

THESE ARE THE ONES THAT DEGRADE QUIETLY, and every one of them is a place
where a different model in a different harness will simply behave differently.

- SE_PULL FIRST, UNASKED. Three files say it — `AGENTS.md`, `kickoff.txt`,
  `vscode-instructions.md` — and all three say it because none of them can
  point at a file the agent cannot open yet. Nothing makes it happen.
- THE READING PROOF. The pull asks for the words that follow a phrase.

  A model that skims fails it. A model that skims and guesses well passes it
  without reading. The proof is evidence, never enforcement.

- THE NARRATION TOLL. `update` must ride the calls that change something, and
  the refusal is real (SE-C-040) — but the CONTENT is the agent's. A toll paid
  with empty briefs is paid.
- SERIAL CALLS. VS Code agent mode appears to cancel its own MCP calls when
  they go out in parallel. The remedy is written in prose in three places and
  the engine cannot enforce it, because the engine sees a cancellation, not a
  cause.
- THE BRIEF SHAPE. One line carrying one thought.

  The refusal reads the shape and cannot read the meaning, so a brief that is
  well formed and says nothing is accepted.
## Part 2 — the measured surface, on 2026-08-18

Numbers, because "it runs worse" is not a finding until something is counted.

| what | size | why it matters |
| --- | --- | --- |
| lane verbs | 34 tools | some hosts cap the tool list, and the cap is per host |
| tool descriptions | 19,538 bytes total | a host that truncates descriptions truncates the contract with them |
| tool schemas | 46,101 bytes total | paid on every `tools/list` |
| the prompt layer | 43,008 bytes, placed 3 times | this is the rules, verbatim, every turn |
| the four prompt sources | contract 10,115 · walking 12,289 · lane 4,973 · voice 16,034 | |
| the guidance corpus | 18 files, 173,012 bytes | what the pull can draw on |
| boot's reading | 4 documents, 36,911 bytes | paid once per session, and again after a compaction |
| a bare `se_pull` answer | 2,310 bytes | the smallest thing the loop does |
| the answer bound | 60,000 bytes | set deliberately UNDER the smallest host limit seen to bite |

THE ANSWER BOUND IS THE ONE PIECE OF PORTABILITY ENGINEERING ALREADY DONE, and
it is the pattern the rest should copy. `engine/bound.ts` holds every answer
under 60,000 bytes, and an oversized answer spills to `.se/answers/` and comes
back as a first page plus a cursor. A host that truncates hands back something
the engine cannot act on. This hands back content AND a way to get the rest.

## Part 3 — the finding that makes all the others measurable

THE ENGINE DOES NOT KNOW WHICH HARNESS IS CALLING IT. Not approximately — at
all. There is no host detection anywhere in the engine, no environment probe,
and no field on the record.

AND IT IS HANDED THE ANSWER ON EVERY CONNECT AND THROWS IT AWAY. MCP's
`initialize` carries `clientInfo: {name, version}`; that is the harness naming
itself. Three things are true at once in `engine/mcp.ts`:

- `TransportRequestMetadata` and `RequestContext` BOTH declare `clientInfo`,
  and `requestContextAdapter` copies it when present (lines 56, 66, 87).
- The `initialize` handler never reads `msg.params.clientInfo` (line 147).
- Both transports call `server.handle(msg)` with NO metadata argument at all
  (lines 273 and 310), so the field is always undefined.

The plumbing exists, and it is dead end to end.

WHAT THAT COSTS. The call log's record is
`{ref, ts, se_version, tool, args, ok, outcome, duration_ms}` — no client
field. So every refusal rate, every failure rate, every slow call and every
agent void in the whole log is pooled across harnesses. "It runs worse on
Copilot" cannot be shown, ranked, or closed out, because nothing in the record
says which one it was.

THIS IS THE FIRST MILESTONE, and it is small. Read `clientInfo` at initialize,
carry it on the session, stamp it on the call record. Every later claim in this
document then has a number behind it instead of an impression.

ONE MORE, FROM THE SAME FILE. `PROTOCOL_VERSION` is pinned at `2025-06-18`.
Whether that is current is an outward question and it is answered in the
reference beside this file.
## Part 4 — what is already built, so nobody rebuilds it

THIS IS NOT A GREENFIELD. Read this part before designing anything.

- `cage/copilot-cage.json` — the Copilot CLI cage AS DATA, verified live
  against CLI 1.0.76 on 2026-07-30. It carries the three corrections that
  probe produced, and each is a trap that reads exactly like the right answer:
  `--deny-tool` does not hide a tool, only gates approval, and accepts four
  kinds only; `--excluded-tools` is the real analogue of Claude's bare-name
  deny; and Copilot does not read a project's `.copilot/mcp-config.json` by
  itself, so the workspace file must be handed over with
  `--additional-mcp-config`. Without that last one the agent had NO se tools.
- `cage/copilot-mcp-config.json`, `cage/mcp-http.json`, `cage/vscode-mcp.json`
  — the server entry in each host's own shape, stdio and HTTP both.
- `cage/vscode-instructions.md` — placed as `.github/copilot-instructions.md`
  by the extension. It already records two observed VS Code behaviours: agent
  mode appears to CANCEL ITS OWN MCP CALLS when they go out in parallel, and
  `activate_file_navigation_and_search_tools` must be called after the first
  pull or `se_file_read` fails in boot.
- `.github/hooks/se-stop.json` — the Stop hook, PascalCase event, already
  firing `se-hook-stop.ts` on Copilot CLI. One script serves both hosts.
- `engine/promptlayer.ts` — the rules are projected VERBATIM into `AGENTS.md`,
  `CLAUDE.md` and `.github/instructions/protocol.instructions.md` at agent
  start. No model stands in that path.
- `engine/bound.ts` — every answer held under 60,000 bytes, with a spill file
  and a cursor rather than a truncation.
- Refusals travel as tool RESULTS with `isError: true`, never as JSON-RPC
  protocol errors, so the clause and its remedy reach the model where it can
  read them. 35 clauses stand in `engine/errors.ts`.
- The VS Code extension launches either host, mapping the cage per host, and
  falls back to a terminal launch when chat mode is unavailable.

## Part 5 — the claim this audit corrects

`raid-obsidian-and-harness` says, of the harness coupling: "a second host has
already been caged, which is what proves the harness coupling is a
CONFIGURATION rather than an ARCHITECTURE."

THAT IS TRUE OF TIER A AND FALSE OF TIERS B AND C. The cage and the server
entry are configuration and they ported. The SessionStart hook, the websearch
hook, the thinking budget and subagent cage inheritance are host FEATURES, and
a host without them cannot be configured into having them. The reading proof,
the pull-first rule and the serial-call rule rest on the agent complying, and
those do not port at all — they vary by model and they fail silently.

The entry is not wrong about what was proven. It is wrong about what that
proof covers. Correcting it is part of this iteration's work, not a separate
errand.
## Part 6 — three breaks found by arithmetic, not by opinion

### BREAK 1 — boot's fourth document does not survive Copilot CLI

Copilot CLI writes any tool output over **20 KiB** to a temp file and hands the
model **a path and a preview** instead of the content
(`COPILOT_LARGE_OUTPUT_THRESHOLD_BYTES` tunes it).

Our answer bound is **60,000 bytes**, chosen under the smallest limit seen to
bite — on Claude. It is nearly three times Copilot CLI's offload threshold, so
the bound never fires there and the host acts first.

Boot's four documents, measured 2026-08-18, as the pull actually serves them
(JSON-escaped, plus the 2,310-byte envelope measured off a bare pull):

| document | raw | on the wire | vs 20 KiB |
| --- | --- | --- | --- |
| `method/boot.md` | 1,465 | 3,822 | under |
| `method/cloud-runner.md` | 9,337 | 11,876 | under |
| `method/front-desk.md` | 7,020 | 9,505 | under |
| `refusals.md` | 18,909 | **21,675** | **OVER** |

SO THE ONE DOCUMENT THAT GETS OFFLOADED IS THE REFUSAL CLAUSES. The model is
then asked to quote three phrases spread through a document it was handed as a
file path. It either opens the file — which boot did not ask for and which the
cage may not permit — or it fails the proof, or it guesses.

THE PROOF IS DESIGNED TO BE UNGUESSABLE, so the honest outcome is a stall in
boot on the most important page in the corpus.

### The break is not one document, it is a class

Every guidance page, measured on the wire the same way, against the same
20 KiB threshold:

| on the wire | page |
| --- | --- |
| **27,130** | `craft/software.md` — **OVER** |
| **21,675** | `refusals.md` — **OVER** |
| 19,460 | `method/retro.md` — within 5% of the line |
| 18,649 | `voice.md` |
| 16,840 | `method/engineering.md` |
| 14,795 | `walking.md` |

TWO PAGES ARE OVER AND A THIRD IS ONE EDIT AWAY. `retro.md` gained a section
on 2026-08-18 and now sits at 19,460 — the next paragraph anybody writes
crosses it, silently, on a host nobody is testing on.

SO THE FIX IS NOT "SHORTEN TWO FILES". It is that nothing measures this, so
the corpus drifts over a host limit without anybody being told. i11 already
built the shape of the answer for the pull; the same discipline has to reach
the reading documents, and the threshold has to be the SMALLEST across hosts
rather than the one Claude happens to have.

### BREAK 2 — the stop hook can be overridden after eight blocks

`se-hook-stop.ts` refuses the unsanctioned stop, and it already fires on both
hosts. But Copilot CLI carries a runaway guard: **after 8 consecutive `block`
continuations the CLI overrides the hook and ends the turn.**

Claude Code has no such counter. So the same script is a hard tooth on one
host and a soft one with a ceiling of eight on the other, and nothing in the
engine knows which it is standing in.

### BREAK 3 — five documented built-in tools are outside the cage

`copilot-cage.json` says it plainly: the blacklist is explicit, so a tool
Copilot adds later is NOT blocked automatically. It was verified against CLI
1.0.76 on 2026-07-30. The CLI went generally available on 2026-02-25 and has
moved since.

Diffed 2026-08-18 against the built-in tool names GitHub's own hooks reference
now lists for matching, five are documented and NOT in our exclude list:

- **`bash`** — an uncaged shell
- **`rg`** — an uncaged search
- `web_search`
- `update_todo`
- `ask_user`

`--deny-tool shell` does not close it. Per GitHub's docs that flag decides
whether a call needs APPROVAL, and an approval prompt in an unattended run is
a stall, not a cage. The first two are the ones that matter: they are the whole
lane, available beside the lane, unlogged.

RE-VERIFY RATHER THAN PATCH BLIND. `copilot-cage.json` carries the exact probe
command for this. Run it, diff the output, and edit the list from what a live
CLI actually shows — that is how the last three wrong assumptions were caught.

## Part 7 — the structural mismatch, which is bigger than any of the breaks

THE THREE COPILOT SURFACES ARE NOT ONE TARGET AND MUST NOT BE PLANNED AS ONE.
They differ more from each other than Copilot CLI differs from Claude Code.

### The cloud agent cannot walk an iteration, and no amount of fixing changes it

`craft/software.md` line 485 is the law: "An expedition and an iteration are
each worth ROUGHLY A DAY of agent work."

GitHub's documented limits on the cloud agent, confirmed 2026-08-18:

- **59 minutes maximum execution time**, hard.
- **Exactly one pull request per session.**
- **One repository**, no cross-repo changes.
- **An ephemeral filesystem**, destroyed at job end.

THE LAST ONE IS THE FATAL ONE AND IT IS NOT ABOUT TIME. The whole walk lives
in `.se/`:

- the reading credit
- the decision graph
- the call log
- the position in the machine

A host that destroys the working directory at job end destroys the walk's
memory, so a record cannot be resumed. It can only be restarted.

SO THE CLOUD AGENT IS AN EXPEDITION HOST AT BEST, and possibly only a
single-milestone host. Deciding which is work for this iteration. Planning to
run a full record there is planning against a documented wall.

### The CLI is the target, and it is a superset in places

Copilot CLI went generally available on 2026-02-25 and is becoming the engine
under JetBrains and Visual Studio as well. It reads `.mcp.json` — the same
filename Claude Code uses — honours `.github/copilot/settings.json` as a
committed settings layer, loads `.claude/skills/` directly, and ships **14
hook events with an explicit Claude-compatible PascalCase mode** whose payload
is the same snake_case shape Claude sends.

THAT COMPATIBILITY MODE IS THE STRONGEST SIGNAL IN THE WHOLE SCAN, and this
repository is already using it without having named it: `.github/hooks/se-stop.json`
declares the PascalCase `Stop` event, and that is why one script serves both
hosts.

### JetBrains is the one that fails silently

Per GitHub's own support matrix, JetBrains agent mode supports repository-wide
instructions and prompt files ONLY. It does not read `AGENTS.md`, `CLAUDE.md`
or path-scoped `.instructions.md`.

SO THE ENTIRE PROMPT LAYER LANDS NOWHERE THERE, and nothing says so. The agent
simply has none of the rules and behaves like an agent that was never told
them — which is indistinguishable, from outside, from a model that is worse.

That is the shape of "it runs worse in another harness" in its purest form,
and it is the argument for Part 3's first milestone: until the lane knows who
is calling it, this case and a genuinely weaker model produce the same log.

## Part 8 — where this belongs in the trace, so it is not invented twice

THE NODE ALREADY EXISTS. `if-agent-harness-to-entrypoint`, minted in i33, is
the seam between the driving agent and the engine — "the busiest outside edge
in the product, and the one every other agent-facing claim rests on."

READ WHAT IT CURRENTLY DECLARES, because two of its own fields are where this
work lands:

- `form: MCP over stdio`. The lane also serves HTTP at `/mcp` when headless,
  and VS Code attaches over exactly that. The form is already two and the node
  says one.
- `bound: 1 second`, with 1,834 of 8,424 calls over it as of 2026-08-17.

AND ITS SOURCE IS THE HOST ITSELF. `nbr-agent-harness` states outright: "Claude
Code or the Copilot CLI, whichever is installed." So the trace ALREADY claims
this edge serves both hosts, and nothing anywhere checks that it does.

THAT IS THE HOME FOR THE PORTABILITY CONTRACT. Not a new subsystem and not a
second lane — a conformance statement on the interface that already owns the
crossing, saying what an answer may weigh, which transports are legal, and
what a host must provide for the walk to be enforceable rather than advisory.

TWO NEIGHBOURING RECORDS TOUCH THIS AND NEITHER CLAIMS IT.

- **i9**, seeded, moves `.se` into the product folder. The cloud agent's
  ephemeral filesystem is a fact about `.se` and about nothing else, so
  whoever walks i9 should know Part 7 exists. It is not a dependency, because
  neither blocks the other, but the two answers must agree.
- **i16**, seeded, is the vehicle overlay — one resolution chain for guidance
  and method. A per-host projection of the prompt layer is the same shape of
  problem, and building both without reading either is how two resolution
  chains end up in one product.
