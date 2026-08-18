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
## Part 6 — five breaks found by arithmetic, not by opinion

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

### BREAK 4 — se_pull's own description is truncated by Claude Code

Claude Code truncates **tool descriptions and server instructions at 2 KB
each**, and its docs say plainly: keep them concise to avoid truncation, and
put critical details near the start.

`se_pull`'s description is **2,425 bytes. It is 377 bytes over, today, on the
harness this system is built for.**

IT IS THE ONE VERB EVERYTHING DEPENDS ON. The description is where `read`,
`fill`, `choose`, `do` and `wait` are explained, and the last 377 bytes of that
explanation have never reached the model on any host. Nothing reported it,
because a silent truncation looks exactly like a description that ends there.

Every other verb is under. `se_run` is next at 1,354.

THIS ONE IS NOT A COPILOT PROBLEM AT ALL, which is why it matters here: the
audit went looking for what breaks on other harnesses and found something
broken on the home one. The limits are per host and nobody was checking any of
them.

### BREAK 5 — AGENTS.md is a third larger than Codex will read

Codex assembles its AGENTS.md chain up to **`project_doc_max_bytes`, default
32 KiB**, and stops once the combined size hits it.

The prompt layer projects **43,008 bytes** into `AGENTS.md`. That is **10,240
bytes over — 31 percent past the cap** — before any nested file is added.

Claude Code has no such cap and reads `CLAUDE.md` whole, though its own docs
warn that files over 200 lines reduce adherence. So the same projection is
complete on one host, cut by a third on another, and neither host says which.

### What these five have in common

NOT ONE OF THEM IS A DESIGN DISAGREEMENT. Every one is a number this
repository already produces, measured against a threshold the host already
documents, and in every case nothing in the tree was comparing the two.

- 2,425 against 2,048
- 21,675 against 20,480
- 27,130 against 20,480
- 43,008 against 32,768
- five tool names against a documented built-in list

THE MISSING MECHANISM IS ONE PREFLIGHT CHECK, not five fixes. Host limits are
data. Put them in a file, measure the tree against them on every run, and fail
loudly. Preflight already exists and already runs in the battery.

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

## Part 9 — can one config format serve everything?

THE OWNER ASKED IT DIRECTLY, and the honest answer is PARTLY, split cleanly
down one line.

### Yes, and it already works with no setting to turn on

VS Code's Copilot chat reads these BY DEFAULT today, in its local agent
harness. No preview flag, no opt-in:

| artifact | setting | default |
| --- | --- | --- |
| `CLAUDE.md` at root, in `.claude/`, in `~/.claude/` | `chat.useClaudeMdFile` | **true** |
| `.claude/rules/*.md`, honouring Claude's `paths:` frontmatter | `chat.instructionsFilesLocations` | **on** |
| `.claude/agents/*.md` | `chat.agentFilesLocations` | **on** |
| `.claude/skills/` | `chat.agentSkillsLocations` | **on** |
| `.mcp.json`, Claude's own project MCP file | — | **on since VS Code 1.118** |

`.mcp.json` IS THE ONE GENUINELY SHARED FILE. Claude Code wrote the format;
VS Code adopted it at 1.118 and Copilot CLI reads it as `.mcp.json` or
`.github/mcp.json`. So the answer for the server entry is yes, and this
repository is already most of the way there — `cage/mcp.json` and
`cage/copilot-mcp-config.json` are BYTE-IDENTICAL DUPLICATES today, and
neither declares a `type`. Add `"type": "stdio"`, keep one file, delete the
other.

### No, for hooks, and that is the half that matters here

`chat.useClaudeHooks` exists. It is **preview, and it defaults to false**.
Turning it on makes VS Code execute the `hooks` block from
`.claude/settings.json`. Then four things bite:

1. **IT CANNOT BE COMMITTED.** The setting is declared
   `disallowConfigurationDefault: true` and `restricted: true`, so it cannot
   be shipped as a workspace default and it requires workspace trust. Every
   person turns it on by hand, or it is off.
2. **MATCHERS ARE SILENTLY IGNORED.** VS Code's own documentation says so:
   hook matchers are parsed and not applied, so every hook runs on every
   event. Measured against this repository's own cage, that is not academic:
   - `PostToolUse` with matcher `WebSearch` fires `se-hook-websearch.ts`
     **after every tool call**, writing a web-search record to the feed for
     calls that were not searches. The log stops being true.
   - The two `SessionStart` entries, matched `startup|resume|clear` and
     `compact|clear`, BOTH fire on every start — so `se-hook-start.ts` runs
     twice and the second one says `--compacted` on a session that was not.
3. **EIGHT EVENTS OF ABOUT THIRTY-ONE.** VS Code maps `SessionStart`,
   `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PreCompact`,
   `SubagentStart`, `SubagentStop` and `Stop`. An unrecognised event key is
   dropped with no warning and no diagnostic.
4. **DUPLICATE FIRING IS A WON'T-FIX.** A hook defined in both
   `.github/hooks/` and `.claude/settings.json` runs twice; VS Code closed
   that as not planned. THIS REPOSITORY HAS EXACTLY THAT SHAPE — `Stop` is
   declared in both. It survives only because `se-hook-stop.ts` carries a
   bites-once valve keyed on `stop_hook_active`. That was written for a
   different reason and it happens to cover this. Nothing else would be so
   lucky.

