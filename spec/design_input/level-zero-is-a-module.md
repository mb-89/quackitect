# Level zero as a module

A specification. It says what to build, why, and in which order.
It is not guidance and the engine does not read it.
Work tokens reference it, and it is superseded by what actually ships.

This supersedes order items 1 and 2 of [[one-core-many-satellites]], which
proposed the move before anything had been measured. The measurements are here.

## What is measured

Claude Code 2.1.263 carries a plugin API for hooks written as a module rather
than as a command. `/plugin-types` writes its declarations. Every line below was
run on a desk box on 2026-09-08 and seen, not inferred.

- A hooks module loads under the command line and under the editor.
- `$.tool.register({name, description, inputSchema})` declares
  `mcp__<plugin>__<name>`, served by a `tool.call` hook on that name.
- `session.start` fires once per plugin before the first prompt AND IS AWAITED,
  so a tool registered there is listed by turn one.
- Module-level state survives between hooks in one session. A counter read 0 at
  `session.start` and 1 at `tool.call`.
- `enabledPlugins` in a TRACKED `.claude/settings.json` turns the plugin on with
  the plugin manager's own toggle off. Nobody clicks anything, and the docs name
  that key as the route for cloud sessions.
- A registered tool's result must be a string or an array. An object is refused
  with `invalid_union`.
- `$.session.surface()` answers `null` at `session.start` under the editor, so
  the surface is not readable at that event and `$.ui.toast` may not draw there.

The evidence is a throwaway plugin of four files, run in both clients. It is not
in the tree.

## Why this is worth doing

The engine already wins the race it is in. `mcp-lane.mjs` answers `initialize`
out of a committed snapshot while the build runs behind it, so no timeout
decides whether a session has a door. That is 25 KB of repair for a race the
harness sets: `.mcp.json` is read and the server spawned before `SessionStart`
runs, and six cloud sessions died there before the repair existed.

A tool registered inside the harness process is not in that race. The failure
stops being fast and starts being impossible.

Four further gains do not exist today on any path, and no work on the current
shape produces them:

- A voice check with no linter and no word list, through `$.model.classify`.
- `$.tool.list` and `$.tool.describe`, so the tools the model is offered follow
  the state rather than the build. The prefix tax becomes controllable.
- `agent.spawn` and `agent.offer`, so a helper is shaped before it starts rather
  than reported after it. Today `SubagentStart` only says one happened.
- `$.ui.ask`, so a token assigned to a person has a surface inside the session.
  Elicitation was refused as synchronous-blocking and left that with none.

## What it costs

The surface is early access, and says so in its own header: it may change
between releases without notice. A contract change takes out level zero on every
box at once, which is the failure class this work removes, arriving by another
door.

RULED: that risk is accepted and the lane comes out in this package. The fallback
if the API moves is a revert, not a second door kept warm. Two doors to one set of
tools is the drift this project has already paid for twice, and keeping one of
them unused for an event nobody can date is a cost with no end.

Level zero's logic moves to JavaScript beside an engine written in Go. One layer
in two languages is a real cost and is kept small by the rule below.

## The rule that keeps it small

THE MODULE IS A CLIENT, NOT THE ENGINE. It registers the tools, takes the level
zero decisions, and calls the engine for anything substantial. The engine keeps
the filesystem, the record and the index.

`$.fs` is confined to the working directory plus the temp directory, is text
only, and cannot write to the temp path. That is enough for a client and not
enough for an engine, which is the same rule stated as a limit.

Nothing here touches the agent's own `Write`, `Edit` and `Bash`, the ruling that
writes outside the roots are allowed and unguarded, or the engine's own file
access. Level zero constrains the agent. The engine runs whether or not an agent
does, the person's own work included.

## One protocol, and stdio goes

RULED. The engine gets one API and clients reach it through adapters. The format
is JSON-RPC 2.0, which is not invented here: it is what MCP is and what the lane
already speaks. The transport is a loopback HTTP door, because `$.http.fetch` is
the only pipe the plugin surface gives the module, and the extension and the
command line use the same door. The engine writes its port under `.se` and every
client reads it there, so no port enters a settings file again.

THIS IS NOT OUT OF SCOPE, and the earlier draft was wrong to say so. The module
needs hook decisions and it needs verbs. Today those are two grammars. A module
speaking both carries the drift inside itself, where it is harder to see than
between two files. So one protocol lands before the module rather than after it.

STDIO GOES. Its only client was ever the harness, through the lane, and the
module replaces that. No foreign MCP client has ever connected, and Copilot is
out. So one of the four grammars is deleted rather than migrated, which makes
the rest of the unification smaller: the three that remain are all loopback or
in-process. What that deletes: `src/mcp`, 2472 lines of Go with eight test files,
its own go.mod and a build target; `mcp-lane.mjs` and its committed snapshot;
`.mcp.json` and its projection.

WHAT IS LOST. The lane is the door that always worked. After this there is no
second one: a module that fails to load leaves a session with no tools, and the
way back is a revert rather than a switch. That risk was accepted when waiting
for early access was ruled out. Deleting `src/mcp` makes it irreversible, and
that is the price of not carrying a second door for a visitor who never came.

