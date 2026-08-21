# quackitect v3

A branch of quack — literally: this folder is the `quackitect` repo checked
out on the orphan branch `v3` (like v2 before it). `main` reaches v1, `v2`
reaches v2; `se_file_search` with `ref:` searches either.

The agent is caged: its native tools are blocked, and its
whole world is the `se` MCP server — every capability it has is one the
engine serves, every call it makes is logged, and (next milestone) every
action it may take is decided by the state machine.

v3 inverts v2's build order: **channel and visibility first, guidance early,
the record-keeping layer last.** v2's post-mortem in one line: enforcement
without guidance regresses below convention. See `spec/v3-plan.md`.

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

## On a machine nobody is watching

A cloud box gets there in one command, and usually without being asked — the
repository's own `.claude/settings.json` fires it when a session starts.

```bash
node deliverable/engine/bin/se-arrive.ts --autonomy 0.6
```

It fetches the branches the records cite, checks the runtime against the pin,
installs, places the cage, starts the server, and writes `.se/se-call.mjs` so an
agent with no tools of its own can still call it. Running it twice changes
nothing. `SE_NO_ARRIVE=1` turns it off on a machine where the editor is in
charge.

The card for the agent that lands there is `guidance/method/cloud-runner.md`.

## What a change needs before you see it

This used to cost an evening, because nobody could say which restart applied to
which edit. Here is the whole rule.

| you changed | you need |
| --- | --- |
| `deliverable/brand/palette.css` | nothing. It is read on every render. |
| a machine drawing, guidance, a rigor-matrix row | nothing. They are read live. |
| `deliverable/engine/**.ts` | restart the se server. Node caches modules at import, so a correct file on disk means nothing to a process already running. |
| `deliverable/vscode/src/extension.ts` | re-run `RUNME.ps1`. |

The last row is the trap. VS Code loads the extension **copy** under
`~/.vscode/extensions`, so reloading the window re-reads that copy and not your
edit. The copy exists because the product's name is rendered into it at install
time; until that rendering moves to activation time, this row stands.

## Give it to someone else

Open the command palette and run **Create a Vehicle**.

It asks for three things:

- An empty folder to make it in, or one that does not exist yet.
- The name, which is what a person reads on every surface.
- A short name of two or three letters, which becomes the button in the editor.

All three are required. There is no default, because a forgotten argument would
ship this project's own name to somebody else.

The copy carries the engine, the machines, the guidance and the workspace. It
starts as a fresh git repository with one commit on `main`, and it records the
identity it came from. It can reach this repository by no mechanism at all.

When it is made, it opens in a new window. This one is left as you left it.

## Start a project it drives

Open the command palette and run **Create a Project**.

The work lives in its own tree, carrying none of the method. One small file in
it says which copy drives it, by identity rather than by location, so moving
either tree changes nothing.

Four things stay home:

- the git history
- this project's own records in `spec`
- the session state in `.se/`
- everything the ignore file already excludes

A DRIVEN PROJECT CARRIES NO INSTALLER. It is a plain work tree. The copy that
drives it is where the method and the machinery live, and that is the tree you
run `RUNME.ps1` in.

## The pull

**The pull** is the walk operation and `se_pull` the machinery's ONE
verb, legal in every state: the agent says pull and the machine answers
with an instruction — `read`, `fill`, `do`, or `wait` — walking the happy
path itself and offering options only where the road splits.
The Mirror's buttons drive the same core by the person's hand.

## The cage (how it blocks)

`.claude/settings.json` **denies the current native tools by
name** — Bash, BashOutput, KillShell, Read, Write, Edit, NotebookEdit,
Glob, Grep, WebSearch, WebFetch, Skill (an explicit blacklist by owner
ruling: a tool added in the future is NOT blocked automatically; blocking it
is a deliberate edit to this list). Bare-name deny removes the tool from the
model's context entirely. `mcp__se__*` is allowlisted. Subagents (Task)
stay available and inherit the same denies — they are caged too.

The settings file and `.mcp.json` are GENERATED: edit the templates in
`deliverable/cage/`; the extension places them when the window opens (the
generated copies are gitignored).