### And no, for the rest of the cage

`.claude/settings.json`'s NON-HOOK KEYS ARE NOT READ BY VS CODE AT ALL —
`permissions`, `env`, `model`, `outputStyle`, everything. So the deny list
that IS the cage does not apply there, which confirms in GitHub's own code
what `cage/vscode-mcp.json` already suspected from observation: a chat panel
opened by hand is not caged.

`.claude/commands/` and output styles have no cross-tool story at all.

### The rule this settles

ONE FORMAT FOR WHAT IS DECLARATIVE. Instructions, rules, agents, skills and
the MCP server entry are all already shared, and the duplicates in `cage/`
can go.

PER-HOST SHIMS FOR WHAT EXECUTES. Hooks are not portable by a setting. They
need a per-harness adapter, which is the same conclusion the outward scan
reached from the other direction: the one project closest to this design
also ended up with a thin per-harness shim, and there is no way around it.

## Part 10 — the work, in order

EIGHT MILESTONES. The first two are the ones that make everything after them
provable, so they go first even though neither fixes a symptom.

TWO LATER PARTS CHANGED THIS LIST AND IT IS LEFT STANDING RATHER THAN
REWRITTEN, so the change is visible.

- PART 11 PUTS A NEW MILESTONE AT THE FRONT, ahead of M1. The VS Code cage is
  inert, which means rule 1 has been advisory on a host in real use. That is a
  standing assumption failing, not a portability improvement, and it goes
  first.
- PART 13 TURNS M8 FROM A QUESTION INTO A BUILD. The owner ruled on it the
  same day.

### M1 — the lane learns who is calling it

Read `clientInfo` from `initialize`, carry it on the session, and stamp it on
every call-log record beside `se_version`.

DUAL-ERA FROM THE START. The 2026-07-28 spec removed the handshake and moves
client identity into `_meta` on every request, and no tracked client
implements that yet. Read both, prefer whichever arrives.

DONE WHEN: `se_log_query` can group by client, and the harness shows up in the
record. Everything below can then be argued with evidence instead of feel.

### M2 — host limits become data, and preflight checks them

One file of documented per-host thresholds, each with its source and the date
it was read. Preflight measures the tree against the TIGHTEST and fails loudly.

WHAT IT MEASURES: every tool description; every guidance document as it goes on
the wire; the prompt-layer projection per target; the tool count.

DONE WHEN: a document that grows past a host's limit fails the battery on the
commit that grew it, naming the host and the number.

WHY IT IS SECOND AND NOT LAST. Five breaks were found by hand today. A sixth
will arrive the week after this iteration ships, and the only difference that
matters is whether it arrives as a red build or as a bad session nobody can
explain.

### M3 — close the five

- `se_pull`'s description under 2,048 bytes, load-bearing detail first.
- `refusals.md` (21,675) and `craft/software.md` (27,130) split so no document
  crosses 20 KiB on the wire. `retro.md` at 19,460 is the warning.
- The `AGENTS.md` projection under Codex's 32 KiB, or projected per host.
- The Copilot cage re-verified against a live CLI and the blacklist closed.
  `bash` and `rg` are the two that matter. Use the probe command already in
  `copilot-cage.json` and edit from what it prints, never from this document.
- The stop hook's eight-block ceiling on Copilot CLI made known to the engine.

### M4 — one config format for what is declarative

Collapse `cage/mcp.json` and `cage/copilot-mcp-config.json` — they are
byte-identical today. Add `"type": "stdio"`, which is the spelling both
ecosystems accept. Check whether `cage/vscode-mcp.json` is still needed now
that VS Code reads `.mcp.json` natively from 1.118.

DO NOT REACH FOR `chat.useClaudeHooks`. Part 9 says why: it cannot be
committed, it ignores matchers, and this repository's matchers are load-bearing.

### M5 — the matcher hazard is removed rather than documented

Two of this repository's four hook entries do the wrong thing on a host that
ignores matchers, and one of them corrupts the feed. Make each hook script
verify its own trigger from its payload rather than trusting that the matcher
filtered it. A script that checks the tool name itself is correct on every
host, and the matcher becomes an optimisation rather than a guarantee.

### M6 — the conformance statement lands on the interface

Extend `if-agent-harness-to-entrypoint` with what a host must provide. Its
`form` already says `MCP over stdio` and the lane also serves HTTP; its source
already claims both hosts; nothing checks either.

STATE THREE THINGS: which transports are legal, what an answer may weigh, and
what a host must provide for the walk to be ENFORCED rather than ADVISED. The
third is the tier model from Part 1, and it is the honest version of what
`raid-obsidian-and-harness` currently claims.

### M7 — decide what the cloud agent is for

The cloud agent caps a session at 59 minutes and one pull request, over one
repository, on a filesystem it destroys at the end. An iteration is ruled at
roughly a day.

THIS IS A DECISION, NOT A BUILD. Expedition host, single-milestone host, or not
a walk host at all. Record which, and stop.

### M8 — build the installer, because the owner ruled on it

RULED 2026-08-18, and Part 13 carries the words. Install-time generation is
adopted, RUNME carries it, and the pattern is copied from spec-kit or BMAD.