## Changing the engine under yourself

A box on this branch is guarded by the thing it is rebuilding. Left to the
agent, that is where this package fails.

THE PRECEDENT IS ALREADY IN THE TREE. `se --swap` builds the next engine beside
the current one, checks it answers for itself, drains the calls in flight, hands
over, and keeps the log session. Its rule: A BUILD THAT DOES NOT ANSWER IS NOT
INSTALLED.

The same rule, one level up: A MODULE THAT DOES NOT ANSWER IS NOT DEPENDED ON.
The session that installs a module can never see it, because a plugin loads once
per process at session start. So the session cannot be its own proof.

**The scaffolding, and it is scaffolding.** One script, run by hand or by the
two deletion tokens, that starts a session and asserts the module wrote its
line. It is NOT in the battery.

    claude --init-only        the harness starts and exits, no turn is taken
    the script asserts the module's stamped line is under .se

`--init-only` is the shape to use because it SPENDS NO MODEL CALL. It starts the
harness and exits, which is all the probe needs: `session.start` fires whatever
the turn does, or does not do, and that is what the probe of 2026-09-08
measured. UNVERIFIED: whether a plugin's `session.start` fires on that path. The
script's first job is to find out, and it takes one run.

If it does not, the fallback is one minimal `-p` turn, and then two things have
to be handled that `--init-only` avoids: the turn costs a model call every time
the script runs, and a session started inside a session meets the stop hook,
which demands a claim the probe has no business making. So the probe would need
a flag the cage reads to stay quiet. That is a reason to prefer `--init-only`,
not a reason to give up.

WHY IT IS NOT IN THE BATTERY. The battery runs constantly and is run from inside
a session. A probe there would spend a model call on every run in the expensive
case, and would start a session inside a session in every case. It has one
consumer, twice: the two tokens that delete things. It is called there and
nowhere else.

Then the rule that orders every deletion: NOTHING IS REMOVED UNTIL THAT SCRIPT
IS GREEN ON THIS BOX.

**What actually bites mid-turn.** Three of the four deletions do not touch the
running session at all, and the fourth is the one to do last.

| removed | effect on the running session |
|---|---|
| `.mcp.json` | none. The server was spawned at session start and keeps running. The next session is the one that notices. |
| `src/mcp` source | none. Delete the source; the binary goes at the next build. A running binary is locked on Windows anyway. |
| the plugin arriving | none. It loads at the next session start. |
| `.claude/settings.local.json` | IMMEDIATE. The harness reloads hooks when a settings file changes, so the session loses its per-call guards and its log. |

**And there is a second door, which the earlier draft missed.** RUNME needs no
lane: `./RUNME.sh pull`, `run`, `apply` and `--answer` are the same calls a lane
makes, and the write gate lets the engine through. So a box whose module fails
to load is not stranded. It is degraded to shell verbs, which is what a person
uses anyway. That is the real shape of the risk, and it is smaller than "the
lane was the door that always worked".

**The walk, so it is not left to the agent.**

1. Work tokens 1 to 3. Nothing is removed. The lane still serves.
2. Run the check. Red means the module is not proven and nothing may be deleted.
3. Push. Nothing on the box survives the box.
4. Token 4: the lane's config and `src/mcp`. The running session is untouched.
   Push.
5. Token 5 last: move the events into the module, push, and only then delete the
   local cage file, as the final act of the turn. The next session comes up
   guarded by the module rather than by the file.

## Order

The bucket is `level0` and holds nine tokens. Five are the move. Four are
defects and rulings found while measuring it, small enough for the same box.

The move, in dependency order:

1. **files carry no bom** — the installer writes the plugin, and a module with a
   byte order mark loads nothing and reports nothing.
2. **one protocol many clients** — the engine's one API, JSON-RPC 2.0 over a
   loopback door, the port under `.se`, the command line a client of it.
3. **level zero as module** — the plugin, the module, the registered tools, and
   the enable in the tracked cage. Depends on 1 and 2.
4. **the lane is retired** — the lane, `.mcp.json`, the cold stub, and `src/mcp`
   with it. Depends on 3.
5. **the local cage goes** — the per-call events move into the module, so
   `.claude/settings.local.json`, its source and its projection entry go, and the
   port leaves the cage for a file under `.se`. Depends on 3.

Beside it:

6. **an allowlist names events** — the door that keeps refusals out of the
   travelling cage names five refusing events where the harness has at least
   twelve. Depends on 5, because 5 decides what is left for that door to guard.
7. **a path is normalised** — one folder is two identities when its drive letter
   is spelled two ways.
8. **reading is evidenced** — the one criterion in the standard process that
   asks for something and accepts a tick.
9. **copilot leaves the tree** — by ruling. Two projections write the files back,
   so a delete is not enough.

Item 4 of [[one-core-many-satellites]] — every part reaching one centre, held by
a standing check — is out of scope. It enumerates parts, and this package changes
which parts exist.