**Hard dependencies (owner ruling 2026-07-26): ripgrep and git.** The RUNME
installs ripgrep via npm (`@vscode/ripgrep`) and fails red without either —
there is no fallback search engine.

## The lane (38 tools; the twelve below are the drop-in replacements)

| native | se | better because |
| --- | --- | --- |
| Read | `se_file_read` | CAS hash on every read; oversize reads refused with the paging remedy, never silently truncated |
| Write | `se_file_write` | CAS: `base_hash` must match disk; `null` creates — read-before-write is mechanical |
| Edit | `se_file_patch` | batch ops across many files, ONE atomic call — all guards checked before anything is written |
| — | `se_file_delete` | hash-guarded, no blind removal |
| ls | `se_file_list` | junk dirs excluded |
| Glob | `se_file_glob` | honest truncation flag |
| Grep | `se_file_search` | ripgrep (hard dep); `ref:` searches any committed branch/tag via git grep (main = v1, v2 = v2); the logged `intent` is reviewed in the periodic look-back |
| Bash | `se_run` | full output kept in the call log under a citable ref |
| `npm test` | `se_test` | structured and durable; a scoped run must state the QUESTION it answers, and the verdict records it beside the scope |
| WebFetch | `se_web_fetch` | HTML→text, paging offsets, declared truncation |
| WebSearch | `se_web_search` | provider-backed (set `SE_BRAVE_API_KEY`); refuses honestly when unconfigured |
| — | `se_log_query` | the agent's own trail is queryable |

Dispatch laws (v2 scar tissue, active from day one): a call missing a
required argument is refused, and so is one carrying an argument name the
tool does not know — a wrong argument name can never again silently coerce
to `"undefined"` and answer confidently on garbage. Every refusal is a
typed rejection: clause, expected, got, and an executable remedy. Every
call — result, rejection, error — is appended raw to `.se/calls.jsonl`.

## Machines

Machines are DRAWN — Advanced Canvas files, compiled at load, refused with
the offending element named on any misparse. Engine-owned machines live in
`deliverable/machines/`; owner-authored process machines will live
in `spec/` later. **Authoring rules: `guidance/authoring/machines.md`** —
notably: file refs are VAULT-relative (the Obsidian vault root is
`project/`), the fields an agent reads live in the state note's
FRONTMATTER while the body is prose for humans, and start/terminal states
are drawn as pills.

**start and end are MECHANICAL** — every machine has exactly one of each,
sharing the same two notes; the machinery walks out of start and the
machine is done when end activates. **The MAIN machine** (`main.canvas`)
runs every session: `start → boot → idle → end`, where **boot is a
sub-machine** (`boot.canvas`: `start → read_contract → prepare_idle → end`)
and future work states branch from idle. `se_pull` walks it — the whole
happy path per call; the SessionStart hook makes the agent pull
immediately and show the landing banner verbatim; THE STATE GATE makes
the walk inevitable anyway — a call made before the walk has started is
refused, and the refusal says to pull instead.

Every state names the tools that are legal inside it, and that list is
enforced when a call arrives rather than being advice. Every state also
names what must be true to enter it and to leave it; a call that arrives
before those are met is refused, and the refusal says what would make it
possible. The pull itself is never blocked.

Every refusal carries a code, and each code is explained in
[the refusals guide](guidance/refusals.md).

## Status

THIS BLOCK DESCRIBED THE SYSTEM AT AN EARLY STAGE UNTIL 2026-08-17, and named
two commands that never existed. It is rewritten to what a reader can check.

WHAT RUNS TODAY:

- The cage and the single door. Every call goes through one server and is
  logged in full. The tool list is enforced per step, not advised.
- The whole process, start to finish. Work is driven one step at a time, each
  step asking for the evidence it needs and refusing what does not pass.
- The live view. A browser page shows where the work stands, updating as it
  moves, with the same content the driver sees.
- The record. Twenty-six pieces of work carry their own folders of evidence,
  and the links between what was asked for and what was built are checked by
  machine in both directions.
- The test battery. It runs on its own at one point in the process, and
  nothing else can call it.

WHAT IS KNOWN TO BE MISSING is not listed here, because a list like that goes
stale exactly the way this block did. It lives in the project's own register of
open questions, where every entry carries an owner and the condition that
brings it back.