SO THIS IS A BUILD. The agent-agnostic source stays in `project/guidance/`, and
an installer emits each harness's own files from it: the prompt-layer
projection, the MCP entry, the cage in three vocabularies, and the hooks.
`placeProtocol` is already that shape for three targets, so the work is
widening it and moving the trigger into RUNME.

WHAT IS NOT IN QUESTION, and was not even before the ruling: refusals travel as
`isError` results carrying clause and remedy, and `se_pull` is the single-tool
loop. The scan names both as best practice. Adopting an installer changes
neither.

THE VERB COUNT IS RULED TOO, and Part 14 has the arithmetic: eight bundles take
34 to 19.

## Part 11 — the cage question, settled from the code

THE OWNER REMEMBERS A COPILOT RUN THAT WAS NOT CAGED. That memory is right,
and it is worse than the tree admits.

### The CLI is caged. VS Code is not, on either path.

`vscode/extension.js` builds the Copilot CLI command from `copilot-cage.json`
and passes `--excluded-tools` with the CLI's own tool names. THAT PATH IS
CORRECT and the 2026-07-30 probe verified it.

THE CHAT PATH HANDS VS CODE THE WRONG VOCABULARY. `openCopilotInChat` calls
`parseExcludedToolsFromCage(cage)` and passes the result as `toolsExclude` to
`workbench.action.chat.open`. Run for real against the committed cage, that
function returns the **Copilot CLI's** names:

```
powershell read_powershell stop_powershell list_powershell view create edit
grep glob web_fetch sql session_store_sql skill task read_agent list_agents
write_agent fetch_copilot_cli_documentation
```

VS CODE AGENT MODE DOES NOT CALL ITS TOOLS THOSE THINGS. GitHub's own hooks
documentation makes the point in the neighbouring context: Claude Code uses
`Write` and `Edit`, VS Code uses `create_file` and `replace_string_in_file`.
An exclusion list of names a host does not have excludes nothing.

SO BOTH VS CODE PATHS ARE OPEN. Opened by hand, nothing is passed at all —
`vscode-mcp.json` already says so. Opened by the play button, a list is passed
and it matches nothing.

### And the play button prefers the uncaged path

`startAgent` tries `openCopilotInChat` FIRST when the host is Copilot, and only
falls back to the terminal CLI if chat is unavailable. So the DEFAULT Copilot
experience is the one with no cage, and the correctly-caged CLI is the
fallback nobody reaches.

### What the tree currently claims

`cage/vscode-mcp.json` says: "STARTED BY THE PLAY BUTTON - CAGED. The extension
calls workbench.action.chat.open with toolsExclude, built from
copilot-cage.json's exclude_args. Tools are excluded BY NAME, as on the CLI."

THE LAST FIVE WORDS ARE THE BUG. Excluded by name, yes — by the CLI's names, on
a host with different ones. The file then says what to do about it, and it is
still the right instruction:

> VERIFY BEFORE TRUSTING IT … open a session EACH WAY and ask it to list the
> exact names of every tool it can see. Anything that is not an se_ tool is a
> hole.

THAT PROBE HAS NEVER BEEN RUN FOR VS CODE. It was run for the CLI, it caught
three wrong assumptions, and the same class of assumption was then written for
VS Code without running it again.

### Why this outranks everything else in the report

`raid-asm-the-cage-holds-so-every-write-passes-the-lane` is an ASSUMPTION the
whole contract rests on: rule 1 says the lane is the only door. On the host the
owner actually used, the door has been open the whole time, and every native
write and shell command taken there is absent from `.se/calls.jsonl`.

THE CAGE IS ADVISORY ON VS CODE TODAY. That is not a portability nicety. It is
the load-bearing assumption failing on a host in real use, and it moves to the
front of the work.

## Part 12 — the setup, concretely, for Claude and Copilot together

WHAT FOLLOWS IS THE TARGET, not a description of today. Every row says which
it is.

### One file per job, and the job decides who reads it

| what | file | Claude Code | Copilot CLI | VS Code | today |
| --- | --- | --- | --- | --- | --- |
| the server entry | `.mcp.json` at the opened root | reads it | reads it | reads it since 1.118 | **two byte-identical copies, neither declaring `type`** |
| the rules | `CLAUDE.md` at root | reads it | reads it | reads it by default | projected, and 31% over Codex's cap |
| scoped rules | `.claude/rules/*.md` with `paths:` | reads it | no | reads it by default | not used |
| the cage | per host, see below | `.claude/settings.json` | `--excluded-tools` | `toolsExclude` | **VS Code's is inert** |
| hooks | per host, see below | `.claude/settings.json` | `.github/hooks/*.json` | not portable | Stop works on both |

`.mcp.json` IS THE ONE GENUINELY SHARED FILE and it is the easy win. Write it
once at the opened root with `"type": "stdio"`, delete
`cage/copilot-mcp-config.json`, and check whether `cage/vscode-mcp.json` is
still needed at all.

### The cage needs three vocabularies, and that is the whole fix

ONE LIST OF WHAT MUST BE BLOCKED, expressed three ways. Today there is one list
in the Copilot CLI's vocabulary, used verbatim in all three places.

- **Claude Code** — bare tool names in `permissions.deny`. Works today.
- **Copilot CLI** — `--excluded-tools` with CLI names. Works today, and is
  missing `bash` and `rg`.
- **VS Code** — `toolsExclude` with VS CODE's names, which nobody has
  collected. `create_file`, `replace_string_in_file`, `run_in_terminal` and
  the rest.

SO `copilot-cage.json` GROWS A COLUMN rather than being replaced. The blocked
capability is the row; each host's spelling is a cell. That also makes the
"a tool added later is not blocked automatically" rule checkable per host
instead of per file.

AND THE PROBE IS PART OF THE DELIVERABLE, not an afterthought. Each host gets
one: open a session, ask for the exact names of every visible tool, and diff
against the expected set. Anything that is not an `se_` tool is a hole. That
probe is what caught three wrong assumptions on the CLI and what was never run
for VS Code.

### Hooks: Claude-native, with a generated Copilot copy

DO NOT REACH FOR `chat.useClaudeHooks`. Part 9 says why.

WRITE THE HOOKS ONCE IN CLAUDE'S SHAPE, because Copilot CLI already reads
`.claude/settings.json` for the cross-tool subset and honours PascalCase event
names with Claude's payload shape. Generate `.github/hooks/*.json` from the
same source for the surfaces that need it, and be aware that a hook present in
both fires twice — so generate one or the other per host, never both, unless
the script is idempotent the way `se-hook-stop.ts` already is.

AND MAKE EVERY HOOK SCRIPT CHECK ITS OWN TRIGGER. A script that reads the tool
name from its payload is correct on a host that ignores matchers and on one
that honours them. That single change removes the whole matcher hazard and is
smaller than documenting it.

### What the play button should do

TERMINAL CLI FIRST, CHAT SECOND — the reverse of today. The CLI path is the
caged one. Until VS Code's `toolsExclude` is built from VS Code's own
vocabulary and probed, chat is the uncaged path and should not be the default.

## Part 13 — the owner's rulings, 2026-08-18

### RULING 1 — install-time generation is adopted

THE OWNER'S WORDS: fine with install-time generators; RUNME installs the
extension and the generated documents; if RUNME installs the shims depending
on what it finds, and the pattern is copied from spec-kit or BMAD, that is
acceptable.

SO PART 10'S MILESTONE EIGHT IS NO LONGER A QUESTION TO ASK. It is a build.

WHAT THAT SETTLES, and it settles it the way the evidence pointed: the
agent-agnostic source of truth stays in `project/guidance/`, and an installer
emits each harness's own files from it — the prompt layer projection, the MCP
entry, the cage in three vocabularies, and the hooks. `place-prompt-layer.ts`
and `placeProtocol` are already that shape for three targets. The work is
widening them and moving the trigger into RUNME rather than inventing a
mechanism.

READ HOW THE OTHERS DO IT BEFORE WRITING IT. spec-kit keeps neutral content in
`.specify/` and writes into each agent's directory at install time. BMAD
generates from `_bmad/_config/` and moved to installing whole skill
directories verbatim. Neither is an MCP server, and this system does not have
to stop being one to adopt their installer.

### RULING 2 — the verb count comes down

THE OWNER'S WORDS: we should probably reduce the number of verbs; can we bundle
some of them.

YES, AND THE ARITHMETIC IS IN PART 14.

## Part 14 — bundling the verbs, measured

TODAY: **34 verbs**, 19,538 bytes of description, 46,101 bytes of schema.
Cursor's ceiling is 40 across ALL servers, so today one other MCP server with
seven tools puts the agent over it.

EIGHT BUNDLES TAKE 34 TO 19.

| bundle | from | descriptions | note |
| --- | --- | --- | --- |
| `se_file_edit` | write · patch · replace · move · delete | 2,454 B | **406 B over the 2 KB cap — must be trimmed or split** |
| `se_file_find` | list · glob · search | 1,010 B | |
| `se_record` | seed expedition · seed iteration · close expedition | 1,936 B | close to the cap |
| `se_note` | capture · drain · answer | 1,631 B | |
| `se_state` | amend · reopen | 1,307 B | |
| `se_house` | panel · reload · prompt.place | 976 B | |
| `se_prose` | format · lint | 640 B | |
| `se_web` | fetch · search | 227 B | |

KEPT AS THEY ARE, ELEVEN: `se_pull`, `se_aim`, `se_why`, `se_file_read`,
`se_shoot`, `se_run`, `se_test`, `se_git`, `se_survey`, `se_log_query`,
`se_help`.

RESULT: **19 verbs.** Headroom under Cursor's ceiling goes from 6 to 21.

### Three things to hold on to while doing it

THE CAP IS PER TOOL, SO BUNDLING TRADES COUNT FOR LENGTH. `se_file_edit` is
over the 2 KB description cap the moment it is merged, and `se_record` is
close. The bundle is not free and the report should not pretend it is: either
those two get trimmed, or `se_file_edit` splits again along the line that
matters, which is probably whole-file writes against in-place edits.

`se_pull` STAYS ALONE. It is the single-tool loop the outward scan names as
the strongest enforcement shape available, and folding routing or
introspection into it would blur exactly the thing that works.

THE ARGUMENT REPAIR ALREADY PROVES THE SHAPE. The lane repairs a sibling
verb's word and says what it read as what — `query` against `glob` against
`dir` against `path`. Those verbs are already near-siblings arguing about one
argument's name. A discriminated `op` makes that explicit instead of repairing
it after the fact.

## Part 15 — the word "record" goes, and why it keeps coming back

THE OWNER'S OBJECTION, and it is correct: an iteration is not a record. A
record is a passive account of something that already happened. An iteration is
the work itself, in progress, mounted on a machine and being walked. The word
describes the archive it eventually becomes, not the thing it is while it
matters.

### Why it keeps coming back, mechanically

IT IS NOT THAT AGENTS REMEMBER IT. It is that the system TEACHES IT, every
turn, from several places at once. Counted 2026-08-18:

| surface | hits | when the agent meets it |
| --- | --- | --- |
| the trace corpus, 443 files | 1,944 | whenever the trace is read |
| the machines | 204 | in the state guidance riding EVERY pull |
| guidance, all of it | 72 | when a document is served |
| the prompt layer's four sources | 14 | EVERY TURN, verbatim |
| tool descriptions | 8 | at every `tools/list` |

SO NO AMOUNT OF TELLING AN AGENT TO STOP WILL WORK. It reads the word in the
prompt layer before it reads anything else, then again in the guidance the pull
serves it, then again in the state's own text. Asking it not to use a word the
machine uses at it is asking it to disagree with the machine.

THE RENAME IS THE ONLY FIX, and the order matters: the machines and the prompt
layer first, because those are the two that re-teach on every turn. The trace
corpus is the biggest number and the LEAST urgent — it is read occasionally,
not injected constantly.

### What it should be called

RECOMMENDED: **workpiece**. In a shop the workpiece is the thing mounted on the
machine and worked, which is exactly what this is — the system's whole
vocabulary is already machines, states, walks, doors and lanes. It has **zero**
existing occurrences anywhere in the tree, so the rename is mechanically
checkable: when the old word is gone, grep proves it.

NOT "vehicle", THOUGH THE DESK ALREADY USES IT. `front-desk.md` says "SIZE
FIRST, THEN VEHICLE" and means precisely this category. But the word is already
carrying two jobs — i16 is "the vehicle overlay: a vehicle vendors the engine",
where a vehicle is a downstream product embedding the engine. 77 existing hits,
two meanings. Taking it as a third would make the confusion permanent.

SECOND BEST: **undertaking**, also zero hits. It says the right thing about
scope and intent. It is longer, and it does not join the machine metaphor.

### What is NOT renamed, so the sweep does not overreach

- TypeScript's own `Record<K, V>` — **466 of the engine's 796 hits**. Untouched.
- `CallRecord`, `DemandRecord`, `testRecord` — 28 hits, and these are correct.
  A logged call IS a record: it is a passive account of something that
  happened. That is the word doing its real job.

SO THE ENGINE'S REAL EXPOSURE IS ABOUT 300 HITS, not 796. Say so in the
milestone, because a sweep sized at 796 will either be refused as too big or
will damage the type annotations.

## Part 16 — two corrections to Part 14

### se_house was a bad bundle, not just a bad name

THE OWNER DID NOT UNDERSTAND IT, and the reason is that it was wrong on the
merits. It put three verbs together that do two different jobs.

- `se_reload` makes the RUNNING ENGINE take up changed sources.
- `se_prompt_place` makes the PROMPT LAYER take up changed guidance.
- `se_panel` opens the mirror, or points a yellow highlight at a named surface
  for a person to look at.

THE FIRST TWO ARE ONE JOB: the live system picks up what changed on disk. The
third is the human-facing pointer and belongs nowhere near them.

REPLACED BY TWO HONEST BUNDLES:

- **`se_refresh {what: engine | prompt}`** — reload · prompt.place.
- **`se_mirror {op: open | point | shoot}`** — panel · shoot. Both are the
  mirror, and `se_shoot` was standing alone only because nothing else was.

The verb count is unchanged at **19**. The grouping now says what it means.

### The 2 KB cap: the owner is right, and bundling makes it WORSE

BUNDLING AND THE CAP ARE TWO DIFFERENT PROBLEMS AND THIS REPORT RAN THEM
TOGETHER. Stated properly:

- **The cap is PER TOOL.** Merging five verbs into one ADDS their descriptions
  together. Bundling does not reduce description bytes by a single character —
  the total stays at 19,538 whether there are 34 tools or 19. It moves the
  bytes into fewer, bigger buckets, and buckets are what the cap measures.
- **So bundling buys COUNT and costs CAP HEADROOM.** It answers Cursor's 40
  tools across all servers. It makes Claude Code's 2 KB truncation harder to
  satisfy, not easier. `se_file_edit` at 2,454 bytes is that cost arriving.
- **Shortening descriptions is the independent fix**, and it is the one that
  helps everywhere: the cap, the context cost at every `tools/list`, and every
  host's tool budget at once.

### And there is a principled way to shorten, not just "write less"

THE SAME RULES ARE DELIVERED TWICE TODAY. The prompt layer projects 43,008
bytes of contract, walking, lane and voice into `CLAUDE.md` every turn. The
tool descriptions carry 19,538 bytes more. `se_pull`'s 2,425-byte description
re-teaches the whole loop — the five answers, the submit flag, the bless thumb,
what `wait` means. `walking.md` and `lane.md` already teach all of it, counted
across the two:

- `read` 10 hits
- `submit` 7
- `bless` 4
- `fill` 3
- `choose` 2
- `wait` 2

SO THE SPLIT IS AVAILABLE AND IT IS NOT A JUDGEMENT CALL:

- THE TOOL DESCRIPTION says what the arguments are, what the answers are
  called, and what a wrong call gets. It is a schema note.
- THE PROMPT LAYER says how the loop works and why. It is not capped, it is
  not truncated on the home harness, and it already carries this material.

Cutting `se_pull` to a schema note takes it under 2 KB without losing one rule,
because the rules are already somewhere the agent reads every turn. The same
argument covers `se_run` at 1,354, `se_test` at 1,146 and `se_file_read` at
1,095 — between them, over half the description budget.

MEASURE IT AFTERWARDS, ON BOTH AXES. The number that matters is not "shorter";
it is every tool under 2,048 bytes, and the total down enough to be worth the
edit.

## Part 17 — the hooks, answered per surface

TWO QUESTIONS FROM THE OWNER, and the first needs its premise corrected before
it can be answered.

### The model behind the harness does not decide which files are read

RUNNING CLAUDE AS THE MODEL INSIDE COPILOT CHANGES NOTHING ABOUT CONFIG.
Copilot's model picker offers Claude Opus and Sonnet alongside GPT and Gemini,
and the model is what reasons. **The HARNESS is what reads files, spawns hooks
and applies a cage.** Pick Claude inside Copilot and Copilot still reads
Copilot's files, still runs Copilot's hooks, and still ignores what Copilot
ignores.

SO "DOES CLAUDE READ THE CLAUDE SETTINGS" IS NEVER THE QUESTION. The question
is always: which HARNESS is this, and what does it read.

### Question 1 — Copilot CLI and `.claude/settings.json`

**YES, AND THIS ALREADY WORKS TODAY.** Copilot CLI reads
`.claude/settings.json` and `.claude/settings.local.json` for a documented
cross-tool subset, and `hooks` is in that subset. It also accepts PascalCase
event names with Claude's own snake_case payload shape — an explicit Claude
compatibility mode.

`se-hook-stop.ts` already relies on it, and its own comment says so.

### Question 2 — VS Code and `.github/hooks`

**YES, BY DEFAULT.** `chat.useHooks` defaults to **true**, and
`chat.hookFilesLocations` ships with `".github/hooks": true`. So
`.github/hooks/*.json` executes in VS Code with nothing turned on.

THE PREVIEW FLAG IS ONLY FOR THE CLAUDE-FORMAT FILES. `chat.useClaudeHooks`
defaults false and gates `.claude/settings.json` only. Those files are
DISCOVERED either way — VS Code even shows a one-time notice saying Claude
hooks are available — but they do not RUN until it is on.

### So the picture is better than Part 9 implied

| hook source | Claude Code | Copilot CLI | VS Code | Copilot cloud |
| --- | --- | --- | --- | --- |
| `.claude/settings.json` | **runs** | **runs** (cross-tool subset) | discovered, needs the preview flag | not read |
| `.github/hooks/*.json` | not read | **runs** | **runs by default** | **runs — the only source it has** |

PART 9 SAID HOOKS DO NOT PORT. That was too strong and it is corrected here.
The honest statement is narrower: **no single hook file reaches all four
surfaces, but two files reach all four between them**, and both are committable.

### The rule that follows

WRITE THE HOOKS ONCE AND GENERATE BOTH FILES. `.claude/settings.json` for
Claude Code, `.github/hooks/*.json` for the whole Copilot family. That is
exactly the install-time generation the owner ruled on, applied to hooks.

AND MAKE EVERY HOOK SCRIPT IDEMPOTENT, because Copilot CLI reads BOTH and will
fire the same script twice. This is not a risk to design around later — it is
happening now, and `se-hook-stop.ts`'s own comment describes it. It survives
only because that script carries a bites-once valve keyed on `stop_hook_active`.
`se-hook-start.ts` and `se-hook-websearch.ts` carry no such valve.

DO NOT RELY ON MATCHERS IN THE GENERATED FILES. VS Code ignores them, so each
script reads its own trigger from its payload. Part 12 already says this; it is
the same fix, and it is what makes one script safe on four surfaces.

## Part 18 — the token bill, and what caching can and cannot do about it

### First, correct the number this report gave

THIS REPORT SAID 43,008 BYTES AND THE OWNER HEARD 40,000 TOKENS. Bytes are not
tokens. Measured on the wire, 2026-08-18:

| what | bytes | ~tokens | when it is paid |
| --- | ---: | ---: | --- |
| `tools/list` | 68,244 | ~18,000 | position 0, every session |
| the prompt layer | 43,008 | ~11,300 | every turn |
| **the standing prefix** | **111,252** | **~29,300** | |
| boot's four documents | 36,911 | ~9,700 | once per session, and again after every compaction |

SO THE INSTINCT WAS RIGHT AND THE ORDER OF MAGNITUDE IS REAL. It is about
29,000 tokens standing, not 40,000, and not per call — see below.

EVERY TOKEN FIGURE HERE IS AN ESTIMATE at 3.8 bytes per token. The correct
instrument is the API's own `count_tokens`, never a byte ratio and never a
third-party tokenizer. **Step one of this milestone is to replace every number
in this table with a measured one.**

### The good news: it is not paid on every call

PROMPT CACHING IS A PREFIX MATCH over `tools` → `system` → `messages`, and a
cache read costs about **0.1×** base input against a write at 1.25×. So a
stable 29,000-token prefix is paid once at 1.25× and then at a tenth of price
for the rest of the session.

AND THE DOCUMENTS ARE ALREADY IN IT. What the pull serves arrives as tool
results inside `messages`. Once served, a document is part of the conversation
prefix and is cached with the rest of the history. So the owner's question —
can the stuff we read be cached too — is answered YES, and it is already true
in principle.

THE QUESTION IS THEREFORE NOT HOW TO CACHE IT. It is what keeps breaking the
prefix, because a broken prefix means all 29,000 tokens are re-processed at
full price.

### The uncomfortable half: the lever is not ours

WE DO NOT CONTROL `cache_control`. The harness owns the API call and this
system is an MCP server behind it. We cannot place a breakpoint, cannot choose
a 5-minute against a 1-hour TTL, and cannot read `usage.cache_read_input_tokens`
back to see whether any of it worked.

SO THE ONLY LEVER IS SHAPE: make the bytes stable, deterministic and few, and
let the harness's own caching do the rest. Everything below follows from that.

### The single biggest item, and it is 44% of position zero

THE SAME `update` DESCRIPTION IS SHIPPED 34 TIMES. Every verb carries the
narration `update` argument, and its description is 888 bytes of identical
prose repeated once per tool:

- 30,192 bytes of the 46,101 bytes of schema — **65% of all schema**
- **44% of the entire 68,244-byte `tools/list` payload**
- roughly **8,000 tokens**, at position 0, in every session

NOTHING IS GAINED BY THE REPETITION. It is the same paragraph 34 times, and it
renders before anything else in the prompt. Shortening that one string to a
pointer is the cheapest large win in this whole report, and it is bigger than
the entire bundling exercise in Part 14.

### Four things break the prefix, and three of them are ours

1. **THE 20-BLOCK LOOKBACK, and this system is the worst case.** A breakpoint
   walks back at most 20 content blocks looking for a prior entry. A turn that
   adds more than 20 tool_use/tool_result pairs silently misses, and the whole
   history is re-processed. THIS SYSTEM'S LOOP IS pull, do, pull again — one
   turn of the session that wrote this report ran **605 lane calls** between
   two narration updates. Every turn past 20 blocks pays full price for
   everything.
2. **THE TOOL LIST IS DETERMINISTIC BY ACCIDENT, NOT BY TEST.** `tools/list`
   renders at position 0, and a change there invalidates tools, system AND
   messages — the only change that costs everything. Ours is served in Map
   insertion order: stable across runs today, pinned by nothing. A refactor
   that reorders two registrations silently invalidates every session for
   everybody. The 2026-07-28 spec says servers SHOULD return tools in
   deterministic order for exactly this reason. One test closes it.
3. **THE PROMPT LAYER IS HASH-STAMPED AT THE TOP.** Its generated header
   carries the content hash of each of the four sources, so editing any
   guidance file changes bytes at the very front of the projection. That is
   correct behaviour and worth keeping — but it means every guidance edit costs
   one full re-prime for every session afterwards, and that cost should be
   known rather than discovered.
4. **COMPACTION, and this one is not ours.** It rewrites history, so the prefix
   is gone. `boot.md` then re-serves the reading, which is another 36,911 bytes.

### What is already right, and must not be "optimised"

- **`tools/list` DOES NOT VARY BY STATE.** States grant tools at dispatch
  (SE-C-110) and the served list stays whole. Filtering the list per state
  would look like a saving and would invalidate the entire cache at every
  transition. Leave it alone.
- **REFUSALS ARE RESULTS, NOT PROTOCOL ERRORS**, so a refusal costs one block
  rather than restarting anything.
- **`engine/bound.ts`** keeps any single answer under a threshold, so no one
  document floods the window.

### The milestone

1. **MEASURE.** Replace every estimate above using `count_tokens`. Nothing else
   in this section should be acted on before that.
2. **CUT POSITION ZERO.** The repeated `update` description first — 44% of the
   payload, one string. Then the rest of the schema, which is the larger half
   of `tools/list` and which nobody has looked at.
3. **PIN THE TOOL ORDER** with a test, so cache invalidation cannot arrive as a
   side effect of a refactor.
4. **COUNT BLOCKS PER TURN** against the 20-block window. If the loop routinely
   exceeds it — and the 605-call turn says it does — the fix is fewer, larger
   calls, which is the same direction Part 14 already points.
5. **ASK WHETHER THE READING MUST BE RE-SERVED AFTER A COMPACTION**, or whether
   the credit can survive one. This is the only item here that trades against
   correctness, so it is a question rather than a task.

AND ONE STANDING CAUTION. Every number above is about the Claude API's caching
model. Copilot and the other harnesses cache too, and none of them publish the
same mechanics. So the honest scope of this milestone is: make the bytes stable
and few, which helps under every caching scheme, and do not tune for one
vendor's breakpoints when we cannot even set them.

## Part 19 — the skills proposal, evaluated

THE OWNER'S IDEA: package the guidance as skills. The pull stops shipping the
text and instead names the skill to load. The read-proof still runs afterwards.
The tool arguments carry skill references rather than prose.

IT IS THE RIGHT SHAPE, and for a reason beyond tokens. But "cached" is not
quite the mechanism, and the listing is a cost that moves rather than
disappears.

### First, what is already true

WE BUILT PROGRESSIVE DISCLOSURE BY HAND AND CALLED IT `read`. The pull serves
one method document when the walk reaches the state that needs it, proves it,
and serves the next. That IS load-on-demand. The proposal is not a new idea for
this system — it is the harness-native version of a mechanism already here.

AND SKILLS ARE ALSO THE PORTABILITY ANSWER, which is the part that makes this
worth doing even if the token maths were neutral. `SKILL.md` is the one artifact
roughly twenty platforms parse identically. Both install-time generators the
outward scan looked at — spec-kit and BMAD — converged on emitting skills as
their delivery format. So this lines up exactly with the installer already
ruled on in Part 13.

### What "cached" means here, precisely

A SKILL BODY IS NOT A SEPARATE CACHE TIER. When a skill loads, its text becomes
content in the conversation. From then on it is part of the prefix and is cached
exactly like any other history — the same way the documents the pull serves
already are.

SO THE GAIN IS NOT FREE RE-READS. Within a session, a document is served once
either way, because the reading credit already stops it being served twice.
**The gain is that an unused document is never sent at all.**

AND IT DIES IN A COMPACTION LIKE EVERYTHING ELSE. Whether a harness re-surfaces
a skill more cheaply than our re-read is UNKNOWN and must be measured, not
assumed.

### The cost it moves rather than removes

EVERY SKILL'S NAME AND DESCRIPTION SITS IN CONTEXT FROM SESSION START. That is
the whole trick — the listing is always present so the model knows what it can
reach for. A very big skill list is a very big always-present listing.

CLAUDE CODE BUDGETS IT EXPLICITLY: the combined `description` and `when_to_use`
are truncated at **1,536 characters per skill**, with `skillListingMaxDescChars`
and a `skillListingBudgetFraction` over the whole listing.

SO THE DESIGN CONSTRAINT INVERTS. Today the problem is long documents. Under
this proposal the problem becomes long DESCRIPTIONS, and there would be
eighteen of them, permanently resident. Each must be one trigger-shaped line —
enough for the model to know when it needs the thing, and nothing more.

### The split it forces, and this is the genuinely useful part

NOT EVERYTHING CAN BE A SKILL, and the line is sharp:

- **THE ALWAYS-TRUE RULES CANNOT BE.** `contract.md`, `walking.md`,
  `method/lane.md`, `voice.md` — 43,008 bytes — bind BEFORE the agent knows
  what it is doing. A rule that loads on demand is a rule that can be skipped
  by not demanding it. These stay in the prompt layer, and the only lever on
  them is Part 18's: make them shorter.
- **THE SITUATIONAL METHOD IS A PERFECT SKILL.** front-desk, retro,
  cloud-runner, overhaul, tour, machine-authoring, engineering, software, ux.
  Each is read when the walk reaches the state that wants it.

AND THAT SEAM ALREADY EXISTS IN THE CODE. `promptlayer.ts` names exactly four
`PROMPT_SOURCES` as always-on, and everything else is served per state. The
proposal does not introduce the split — it moves the second half onto a
mechanism the harness manages instead of one we hand-roll.

### The read-proof survives, and it is what makes this enforceable

THE SERVER CANNOT MAKE AN AGENT LOAD A SKILL. Naming one in a pull is a
request, and a request is tier C.

BUT THE PROOF DOES NOT CARE HOW THE TEXT ARRIVED. The pull asks for the words
that follow a phrase, and the walk does not advance until they come back
correct. That converts "please load the skill" into "prove you loaded it",
which is the same enforcement standing today.

SO THE MECHANISM SURVIVES THE MOVE INTACT. That is the strongest argument for
the proposal: it changes the delivery and keeps the check.

### What it does NOT fix

**THE 68,244-BYTE `tools/list` IS UNTOUCHED.** Skills carry guidance, not tool
definitions. That half needs the two things Part 18 already named — the
`update` description that is 44% of the payload, and tool search, which Claude
Code already applies by default to defer schemas and which appends rather than
swaps, so it preserves the cache.

DO NOT LET THE SKILLS IDEA CROWD OUT THE SCHEMA WORK. The schema half is
bigger, cheaper and needs no new mechanism.

### Two hard constraints before anyone builds it

1. **SKILLS-OVER-MCP IS NOT SHIPPED.** SEP-2640 is in review on the extensions
   track. Today a lane cannot SERVE a skill: skills are files on disk that the
   harness discovers. So they must be emitted by the installer, which is
   exactly what Part 13 already rules.
2. **THE PATHS DIFFER PER HARNESS.** Claude Code reads `.claude/skills/` and
   NOT `.agents/skills/`. Copilot reads `.github/skills/`, `.claude/skills/`
   and `.agents/skills/`. JetBrains reads none. So the installer emits to
   several paths, and the same fan-out rule applies as everywhere else.

### The recommendation

TRY IT ON ONE DOCUMENT, NOT EIGHTEEN. `front-desk.md` is the natural first: it
is self-contained, purely situational, and the desk already knows exactly when
it is wanted. Convert it, measure the listing cost against the saved body cost
with `count_tokens`, and only then decide about the rest.

MEASURE BEFORE CONVERTING, because the honest summary of this section is that
the proposal trades a large occasional cost for a small permanent one, and
whether that trade wins depends on numbers nobody has yet.
