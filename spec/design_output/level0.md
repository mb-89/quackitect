---
kind: [[design_output]]
---

# Scope

`.claude/skills/level0` is the plugin holding every door. This note covers the
harness surface, the write door, and the standing layer it hands each session.

# What level zero is

A plugin whose hooks are a module. It runs inside the harness process and asks
for no server, so its rules hold on turn one of a clone nobody builds.

`.claude/settings.json` turns it on and git tracks that file, so a clone guards
its first session with nothing typed.

# The bridgehead and the server

Level zero holds the bridgehead and the server. The bridgehead, `hooks/level0.js`, is the module the
client loads, and the one hook a project carries: one door for every event,
`*`, and one function behind it. It posts each event to the server at the
port, with the root the session works in, and does what the answer says. It
imports its own folder alone, so a project carries that folder and nothing
past it. The project knows nothing of where the method stands on the disk.

Those imports buy the read tools their registration:

- the hook names each spec at the session's start, so a box whose server answers nothing carries them
- a file under `lib` failing to load blocks the hook, which is the cost

A second hook stands beside the door, on `turn.step`, because a stream reaches
a generator alone. It keeps the step's text as the chunks arrive, and posts it
whole as `turn.said` at the stream's end. The compaction goes over the wire
with its flat fields alone. The client hands the whole transcript as that
event, and the server reads no line of it.

The server runs from the method root and keeps one box a work root. The
rules, the schemas, the index binary and Vale come from the method root. The
log, the notes and the files come from the work root. This tree is the case
where both roots are one folder.

| the answer | the bridgehead does |
|---|---|
| `{ pass: true }` | hands the event on |
| `{ result }` | returns the result to the client |
| `{ event }` | hands the changed event on |
| `{ after }` | hands the event on, and adds to what comes back |
| `{ register }` | registers the tools it names, one by one |
| `{ needs: "reply" }` | posts the step's text and the last texts as `agent.spoke`, and does what that answer says |
| `{ spawn, back }` | spawns the helper, and posts what it says under the event `back` names |
| nothing, the server down | hands the event on, writes one `warn` line, and says it once in the chat |

The server is plain node under `src/bridge`, one file a topic, and the header
of each file says which door it holds. `server.js` holds the doors, god mode
and the switch in `decide`. The server holds every door of this note, and the
module before the bridgehead stands nowhere.

The log, the index and Vale stand behind doors under `src/doors`. The server
logs every event at `debug`, whole, so a box set to `debug` carries it, and
holds the state in one box a work root. `./RUNME.sh serve` starts it, and `--inspect` on that verb opens it to
the debugger. The launch config `the server` starts it under the editor's
debugger, so a break in `decide` binds, pauses, and takes new breaks while
the agent runs.

A server killed and running again takes the next event as its own, because
the bridgehead holds no state and no connection. So the session goes on across
every restart of the server, and the client reloads the bridgehead for no
change of a door. Headless turns say so, against client 2.1.269:

| turn | what it shows |
|---|---|
| the first | posts 186 events |
| the second | completes with the server down |
| the third | lands on the server running again |

## The cloud starts the server

Nobody presses the hook button on a cloud box. So the pull that takes a
branch there ends on the server, through `src/scripts/serve.js`. It probes
the health answer at the port the pointer names. Where nothing answers, it
starts the server on its own, the way the stub's bridgehead does. The pull's
last line says which of these stands:

| what stands | the line says |
|---|---|
| the server answers | the port it answers at |
| the start runs | that the server starts detached, and why |
| the start fails | the shell's last line |

A desk pull starts nothing, and a take that fails starts nothing.

The line it runs is the bridgehead's own, imported from the hook. So one text
starts the server on both roads, and one table names what each code says. The
stub's bridgehead keeps a copy, because that file imports nothing at all.

## The bridgehead starts it too

The take verb reaches a cloud box that pulls work. A cloud session opening on
a prompt reaches no verb at all, so the bridgehead carries the same start. The
session's first event answers nothing, the `warn` line lands, and the start
road runs once. That silence says nothing to the person, because the road runs
under it. For details, see
[[spec/design_output/level0#the-bridge-says-it-falls]].

The road is one shell line, because the hook stands outside node and its own
folder reaches no shell. The shell reads the environment itself and answers a code:

| the code | what stands | what the log carries |
|---|---|---|
| 3 | no cloud variable, so a person starts it | nothing |
| 4 | the method root stands nowhere | one `warn` line |
| 5 | the box carries no node | one `warn` line |
| 6 | the install brings no modules | one `warn` line |
| 7 | the road installs the modules, then starts the server | one `info` line |
| 8 | the bridge code fails its self-test, so no server starts | one `warn` line naming the fault |
| 0 | the server starts behind the session | one `info` line |

`CLAUDE_CODE_REMOTE` and `SE_CLOUD` say a box is a cloud box, the same pair the
cloud guidance binds on. The operating system decides nothing here, because a
person at a local box wants the button and a cloud box wants the server.

The call comes back in milliseconds where the modules stand. The line
backgrounds the server and sends its output to `.se/.log/serve.log`, so a
session start waits for nothing. The rules ride the first event the server
answers, and nothing waits for it to stand. For details, see
[[spec/design_output/level0#rules-ride-the-first-answer]].

The road brings the modules where they stand nowhere. A cloud box clones the
repository fresh when the container starts. The half of the setup writing into
the tree goes with the old one:

| what the setup writes | where it lands | what the clone does |
|---|---|---|
| the trust flag and the mode | the home of the box | leaves them standing |
| the modules and the installed binaries | the tree | replaces the tree |

So the road runs `src/scripts/install.sh` itself, under the skip list the setup
names, and answers `7` where it does. That install waits, because a session
holding no cage reads no rule at all. A session start pays it once, and on a
box whose first event finds no server alone.

### Rules ride the first answer

Nothing in level zero waits on a clock. What a session reads depends on which
events a server already answered.

The server keeps one mark a session: whether the session holds its standing
layer. `layerRides` in `src/bridge/guidance.js` reads the mark.

| the event | what the server does |
|---|---|
| `prompt.context` | hands the layer as blocks, and sets the mark |
| the first `tool.call` of the agent's own, with the mark unset | hands the layer as added context on the answer, and sets the mark |
| a later `tool.call` | hands no layer |
| a `tool.call` answering a result or a hold | hands no layer, so the next call carries it |

A compaction and a `/clear` fire `prompt.context` again, and that read hands
the layer again. For details, see
[[spec/design_output/level0#the-guidance-stays-put]].

A server restarting under a session builds the mark off the log. A `context`
row there says the session holds the layer. A server the start road launched
late meets no such row, so its first answer hands the layer over.

The bridgehead holds no wait either:

| the event, no server answering | what the bridgehead does |
|---|---|
| `session.start` or `prompt.context` | runs the start road once, and hands the event on |
| a read tool | answers the starting line at once |
| the stop on a cloud box, a launch standing, no answer yet | holds the turn with one line: level zero starts, and the next event carries its rules |
| the stop where the road stands down, or on a desk | hands the stop on |

The road answering `0` or `7` launches a server, and it exits `3` off a cloud
box. So a launch says the box is a cloud box. A road standing down sets the
cage and launches nothing, so a box that starts no server loops nowhere.

The stop holds `HOLDS` times at most before a server answers. So a launched
server that stays down frees the turn after the last hold. The count reads
events alone.

### The first call pays

`READ_TOOLS` in the hook names the tools a hand reads with, and the hook
registers each at the session's start. That registration reaches no server, so
a box whose server answers nothing carries the tools anyway.

A call of a read tool takes the `*` door every event takes, and no door of its
own. So one post reaches a server that stands, and the answer rides back the
way every other answer does, its `register` list among it. A call landing
before the server answers takes the steps below, and waits on nothing:

- it posts once, and answers where a server stands
- it runs the start above, where the road has not run yet
- it answers at once, with one line

| what stands | the line says |
|---|---|
| a launch stands, and no server answers this session yet | level zero starts, the call answers once the server stands, and the agent calls it again |
| no launch stands, or a server answers once and then falls | the port and the log |

`test/level0/read-tools.test.js` counts the one post over each read tool.

So a hand calls `find` on its first turn, and that call starts the server. The
call after it lands on the server, and carries the rules. For details, see
[[spec/design_output/level0#rules-ride-the-first-answer]].

## A fix reaches the session

The server imports its doors and its libs once, so a fix to one reaches no
running session by itself. So the server notes its own code at the first
event: every script under the roots `src/bridge/reload.js` names, and every
module `src/bridge/server.js` imports, at any depth. After every tool run it
reads the time and the size of each again, and reads no script whole. A file
that differs restarts the server through the road the `/restart` request
takes, and the log names the file. The next event lands on
the new code, and the session goes on as above.

## New code proves it loads

A moved file restarts the server only where the new code passes a self-test
first. The server runs `node src/bridge/server.js --selftest <method>`, and
that child does what the table says:

| step | what the child does |
|---|---|
| load | imports every module the server imports, so a name a module lacks fails here |
| drive | runs one of each event through `decide`, on a box whose doors stand in memory |
| answer | exits 0, or exits 1 with the fault on standard error |

`src/bridge/selftest.js` holds the events and the doors. On a clean exit the
server steps down, as above. On a fault it runs on over the old code, and writes one
`error` line naming the file, the line and the error. The same fault writes no
second line, and code unmoved since the fault asks for no second test. An asked
`/restart` meets the same test.

The start road of the bridgehead runs the same flag before it starts a server,
and answers `8` where the test fails. So a broken tree writes one line, and no
road starts a server that falls on its first event.
`test/contract/server-loads.test.js` runs the test over this tree, so
`./RUNME.sh check` refuses a bridge that fails it.

## A door that throws passes

A throw inside a door answers `pass`, and the box writes one `error` line
naming the event and the stack. So one broken door costs that event its rules,
and the server and every box stand. An event past `BODY_CAP` characters passes
unread, and the box writes one `warn` line.

## A cache follows its file

The box holds a few files it reads once, and each drops where a tool run
moves the file it stands on. `src/bridge/caches.js` names them:

| the cache | the files it stands on |
|---|---|
| the paragraph schema | `spec/schemas/paragraph.schema.yaml` |
| the words | the paragraph schema, and the three lists it names |
| the stop rules | `spec/config/stop` |
| the note schemas | `spec/schemas` |

A tool run reads the time and the size of each file, as the code above does. A
session start drops every cache, and the next read fills it again.

## A start takes the port

A server starting asks its port for `/health` first. Where a bridge answers,
the new server asks it to stop, waits for the port to free, and listens. So a
press of the hook lands over any bridge standing before it:

- a server from an old window
- a server a script starts
- a server from before a restart

A port a foreign process holds answers no `/health`, so the listen fails and
the crash line names the port. The log viewer holds a port of its own below
`PORT_BASE`, and the register hands out ports from `PORT_BASE` up.

## A crash writes its error

An exception nobody catches, and a rejection nobody handles, both end the
server. Before it exits, the server writes the error and its stack to the log
at `fatal`. So the log names why the server falls, and the next start reads
as a fresh one. A kill from outside the process writes nothing, so a log
ending on no `fatal` line names a kill.

## A restart watches its child

A restart closes the port and starts the server again from the same
arguments. A fault in a moved file ends the new server before the crash
handler above stands. So a detached start with its output going nowhere
leaves a silent port, and the desk starts one by hand.

The old server hands the start to the process door, with a window and the
serve log as the child's output. A child ending inside the window is a fall.
Then the old server writes
one `fatal` line naming the exit and the line the child writes, and exits
with one. A child standing past the window is the server, and the old one
exits clean. `RESPAWN_WAIT` in `src/bridge/server.js` holds the window, and
`SERVE` in `lib/log.js` names the file. `respawned` takes the exit as an
argument, so a case drives the fall through the fake process door.

`restarts` in `src/bridge/server.js` ends the listen and starts the child on
the next turn of the loop. Node's own close callback waits on every open
connection, and a running wait holds one for minutes. So the restart waits on
none, and the old process ends them as it exits.

## The server holds off sleep

A box asleep answers no hook, so a session under agent control dies with the
screen. While the server runs, the box holds off sleep, and the display sleeps
as it likes. The hook's light in the sidebar is the sign. Green means the box
stays up, and the switch beside it that stops the server lets the box go.

The awake door holds a child process that asks the system for the hold, the
way a system's own tool does. The child reads its standard input and exits at
its end. So a server that dies takes the hold with it, and no hold outlives
the light.

| the box | the child |
|---|---|
| Windows | a shell asking `SetThreadExecutionState` for the system, and waiting on its input |
| a Mac | `caffeinate` waiting on the server's own process |
| Linux | `systemd-inhibit` over `cat`, which ends with its input |
| any other | no child, and the door says so once in the log |

### A release awaits the end

Every release answers a promise, the unheld road and the fake alike. The door
listens for the child's `exit` from the spawn on, so a child that ends early
still settles it. A child that outlives the wait lets the promise settle at a
timeout, so a caller awaiting the release gets its answer on every box.

## The bridge says it falls

A server falling under a running session leaves the doors passing quietly. The
row naming the fall sits in a file nobody opens, and the check finds it minutes
later. So the bridgehead says it where a person stands.

| what the bridgehead does | when |
|---|---|
| writes one `warn` row naming the event route | the first event the server answers nothing for |
| says one line in the chat, through `$.ui.log` | the first such event past the session start |
| drops both marks | the server answers again |
| answers the `no server answers` line to a level zero tool | a tool call the server answers nothing for, since its hook finds nothing past it |
| answers the starting line to a level zero tool | a tool call before the server its start road brings up answers, per [[spec/design_output/level0#rules-ride-the-first-answer]] |

A post nobody takes reads the port pointer first, because a server restarting
on another port writes it again. Where the pointer names another port, the
bridgehead posts there once more before the server reads as down.

The host's fetch cuts a post at its own timeout, and a wait runs past it. So a
`mcp__level0__wait` post falling with no status after `CUT` or more in
`.claude/skills/level0/hooks/level0.js` asks `/health` once.

| the health | the wait |
|---|---|
| answers | goes again as the same post, and its answer stands in place of the `no server answers` line |
| answers nothing | reads as down, as above |

The route both name is the one the bridgehead posts to, which `url()` answers.
The line names it, what the wire says, and the commands a person runs:
`./RUNME.sh serve`, and `./RUNME.sh doctor` where that fails.

The session start says nothing to the person. `seen` posts every event to the
server first, and runs the start road under a `session.start` the server
answers nothing for. So that silence is the road standing ready, and a line
there reads false on every healthy cloud start.

| the mark | what it holds |
|---|---|
| the row's mark | one row a fall |
| the chat's mark | one line a fall, standing apart so a session start keeps the line unsaid |

The marks stand apart, because a session start writes the row and leaves
the line. A harness offering no `$.ui` leaves the row alone, and nothing
throws. `./RUNME.sh doctor` names the server under `server`, where a person
asks after it later.

## A session says its cage

A session whose server stays down reads like one whose server stands. The agent
inside it reads no rule and writes past every door, and it says nothing about
either. An agent outside the cage is the one reader who cannot see the fault.

So the bridgehead says it where a reader stands. The start road stands down at
a `warn` code, and the first `prompt.context` the server answers nothing for
carries one block, `level0-cage`:

| what the block names | why a reader wants it |
|---|---|
| the code the start road answers | it says which piece is missing |
| what that code means | a reader takes it without the table |
| what the road itself says | the error under the code |
| `./RUNME.sh`, then `./RUNME.sh serve` | what a person runs to fix it |

`cageText` in `hooks/level0.js` builds the block. The hook holds that code until
a server answers. The block asks the agent to open its first answer with one
line saying level zero stands down. A person then tells a caged session from
an uncaged one at a glance.

A box whose server stands reaches none of this. The answer of the server clears
what the road holds, so a session reading the rules reads the canary alone.

A code carrying no `warn` carries no block either. `3` says a person starts the
server at this box, and a person standing there reads the sidebar.

## A restart fills the box

The server restarts under a running session, and the harness sends one
`session.start` a session. So the box a restart builds carries none of what the
session start fills, and the session runs on.

| what a session start fills | who reads it | what a fresh box holds |
|---|---|---|
| `box.schemas` | the mint spec, the mint, the write door | nothing |
| `box.tools`, `box.specs` | the block naming what this box has | nothing |
| `box.projections`, `box.sources` | the write door | nothing, and `freshens` fills them |
| the warm index | the search tools | a cold index |

`fillsBox` in `src/bridge/server.js` fills the schemas, the survey and the
specs. `decide` runs it ahead of the door, so the door and the registration
both read a full box. A session start passes `again`, because the tree moves
under a box that stands.

The mint is what this buys. `mintSpec` reads the kinds off `box.schemas`. A
fresh box holds none, so the kind list registers empty and `mintedNote` throws
on `schemas.get`. The tools block reads `box.tools` and `box.specs` the same
way, and a fresh box leaves it short.

## The check reads the server

`./RUNME.sh check` probes the health call and carries on. A box out of a fresh
clone runs no server, and the rules over the tree hold there all the same. So
the probe says what it meets, and leaves the battery running.

| what the probe meets | what the check says | what it answers |
|---|---|---|
| a server answering well | the server stands, and where | green |
| a server answering ill | the health call it fails, and why | red |
| no server at all | no server answers, and how to start one | green |

A server standing and failing its own health call is the one red here.
Something runs there, and it names itself broken. `serverRead` in
`src/scripts/cli-check.js` reads the three apart, and `serverSays` takes the
fetch as a door, so a test drives each one.

`./RUNME.sh doctor` names the server still. That verb is where a reader asks
after what this box has.

## The doctor probes every hook

A hook answering nothing writes a failure on every event, and the session runs
blind to it. So `./RUNME.sh doctor` reads the addresses the settings files
name, and says which one answers.

| the file | who writes it | does git track it |
|---|---|---|
| `.claude/settings.json` | this tree | yes |
| `.claude/settings.local.json` | the box | no |
| the settings under the home of the box | the box | no |

`SETTINGS` and `SETTINGS_LOCAL` in `.claude/skills/level0/lib/vehicle.js` own
those names, and the home file takes the first of them under the home path.
`hooksNamed` in `src/scripts/cli-check.js` reads them in that order, and takes
every string under `hooks`. It keeps the ones a URL parses as `http:` or
`https:`.

A command hook holds a path, and `new URL` takes a Windows path as a URL. So
the reader holds those schemes alone, and a command hook stands outside the
list. Files naming one address stand as one row, off the file naming it
first.

| what the probe meets | the row under the address |
|---|---|
| an answer, whatever its status | `stands at <the address>, off <the file>` |
| nothing, inside the wait | `warn: answers nothing at <the address>, off <the file>` |

A reply carrying a failing status stands, because a box answering a status
listens there. `hookRows` runs the calls together, so a box naming several dead
hooks answers inside the first minute. The wait is `HEALTH_WAIT` in
`src/scripts/cli-doors.js`, which the server probe reads too.

The row's label reads `hook` beside the host of the address. A host carries its
port, and leaves the one its scheme takes by default. `doctor` pads a label to
one width, so the rows stand in line. The word `warn` opens the printed row,
and the doctor writes no log line of its own.

The entry at the dead port lives in `.claude/settings.local.json`, which git
ignores. So a hand on the box it belongs to takes that line out, and this row
is what shows them the entry.

# The harness surface

Every line here comes from running it against client 2.1.263. The
surface is early access and moves, so run it again before you trust this.

The sections below carry their own date where a later run measures them again.

## The file surface renames itself

Measured against client 2.1.267:

| what this tree calls | what the client offers |
|---|---|
| `$.fs.readFile` | `$.fs.read` |
| `$.fs.writeFile` | `$.fs.write` |
| `$.fs.listDir` | `$.fs.list` |

The old three answer `undefined`. A hook calling one throws, the engine skips
that hook, and the chain carries on without it.

So on that client level zero writes no stamp, writes no log line, reads no
guidance and holds no write door. The prompt says nothing about it.

The readings of the same module, and what each one tells you:

| what you run | what it says about a moved method |
|---|---|
| `claude plugin validate` | nothing, it reads which nouns the source touches |
| `claude --debug` | the throw, in the debug log alone |
| `/plugin-types` | the running build's own declarations |

So read `/plugin-types` first, and run the module against the client before you
trust it.

## A subagent brings no session

Measured against client 2.1.267, by a probe writing one file per
hook event through a whole run.

| what a subagent fires | what reaches it |
|---|---|
| `session.start` | nothing, the session fires it once |
| `prompt.context` | nothing, so the standing layer misses it |
| `tool.call` | the session's own hooks, `agentId` set |

One module instance holds the session and every subagent inside it. A
subagent's calls come back through the session's own hooks, under an `agentId`
the main loop leaves out.

So the write door already holds over a helper, and the guidance is the gap.
`agent.spawn` closes it.

## A helper ends no turn

- Outcome: a helper's `turn.step` and `turn.complete` reach the session's hooks, and both return at once under an `agentId`.
- Cause: the gate reads a helper's answer at its turn end and prompts the session after a standing stop.
- Door: a helper gets no reply line, no canary, no stop vote and no answer gate. So nothing from level zero prompts after a standing stop.
- Agent: a helper's own `Agent` call meets the Agent gate. A helper waiting on its helper holds the turn the same way. For details, see [[spec/design_output/level0#an-agent-call-runs-behind]].
- Demand: a helper's step text answers no demand of the owner's, so the session's own text has to.

## The spawn carries a rewrite

Measured the same day and the same way. `agent.spawn` fires once per subagent,
before its model resolves.

| what the event carries | what a hook does with it |
|---|---|
| `prompt`, `description`, `subagentType` | a rewrite stands |
| `model`, `cwd`, `background` | a rewrite stands |
| `tool_use_id`, `fork`, `parentModel` | pinned |

A hook calling `next({ ...e, prompt })` hands the subagent the new prompt. A
probe prepending one instruction sees the subagent obey it, and `next(e)`
resolves to `{ model }`, the id the spawn settles on.

## A step streams

Measured against client 2.1.269. `turn.step` streams, so its hook
takes `async function* ($, e, next)`, yields the chunks through `yield* next(e)`
and returns the result. A plain `async` hook there fails `claude plugin
validate`, and the client then loads none of the module:

| what a person sees | what stands behind it |
|---|---|
| `claude plugin list` says `√ loaded` | the client adopts the plugin, and refuses its hooks |
| no `.se/level0.stamp` | `session.start` reaches no hook |
| no line in `./RUNME.sh tui` | every door in the module stays silent |
| the canary is absent from every answer | the standing layer reaches no session |

So one hook of the wrong shape takes the whole cage off, and the readings
above are how a person catches it. Run `claude plugin validate
.claude/skills/level0` on the client of the day, because the shape a hook takes
moves with the build.

## A step arrives late

`turn.step` fires at the step's first tool result, so its first call runs
before it. It carries the step's visible text in `answer`.

Measured against client 2.1.267, in a session past `4096` messages: at `tool.call`,
`$.session.messages()` carries no text from the response in flight. The list
also answers its newest `4096` alone, so a position in it shifts.

So the answer gate reads the step first and the transcript second, and lets the
calls of a response in flight pass. For details, see
[[spec/design_output/level0#what-the-door-reads]].

## Arguments arrive on the event

A tool's arguments sit on the event beside `tool` and `tool_use_id`, so a write
carries `e.content` and `e.file_path`. Reading `e.input` answers `undefined`,
the hook finds nothing, and the write proceeds. The rule then looks like a
feature nobody built.

## No computed engine access

`claude plugin validate` refuses `$[noun]` and `$.fs?.read` by reading the
source. Spell every call `$.noun.method(...)` at the call site, and give `on` a
literal event name.

## A module imports a sibling

So the rules live in `lib` as one copy that the module and the command line both
load. Keep `lib` free of `node:` imports, because the module's environment
carries none.

## Nothing imports past the plugin

`claude plugin validate` refuses a relative import that climbs past the plugin
root, and it names the file. So the whole of level zero stands inside one
folder. A shape holding `lib` under `src` and the hooks module elsewhere fails
before a session starts.

## A stub names its vehicle

A stub runs the vehicle's level zero with no plugin folder of its own and no
copy in the tree. The client loads the plugin from the vehicle's folder,
because that folder is a marketplace: `.claude-plugin/marketplace.json` at the
vehicle's root names `./.claude/skills/level0`. The stub names the marketplace
under `extraKnownMarketplaces` with a directory source, and enables
`level0@<brand>` under `enabledPlugins`. One `claude plugin install` at install
time, and every session there carries the cage. Measured against client
2.1.269 on a throwaway stub: the canary comes back, and the tools keep the
name `level0`.

The client keeps a cache of the plugin folder under the user's home, one per
version, off every tree. `claude plugin update` refreshes it. The path to the
vehicle differs per box, so the shim writes it into `.claude/settings.local.json`,
which git ignores.

Every road that runs the vehicle's code inside a plugin of the stub's own fails.
One headless turn a road says so:

| the road | what stops it |
|---|---|
| a dynamic import of a file URL outside the folder | the loader: a hooks module imports its own files by relative path, and nothing else |
| a relative path climbing past the folder | the loader: outside the plugin's folder |
| a link inside the folder pointing out | the loader: no such file under the folder |
| code standing as text, built with `Function` | the sandbox refuses code built from a string |
| a copy of `hooks` and `lib` inside the folder | nothing, and the owner refuses a copy in a tree |

Two more things the probes answer. `claude plugin validate` follows `$` into
a function declared at the top of the file alone, so a hook hands `$` nowhere
else. A marketplace entry's `source` is a relative path under the marketplace
root, so the vehicle is its own marketplace.

## The filesystem reads and writes

`$.fs` reads a file, writes one, lists a folder and answers what stands. It
deletes nothing, so a delete goes through `$.process.run`.

## A session misses its install

A plugin loads once per process at session start, so the session that changes
the module runs the old one. `claude --init-only` fires no `session.start`, so a
probe costs one `-p` turn and one model call.

## The guidance stays put

The rules reach the agent once and stand for the conversation. The engine's own
type declaration says `prompt.context` fires once per conversation, and again
on "a re-read (compaction, `/clear`)".

Level zero hooks it already, so a compaction and a `/clear` both bring the
rules back. Nothing here re-reads them per turn, and nothing needs to.

# The layer after a compaction

The layer survives. Measured against client 2.1.269, by the probe
below. A compaction fires `prompt.context` a second time, the hook hands the
same blocks over, and the answer after it carries the canary with its own
numbers.

A second prompt on its own fires `prompt.context` once only, so the event
counts a conversation. That control is what makes the second read a
compaction's own.

## The roads to a compaction

| road | what it answers on client 2.1.269 |
|---|---|
| `$.command.run({ command: "compact" })` | it holds, and `session.compact` fires inside the call |
| `$.session.compact({ instructions })` | it throws under `-p`: compaction there runs inside a turn |
| two headless runs under `--resume` | untried, because the first road holds |

`$.session.compact` names the reason itself, so a session under the editor
still takes it. The probe takes the command road, which holds in both places.

## What the probe does

`./RUNME.sh probe compact` runs the client headless under `SE_PROBE_COMPACT`,
asks for the canary, and reads the log that run leaves:

1. The hook reads the variable at `session.start`, and stands idle without it.
2. At the first `turn.complete` it runs the compact command, then submits a
   second prompt asking for the canary again.
3. `session.compact` writes a line naming what fires it and how many messages
   it keeps.
4. The re-read of `prompt.context` carries one extra block, which asks for the
   canary a second time and carries none of its numbers.
5. The second answer carries the canary, and `turn.complete` writes the same
   line the first turn writes.

The numbers come out of the standing block alone. So an answer carrying them
proves the block stands in front of the model past the compaction.

## What the probe reads

`readsCompaction` in `src/scripts/probe.js` is a pure function over log rows:

| the log carries | the verb answers |
|---|---|
| a `compact` line, a `re-read` context line, and the canary whole | `survives` |
| a `compact` line, and a canary absent or carrying other numbers | `drops` |
| a `compact` line, and no `re-read` context line | `drops` |
| no `compact` line at `info` | `no compaction`, and the road stands unproven |

The verb exits `0` on `survives` and `1` on anything else.

`test/contract/compact.test.js` drives the verb against the real client. One
run costs ninety seconds and two model calls, so `SE_SLOW` switches it on and
`./RUNME.sh check` stays fast without it.

## Without the verb

The two log lines pay on their own. A session that compacts in the ordinary
course writes a second `context` line in `./RUNME.sh tui`, with `reason` at
`re-read`, and a `compact` line beside it. So a person reads a compaction out
of the log with no probe running.

# Where the plugin stands

Level zero lives at `.claude/skills/level0`, holding its manifest, its hooks
module and its rules. The client finds
`.claude/skills/<name>/.claude-plugin/plugin.json`, adopts the folder as a
plugin under the id `level0@skills-dir`, and enables it by default. Nothing
registers it, and `.claude/settings.json` names it nowhere.

A marketplace reaches no cloud box, which is why this shape stands:

| way in | what it asks for | a fresh cloud clone |
|---|---|---|
| `extraKnownMarketplaces` in settings | the workspace carries accepted trust | no trust, so the key stays unread |
| a routine's `extra_marketplaces` | the API stores it | the API answers 200 and drops the value |
| `.claude/skills/<name>` | the workspace carries accepted trust | no trust, so the scan skips it |
| `claude --plugin-dir <path>` | the flag on the command line | it loads |

The trust gate reads a flag a person accepts once per folder on one box. A
cloud clone is a new folder every run, so it carries none.

## The trust gate reaches skills

Client 2.1.266 gates a skills-directory plugin on the same trust every
marketplace waits for. `claude plugin list` says so on a cloud box:

    ‼ 1 project-scope directory under ./.claude/skills/ that may load as a
      plugin was skipped because this workspace was not trusted when plugins
      were scanned.

So level zero holds no cloud session that starts the ordinary way, and
`~/.claude.json` carries `hasTrustDialogAccepted: false` there. The flag lives
outside the tree, so no tracked file moves it.

The gate holds the scan alone. Measured against client 2.1.267,
by a probe on a cloud clone carrying no trust. The `env` key bites there, and
so does a `permissions` deny rule in `.claude/settings.json`. So the tracked
file still says what a session can do, and level zero is the one part waiting
on the flag.

Read the flag before you read anything else. A second probe the same day, on
client 2.1.42, reads the box around it:

| what a cloud box carries | what the probe reads |
|---|---|
| `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` | `1`, so the switch stands ready |
| `hasTrustDialogAccepted`, per project | `false`, and the top level holds no key |
| permission mode | auto, and no call there raises a prompt |

What reaches a cloud box today:

- `claude --plugin-dir .claude/skills/level0`, which loads the folder for that
  session and skips the scan.
- A box whose setup writes the trust flag into `~/.claude.json` before the
  session starts.

The canary finds this. A session saying the line out loud is a session level
zero holds, and a cloud session that starts the ordinary way says nothing.

Client 2.1.267 stands the same way, measured on a cloud box. The
debug log names the count, and `.se/level0.stamp` stands nowhere in the tree:

    [plugins] Found 1 plugins (1 enabled, 0 disabled)
    [plugins] Registered 0 hooks from 1 plugins

The one plugin it counts belongs to the client. So a branch measuring what a
hook costs at `session.start` measures the module itself here, and says which
door it takes.

## The setup writes the flag

`src/scripts/trust.js` writes it where the tree and `node` both stand to hand.
A cloud environment carries neither at setup time. Measured against client
2.1.267: a
setup naming `node src/scripts/trust.js` fails, and the session ends at
`init_script` with no first turn. A failing setup takes the session with it, so
the one an environment carries leans on nothing:

    #!/bin/bash
    set -u
    repo="$PWD"
    [ -d "$repo/.git" ] || repo=/home/user/quackitect
    python3 - "$repo" <<'PY' || true
    import json, os, sys
    folder = sys.argv[1]

    def merge(path, change):
        try:
            said = json.load(open(path))
        except Exception:
            said = {}
        change(said)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        tmp = path + ".tmp"
        json.dump(said, open(tmp, "w"), indent=2)
        os.replace(tmp, path)
        return path

    def trust(said):
        said["hasTrustDialogAccepted"] = True
        said.setdefault("projects", {}).setdefault(folder, {})["hasTrustDialogAccepted"] = True

    def auto(said):
        said.setdefault("permissions", {})["defaultMode"] = "auto"
        said["skipAutoPermissionPrompt"] = True

    print("trusted", folder, "in", merge(os.path.expanduser("~/.claude.json"), trust))
    print("auto mode in", merge(os.path.expanduser("~/.claude/settings.json"), auto))
    PY
    SE_INSTALL_SKIP="editor-link editor-extensions editor-client go index se-lsp" \
      sh "$repo/src/scripts/install.sh" || true
    exit 0

Both readers mark this folder one the client trusts, and both leave every other
key and every other project alone. The `exit 0` holds a session up where the
write fails. Nothing races either one, because the setup runs before a session
holds the file.

## The setup installs the cage

The install line is what makes the trust worth anything: a trusted tree whose
server cannot boot holds nobody. `src/scripts/install.sh` is `sh` and installs
node itself, so the setup leans on nothing again.

| what the setup installs | why the cage needs it |
|---|---|
| the plugin manifest | git ignores it, so a fresh clone loads no plugin until the install writes it |
| node | the command line and the server are JavaScript |
| the modules | the server dies at import without them |
| Vale | the prose rules the write door reads |
| Biome | the JavaScript rules beside them |
| the git hooks | the commit and the push doors |

`SE_INSTALL_SKIP` leaves out what a box nobody looks at uses nowhere. That is
the editor link, the editor extensions, the language client, Go, the index and
the language server. Those stay wants, and every rule holds without them.

## Where the mode stands

The client takes `permissions.defaultMode` values `auto` and `bypassPermissions`
from user settings, and from the settings an organisation controls. A project
file naming either one changes nothing. So the setup writes
`~/.claude/settings.json`, and `.claude/settings.json` carries the allow list by
itself.

| what a file sets | project settings | user settings |
|---|---|---|
| `permissions.allow` | it holds | it holds |
| `permissions.defaultMode: auto` | the client passes it by | it holds |

A routine meeting a prompt stalls until a person looks. So an unattended box
takes its mode from the setup.

A box carrying that setup says the canary out loud. Measured against client
2.1.267, on
a cloud box cloning `main`:

| what a box answers | with no setup | with the setup |
|---|---|---|
| `hasTrustDialogAccepted` | false | true |
| `claude plugin list` | the scan skips one folder | level zero loads |
| the canary line | absent | the session says it |
| the cloud guidance | absent | the standing layer carries it |

The scan happens once, at the start, so a session already under way needs one
more step. The client names it in the same line the probe read: once the trust
stands, `/reload-plugins` loads what qualifies, and a relaunch does the same. A
person types that, so the setup stays the road for a box nobody watches.

The flag sits in the home of the box, which a cloud box puts at `/root` while
the tree sits under `/home/user`. So the script reads `HOME` for the path, and
it prints the file it writes for the setup log to carry.

# The write door

`tool.call` reads every write, and each one names its ticket first. For
details, see [[spec/design_output/level0#a-write-names-its-ticket]]. A breach comes back as `{ deny }`
naming the rule, the line and the phrase.

| what the write carries | what reads it |
|---|---|
| a run or a token out of a note under `.se/notes` | [[spec/design_output/private#the-door-reads-the-notes]] |
| prose | Vale, then the prose reader |
| code | Biome |
| a shell command landing a file | [[spec/design_output/bash]] |

The private half answers first, so a note's own words stop at the door. The
refusal closes by asking the writer to hold that rule for the rest of the turn.
A refusal teaching one line costs a round trip on every line.

## A write names its ticket

Every call that writes names the ticket it serves, so each write asks the agent
which ticket it works on. A held ticket lets no write through, because the agent
forgets to take a ticket up and to put it down.

| the road | what it names | where the door reads it |
|---|---|---|
| `mcp__level0__patch`, `mcp__level0__replace` | the `ticket` field | `unnamedIn` in `src/bridge/apply.js` |
| `./RUNME.sh commit` | `<ticket>:` at the head of the message | `commitVerb` in `src/scripts/commit-verb.js` |
| Edit, Write, MultiEdit, NotebookEdit | nothing, since the harness fixes their fields | `onToolWrite` in `src/bridge/write.js`, which refuses them and names `mcp__level0__patch` |
| Bash, PowerShell | `<ticket>:` at the head of `description` | `ticketDoor` in `src/bridge/bash.js` |

`ticketFault` in `src/engine/named.js` reads the name against what stands in
hand. `inHand` reads it off the box: every ticket a hold names, and the plan's
`working` todo. Every hand writes through the same door, so a helper's hold
passes its own ticket.

| what stands in hand | what passes |
|---|---|
| a hold, or a working todo | a held ticket's name, an ephemeral one among them, or the todo's title |
| nothing | any open ticket, so a commit by hand still lands |

A ticket stands open where `spec/tickets/<name>.md` or `.se/tickets/<name>.md`
carries a `state` other than `closed`. A Bash description opening on the
working todo's title and a colon passes too. The pull answers a working todo
ahead of every road that hands work out. The refusal names the fault and says
how to name a ticket:

| the fault | the refusal opens |
|---|---|
| a name outside what stands in hand | `<name> stands outside what is in hand.`, then the tickets and the todo |
| the call names no ticket | `This write names no ticket.` |
| no file under either folder carries the name | `No ticket named <name> stands under spec/tickets or .se/tickets.` |
| the ticket's `state` reads `closed` | `<name> stands closed.` |

These write with no ticket named:

- `./RUNME.sh mint ticket` and `./RUNME.sh ticket note`, which run as verbs
- `mcp__level0__mint_note`, which calls `onWrite` itself
- `mcp__level0__undo`, which puts a patch back
- the handover `.se/HANDOVER.md`, through Write or through a patch writing it alone
- a path outside the tree, which the write door reads nowhere
- the ticket verbs, which commit through git themselves

## A shell names its ticket

A Bash or PowerShell call names the open ticket it serves at the head of its
`description`, the way a patch names it in its `ticket` field. `ticketDoor`
in `src/bridge/bash.js` reads `e.description` through `ticketOf` and
`ticketFault`, and `DESCRIPTION_HOW` in `src/engine/named.js` says how to
name one. `onPowerShell` runs the same gate for the PowerShell tool, and no
rule past it, since every rule above reads a POSIX command line.

A session holds no ticket before its first pull, so `freeOfTicket` in
`.claude/skills/level0/lib/bash.js` reads these forms as needing none:

- `./RUNME.sh ticket pull`
- `./RUNME.sh mint ticket`
- `./RUNME.sh ticket note`

A call chaining one of these with another command still names its ticket.
`freeOfTicket` checks every segment, and passes only where each one matches a
free form alone.

## The panel holds a warning

A rule at warning is a break of form, and the write lands over it. The door
writes each row to the log under the warning. The context after the call tells
the agent that the warning stands in the Problems panel. The push waits until
the panel stands clear, and the work goes on.

## A write meets its mark

No door reads a mark, so the write door keeps none. The Read door, the patch
lane, the undo and the shell reads set no mark either. For the reason, see
[[spec/tickets/every-road-has-a-caller]].

`lib/marks.js` and `MARKS` in `lib/runs.js` stand under `.claude`, where the
hand working that ticket writes nothing. Their own cases in
`test/level0/apply.test.js` read them alone, and they leave together.

### The marks survive a restart

`MARKS` names `.se/.runtime/marks.json`, and no box writes it.

### The mark holds line spans

`spanned` keeps a span beside the whole hash, and no read sets one.

## The door reaches a helper

A subagent's writes go through the same `tool.call` chain, so the door reads
them the way it reads the session's own. A live run against client 2.1.267
watches it
refuse a helper's `Write` over `Contraction`.

That helper then writes the same text through `printf` in Bash. The write door
hooks `Write`, `Edit` and `MultiEdit` alone, so a shell reaches past it. The
Bash door reads that road, for a helper and for a session alike.

## The formatter applies itself

A formatter that asks permission is a formatter somebody skips. So the door
sends a code write through Biome and passes the formatted text on with
`next({ ...e, content })`.

The agent writes its own text and the tree stores what the formatter says, the
way a save-time formatter works for a person.

## The size ceiling

A function holds one thing and a file one topic, and `spec/config/level0.json`
names the ceiling of each in lines under `code`. `lib/size.js` counts both over
a brace language. A function opens where a line names one and a brace opens,
and it closes where the brace depth comes back. A brace in a string or a
comment counts none.

| who reads it | what it does |
|---|---|
| the code door | refuses a write that grows past a ceiling, and names the function or the file and its lines |
| `./RUNME.sh check` | names what stands past a ceiling as a warning, so the panel draws it, the check fails and the warnings list holds it |

The door reads the text before and after the write. A file already past its
ceiling takes a cut and refuses a growth. So the tree's debt shrinks with every
write and grows with none, and `./RUNME.sh lint src test` names it.

### A verb cuts the file

`./RUNME.sh split <file>` takes the ranges a caller names and writes each into
its target, leaving the rest in the source:

| the flag | what it takes |
|---|---|
| `<file>` | the file the cut reads |
| `--to <path> --lines <from>-<to>` | one target and its range, named again for each target |
| `--dry` | the cuts it names, on the way to no write |

The source is the first word standing outside a flag and its value. A call
naming none comes back refused, and so does a source that is a target too,
because that cut writes over what it reads. A target named twice comes back
refused too, because the second cut writes over the first.

`src/scripts/split-cut.js` owns the ranges and the cut over text, and
`src/scripts/split-verb.js` writes them. One journal entry under `by: split`
holds every target and the rest, so `mcp__level0__undo` takes the whole cut
back. For details, see [[spec/design_output/apply#the-journal-holds-both-halves]].

### The ceiling names the cut

A refusal naming the file ceiling names `./RUNME.sh split <file>`, the verb
that cuts the file. The write stays refused. A function ceiling alone names no
cut. `src/bridge/code.js` owns the refusal.

## The path a rule reads

Hand every rule the path the repo root holds. Vale scopes on it.

| what the client sends | what the door hands on |
|---|---|
| `C:\...\quackitect-v5\spec\rationales\a.md` | `spec/rationales/a.md` |
| `spec/rationales/a.md` | `spec/rationales/a.md` |

Keep every folder in that path, so `[spec/rationales/*.md]` and each other
`.vale.ini` section matches what Vale reads at `--path`.

Ask git for the root once a session, through `git rev-parse --show-toplevel`,
and take it off the front with `relativeTo`. Leave the path whole where the box
answers nothing.

## A rule refuses a list

Give `refuses` one label, or a list of them. `ShapeFits` names each shape and
refuses all but prose, so the model picks the shape and the rule refuses every
shape that is not prose.

# The standing layer

`prompt.context` computes the blocks a conversation's first message carries. It
fires once, and again when the context clears, which is where the guidance, the
handover and the canary arrive.

The system prompt's sections stay free for guidance that depends on where the
work stands.

## The examples ride the rules

A guidance note's `Examples` table follows its rules into every block the
rules reach. That is the standing layer, a helper's prompt, a kind's layer and
the output style. `rulesOf` in `lib/guidance.js` writes the numbered rules and
the table under them, so every reader carries one shape. The canary counts the
rules alone, because a row shows a rule and adds none.
[[spec/guidance/guidance]]

## The style carries a note

The client sends an output style with every request and reminds the model of
it during the conversation, where a context block arrives once. So a guidance
note carrying `style: true` in its frontmatter goes into the style, and the
projection writes `.claude/output-styles/level0.md` from every such note.

| who reads | what it gets |
|---|---|
| the session | the standing block without the flagged notes, and the style beside it |
| a helper | every note in its prompt, because a subagent reads no style |
| the canary | the count of every note, because the style holds the session too |

The style sits in the cached prefix, so the same text costs full price once a
session. A line injected into a user turn sits behind the cache line, and it
costs full price every turn. So the style carries the rules, and no hook does.
`guidanceHere` in `src/bridge/guidance.js` splits the standings, and
`styled` in `lib/guidance.js` reads the flag.

## The canary

A session says out loud that level zero holds it. A session saying nothing
stands outside the cage, and that failure costs this tree several cloud rounds
already.

    level0 holds this session: 53 rules, 6 notes, the stop hook on.

The numbers come out of the standing block, so an agent says the line correctly
only where the block reaches it. That is the whole of the proof. Where the stop
hook stands off, the line ends `the stop hook off`, so the sentence says which
cage this is.

On the first `turn.complete` of a session, level zero reads the answer's first
line for that sentence:

| what it finds | what it does |
|---|---|
| the sentence, with its own numbers | one `info` line, door `level0` |
| a sentence with other numbers | one `warn` line carrying both |
| no sentence | one `warn` line saying the canary opens no answer |

So the log carries the canary as well, and a person reads it later without
watching the session run. `./RUNME.sh standing` ends with the same sentence,
because `canary` builds it in `lib/guidance.js` and both callers read it there.

## The canary opens an answer

The line stands first in the answer, and the stop line stands last. A line
quoted further down proves nothing, because an agent repeats the words of an
older answer anywhere. The start and the end keep the doors apart. The canary says
level zero holds this session, and the stop line says a reason to end the turn
stands. One line stands for the other nowhere. For details, see
[[spec/design_output/stop#the-two-lines-stand-apart]].

## The canary owes a debt

The log alone holds nobody. A session skipping the line runs free to the end,
and the owner reads the failure long afterwards. So the sentence carries a
debt, and the cage holds the session to it.

The debt opens where the first `turn.complete` carries an answer the canary
opens no line of. `canaryIn` reads the first line and answers `same`, `other`
or `none`. The first one alone pays. A line with other counts comes out of a
block the session lacks, so it owes what silence owes.

While the debt stands, `tool.call` warns once and then refuses, the way a
demand with a grace of one does. For details, see
[[spec/design_output/stop#the-grace]].

| the call | what it meets | the `gate` line |
|---|---|---|
| the first | a warning after its result | `warned <tool> before the canary` |
| every one after | a refusal naming the debt | `refused <tool> before the canary` |

The refusal carries the sentence itself, so the session reads what to say. Any
later answer opening on it clears the debt. That answer writes the `info` line
the whole canary writes, and every call passes again. The debt ends no turn:
the answer paying it says what the agent does next and the work goes on.

These roads stay open, because this session's own debt reaches past them:

- a subagent carries a canary of its own, so `e.agentId` passes
- `AskUserQuestion` is the road to the owner, so `reachesTheOwner` passes
- `godPasses` wraps the door, so the binding at `god` passes the refusal

The probe after a compaction pays nothing. It reads the canary through
`heardCanary` on a session holding the line already, so a second debt stays
shut.

## The debt survives a restart

A restart is ordinary. `reload.js` restarts the server where the code under its
roots moves, so a session working on level zero's own code meets it often. The
box dies with the process, and the harness session runs on. A debt held in the
box alone comes back at every restart, and the gate then asks a session that
says the line already.

So the debt stands in the session log, which rotates at a session start. The
marks it reads are there already: the paid line `onTurnSaid` writes, and the
compaction line `onSessionCompact` writes.

| the last mark in the log | what the box reads back |
|---|---|
| the paid line | the debt stands clear, and the gate stays quiet |
| the compaction line | the debt stands, and the gate asks again |
| neither | the debt stands, and the gate asks again |

`afterARestart` in `src/bridge/guidance.js` builds the session a restart takes,
and `sessionHere` is the one place calling it. A session opening on
this box reaches `onSessionStart` instead, which writes the state fresh.

A compaction opens the debt again and takes the payment off with it, so the
line lands once more after one.

## The line lands once

A turn holds open while the agent works. A debt clearing at the turn's end
alone asks again at every call inside that turn. The agent then writes the line
into message after message, where the point of it is one line out loud.

So the debt clears where the line lands. The bridgehead posts each step's text
as `turn.said`, the door reads it, and the first step opening on the sentence
pays:

| what the door reads | what it does |
|---|---|
| a step opening on the line | pays the debt, and writes the `info` line |
| a step opening on the line once it stands paid | writes the `warn` line naming the repeat |
| a step without it | leaves the debt as it stands |
| an answer at the turn's end | pays it, or opens it on the first turn |
| a step from a helper | nothing, because a helper carries its own |

The mark stays paid for the session. A later answer without the line opens no
second debt, so the sentence stands once, wherever the turn ends.

## The helper takes the guidance

A subagent reads no standing layer of its own, so `agent.spawn` hands it one.
The hook prepends the session's own standing text to the spawn's prompt, under
the heading the session reads, and puts the task under `# Your task`.

One guidance file then binds every agent in the tree, and no helper reads a
second copy. `forHelper` in `lib/guidance.js` builds the text, and the log
writes one `agent` line naming the type it reaches.

The rules a helper writes under are the rules the write door holds it to, so
the two now say the same thing.

# The owner's prompt comes first

The opening rules of `spec/guidance/working.md` hold exactly as well as a
session remembers them. So a door holds them instead.

## What the door reads

The door opens a demand for what a person waits for. It holds every
`tool.call` past the demand's grace while nothing pays it. What pays it:

| what pays | when |
|---|---|
| any text the chat shows | `classic.MessageDisplay` fires for it, before the call under it |
| a call to `mcp__level0__report` with the text | at once, between calls |
| the turn's last text | at `turn.complete`, where the demand still stands |

The client posts `classic.MessageDisplay` for every text it shows, a text
between calls among them. Each event carries that text under `delta`, and
`onMessageDisplay` pays the demand with it. So a chat answer pays the door on
its own, and the call under it passes.

The other roads stay. The transcript behind `$.session.messages()` flushes
late, sometimes a turn late. The step's stream carries text for the first step
alone. The bridgehead still posts the last texts of the transcript on a
hold. The door pays on any text since the demand that fits, so a flush landing
late pays too.

A prompt's demand keys on the prompt itself. At `prompt.submit` the bridgehead
reads the id of the newest transcript row, and the demand holds it. On a hold
the bridgehead posts the transcript rows, each with its role and id. The door
counts an agent text past the next owner row alone. A transcript carrying no
ids pays a prompt nothing, because a flush a turn late hands an older text. The
display road then pays alone.

## What counts as owed

- A prompt a person opens a turn with, or sends mid-turn, at `prompt.submit`.
- An update a person asks for: `ask.wanted` moving away from `quiet`. A full
  ask pays on a text in the shape of `spec/config/status.yaml` alone.

The door reads the key at every `tool.call`, so a button pressed mid-turn
reaches the next call. The latest demand replaces the one before it, and an
unpaid prompt stands ahead of an ask. The hold
is no demand: it stands in the stop door. For details, see
[[spec/design_output/stop#the-hold]].

## A note answers its prompt

A prompt asking for a note takes a parked note as its answer. `namesNote`
reads the prompt for the word `note`, outside a fence, beside `questionsIn`
and `opensATurn`, which read a prompt the same way. The demand then holds the
count of `note` rows the log carries at that moment.

The note lands from the shell, so the server's own rows carry none of it. The
door reads the session log from the disk at every call and counts the rows of
kind `note`. A count past the one the demand holds pays it. The reply line
carries the newest note's own text, so the next demand sees what the log
carries.

| the prompt | what pays it |
|---|---|
| one asking for a note | a note row, or a text answer |
| every other prompt | a text answer alone |

## The first call asks

A prompt opens its demand with no grace, so the first call after it asks the
bridgehead for the texts. The prompt's own event carries the warning. The door
answers the prompt with its text opening on the `warns` line, and the
bridgehead hands that event on. A mid-turn prompt otherwise waits behind the calls in
flight, and the owner asks twice. The cost: a hand calling a tool before it
writes the reply meets a refusal, writes the reply, and calls again.

| the demand | the calls it lets pass |
|---|---|
| the owner's prompt | none |
| the owner's ask for an update | `grace.update`, one at least |

An ask pressed while a prompt stands unpaid waits for the pay, so the first
call still meets the gate. A call with nothing new comes back refused. The
refusal quotes the last text seen and its length, so a stale read and a wrong
reply read apart. `AskUserQuestion` and the report tool pass the hold.

Each refusal writes a `gate` line at `debug`, because the agent reads the
refusal itself.

## The reply line

The pay writes the text as the `reply` line at `info`, once, with `answers:
<the demand>` in the detail. The turn's end writes the last text as a reply
where no pay stands. For details, see
[[spec/design_output/log#the-answer-under-its-prompt]].

The owner reads the chat, and a hook writes no chat text. So a mid-turn answer
goes to both places. The chat pays the door, and the report carries the same
text into the log.

| the road | what it gives |
|---|---|
| the chat | the owner reads the answer, and the door takes it as paid |
| the report | the log carries the answer, where a retro reads it |

The refusal and the report's result say both. Either road pays the demand at
once, so no call after one meets the door.

## The owner binds god

`engine.binding` at `god` lets every hold of this door through, with a `god`
line at `info` in its place. For details, see
[[spec/design_output/level0#god-mode]].

## Which prompt opens a turn

`e.origin.kind` says who asks. `opensATurn` in `lib/answer.js` names the kinds
carrying a person. A routine's prompt belongs to the person behind it.

Every other kind is a machine talking to the session, and a machine waits. The
tooth submits prompts under `plugin`, and a session owes no readback to itself.

`unclassified` stays out. The engine hands it both a person's socket and its own
delivery receipts, so a door reading it bites the wrong turn.

## An Agent call runs behind

A helper the turn waits on holds every prompt behind it. So `onAgent` in
`src/bridge/agent.js` refuses an `Agent` call carrying `run_in_background:
false`, and names the background road. The door reads the flat field, the way
the command door reads `command`.

| the call | what it meets |
|---|---|
| `run_in_background: false` | a refusal naming `run_in_background: true` |
| the field absent, or `true` | a pass |
| a helper's own call | the same door |

## A spawn names its tier

A helper on the model of the session costs that model for work a lighter one
does. So the session weighs the work it hands, and the `Agent` call names the
model of that tier. The door refuses a call naming no model, and the session
picks the model.

| tier | the work | the model in `spec/config/level0.json` |
|---|---|---|
| find | find, list, read and report | `helper.find` |
| change | a scoped change with its test, or a review against a list | `helper.change` |
| decide | a design, an unknown cause, or a verdict the owner reads | `helper.decide` |

`src/bridge/agent.js` owns the tiers. The tools block carries a line naming
each tier and its model, so a spawn names the model before the door asks.

| the call | what it meets |
|---|---|
| `model` names a tier's model | a pass |
| `model` absent, or a model of no tier | a refusal naming each tier and its model |
| a config naming no tier | a pass, and the door stays off |
| a helper's own call | the same door |

`agent.spawn` writes the model of each spawn to the log at `info`. The retro
reads the tier against the rework, and a tier doing its work twice moves up in
the config.

## What the refusal says

    The owner asked something and nothing has answered it. Write the answer in
    the chat, as text: what you understood and what you do next. Then work.
    The chat pays this door the moment it shows that answer.
    The log takes the answer from the chat, so the log tool answers nothing.

The refusal opens with the demand. The rest is the rule in its own words, and
a refusal quoting the rule teaches it better than a refusal naming it. `SAYS`
in `.claude/skills/level0/lib/answer.js` holds these words, and a case there
asserts each line of them.

## Where it must not bite

- A turn nobody opens.
- A turn the session has already answered, in one line or many.
- A helper's call. A subagent's `tool.call` carries `agentId`, and a helper owes
  the owner no readback.
- `AskUserQuestion`, which reaches the owner itself. A door refusing it stops a
  session from asking the one thing it needs.

`answer.enabled` in `spec/config/level0.json` turns the door off, the way the judge
and the tooth turn off. A rule nobody can turn off stops the tree on the day it
reads something wrongly.

The door sits inside the write door's own `tool.call` hook, after the log line
and before the linting. The engine refuses a second `tool.call` hook carrying no
matcher, so one hook holds both.

## Guidance a variable switches on

A guidance note names the environment variables it waits for:

    env:
      - CLAUDE_CODE_REMOTE
      - SE_CLOUD

Level zero hands that note over where one of them carries a value. A note
naming none binds every box, and `0`, `false` and an empty string count as no
value.

The variable does the deciding, so a new kind of box needs a new note and no
code. `spec/guidance/cloud.md` waits for the two above, which is how a cloud
session reads its own rules and a desk session skips them.

`./RUNME.sh standing` reads the same variables, so setting one shows a person
exactly what that box reads.

## Why rules stay out

A projection writes the rules into a file, and a guard then has to keep that
copy honest. A copy nobody can edit needs no guard.

# The gate reads the answer

The turn's end runs the answer through Vale under the `*answer.md` section of
`.vale.ini`, and the score of what comes back cuts into bands. The reply
already stands on screen when `turn.complete` fires, so that gate refuses
nothing. It re-prompts, it carries a line into the next prompt, or it does
nothing at all. The stop door reads the same answer before the turn ends,
and it holds a rewrite.

The measurement behind the bands stands in
[[spec/funnel/a-paragraph-has-a-schema]].

## The score is a rate

The score of an answer is its findings a thousand words, over the words standing
outside every fence. A fence belongs to the formatter and the compiler, so it
counts for nothing on either side of that division.

A short answer scores high on one finding. Twenty words and one finding read as
fifty, which stands over the ceiling. So the owner tunes the values against
the answers a session writes.

## The three bands

`answer.warnAt` and `answer.ceiling` in `spec/config/level0.json` hold the two
edges, and the score falls into one of the bands below:

| the score | what happens |
|---|---|
| under `warnAt` | nothing |
| from `warnAt` up | the findings ride the next tool call |
| from `ceiling` up | the stop door holds the turn with the findings |

An answer carrying no finding reads clean, whatever its length. Every band
writes one `draft` line at `debug` naming the score and the findings. The ceiling names
the band `rewrite` in that line, and nothing more hangs on it.

## The findings ride the call

- Outcome: the gate submits no prompt, so no answer prints twice.
- Cause: an answer in the chat is out the moment the session sends it.
- Holder: `gateOf` in `lib/answer.js` keeps the findings of the last answer.
- Ride: the session's next tool call carries them as context, once, in the wording `gateNote` writes.
- Lint: `check_answer` reads a draft before it goes out, and the guidance sends every long draft there.

## What the gate says

    The voice rules refuse this answer. Write it again.

      level0-answer.md:1:7  PastTense
        wrote: was
        Write the present tense: 'was'.

    Hold PastTense for the rest of this turn: apply the same rule to every line
    you write next, and fix the lines you already wrote if they break it.

The score reaches the log line alone. A finding names a rule and a line, and the
agent repairs both. A rate names nothing to fix, so the refusal leaves it out and
the retro reads it from the log.

## The tool reads a draft

`check_answer` takes one draft, runs it through the answer register as
`level0-answer.md`, and answers the findings in the wording above. A draft
coming back clean meets the gate clean, so the tool closes the gap a gate
refusing nothing leaves open.

The tool registers at the session's start, and `spec/guidance/working.md`
carries the line that sends a session to it.

`readsAnswer` in `src/bridge/answer-read.js` holds the reading, and the tool
and the stop door both call it.

## The stop holds a rewrite

The server's `classic.Stop` door runs `gatesAnswer` over the turn's last text,
after the handover and before the tooth. A draft in the `rewrite` band holds
the turn, and the block carries the findings in the wording above. Any other
band passes on to the tooth.

- A helper's stop passes ahead of the gate, so Vale reads no helper's answer.
- The turn's end asks for no needs table, which a stop for the owner carries alone.
- `answer.enabled` at false takes the gate out.
- The gate counts its holds in a row, and past `stop.mostInARow` it lets the turn go.
- A clean read or a let-go turn starts the count again.

The limit is the tooth's own, so the gate holds no turn without end. Each stop
of the session's own runs Vale over the answer once.

## A note reads clean first

`check_prose` does for a note what `check_answer` does for an answer. It takes
`path` and `text`, reads the draft through the write door's own rules, and
answers every finding at once:

| what it reads | where that stands |
|---|---|
| the rules over a draft | `proseFaults`, exported from `src/bridge/write.js` |
| the findings a note keeps | `readsProse`, under `src/bridge/prose.js` |
| the wording of the answer | `answerFindings`, beside `refusal` |

The door calls `proseFaults` too, so one read serves both and a clean draft
passes the door on its first write. The tool writes nothing, so it takes the
wording `check_answer` takes, and the refusal wording stays with the door.

`src/bridge/prose.js` holds the spec and the handler, and exports the `SPECS`
and `TOOLS` pair `src/bridge/server.js` imports for each bridge module.

# The question comes first

A prompt carrying a question gets its answer first, in a table a reader takes in at a glance.
The count comes from the prompt, and the table check reads the answer against
it. Both stand in `lib/answer.js`, beside the door, because Vale reads no
session state.

For the argument, see [[spec/funnel/a-paragraph-has-a-schema]].

## The door counts the questions

`prompt.submit` counts the sentences of the prompt closing on `?` outside a
fence, for the kinds `opensATurn` names. The count holds for the turn, and a
prompt from a machine leaves it standing. So a re-prompt from the gate or the
tooth leaves the count alone.

## The table answers every question

The gate and `check_answer` read the first block of the answer against the
count. The block is a table, its header names `question` and `answer`, and its
body holds one row a question.

| the answer opens with | what the check says |
|---|---|
| a table naming the two columns, with rows enough | nothing |
| prose, a heading or a list | the answer opens with no table |
| a table naming other columns | the header reads the wrong names |
| a table short of a row | the table holds too few rows |

A count of zero demands no table. A question the session cannot answer still
takes its row, and the answer cell says what blocks it. The finding reads
`QuestionTable`, and it joins the findings of Vale, so one score weighs both.

# The owner answers by number

- Outcome: the owner answers a stop with numbers alone.
- Holder: three shape checks in `lib/answer.js`, read by the gate and `check_answer`.

## The needs table

- Outcome: a numbered needs table closes every answer ending on a stop call.
- Finding: `NeedsTable`.
- Teacher: the stop texts in `lib/stop.js`.

| the check reads | what it demands |
|---|---|
| the heading | `What the agent needs`, at any level |
| the columns | `No.`, `question` and `proposed answer`, in order |
| the first cell of a row | 1, 2, 3 in order |
| every other cell | no code, and `CELL_WORDS` in `lib/answer.js` words at most |
| the body | one row at least, and one saying nothing waits where nothing does |

## The cap counts the prose

- Outcome: an answer past `answer.words` meets a rewrite.
- Count: every word outside a fence and outside a table row.
- Finding: `AnswerLength`. A missing value leaves the cap off.

## A shape finding rewrites

The gate asks for a rewrite on any shape finding, whatever the score. The shape
findings read `QuestionTable`, `NeedsTable` and `AnswerLength`. A rate lets one
finding in a long answer pass, and a shape finding holds no rate.

# The rules past one buffer

Vale hands a rule one buffer, so a rule weighing more than one file stands outside it.
Vale reads a shell script once `[formats]` names the ending, and the leading dot
carries that mapping: `.ps1 = md` reads the file, and a bare `ps1 = md` answers
`unsupported extension`.

Both kinds reach a person the same way, through the command line and the panel:

| the rule | where it lives |
|---|---|
| a rule weighing two files | `.claude/skills/level0/lib/tree.js` |
| a rule over a shell script | `spec/config/styles/VoiceScript` |

For details, see [[spec/design_output/tree#the-rules-over-two-files]].

`NoPathInScript` refuses an interpolated path on a line running an inline
script. Git Bash hands node a path beginning `/c/`, node reads it as a folder
under the drive root, and it resolves to a place nobody has. Changing into the
root first and passing a relative path holds under either shell.

That fault stands in this tree twice over: once from a cloud box, and once from
a hand writing the same shape a week before.

# A name meets the cap

A heading, a file name, a folder name and a branch name each hold the words
`names.words` caps. Vale counts a heading, through `ShortHeading`, and refuses a dash or a
colon inside one through `OneTitle`, because both turn one title into two.

Vale reads what a file holds, and its path stays outside that. So
`.claude/skills/level0/lib/names.js` counts a name instead. The mint refuses a
long ticket name, and `NameHoldsTheWords` holds every path git tracks.
For details, see [[spec/design_output/tree#the-rules-over-two-files]].

The config holds the cap as `names.words`, and the caller hands it to
`overLong`.
For details, see [[spec/design_output/config#a-caller-hands-it-in]].

# A broken rule says so

Vale answers a broken rule file with an `E201`. It writes that to standard
error and leaves standard output empty, so a reader parsing JSON alone finds no
breach. So one broken rule turns every rule in the tree off, and the tree
answers that the rules pass.

`faultIn` in `lib/vale.js` reads that answer, and `./RUNME.sh lint` stops on it.
The write door reads a lint that runs nowhere the same way, whatever the fault:

| what stands | what the door does |
|---|---|
| a broken rule, an answer other than JSON, a spawn that falls, a timeout | refuses a prose write, names the fault, and writes it to the log at `warn` |
| the same fault over a write outside prose | lets it land, so the hand mending a rule file writes it |
| no Vale on the box | lets the write land, and says so in the log once |

# Where a rule lives

| folder | holder |
|---|---|
| `spec/config/styles` | Vale reads its style folders, and `.vale.ini` says which style reaches which path |
| `spec/config/styles/colours.json` | the window reads it, as [[spec/design_output/tui#colours]] says |
| `spec/config/biome.json` | Biome reads it |

The comments in `.vale.ini` say why each section stands.

The prose rules stay away from a rule file, because such a file lists the
words they refuse.

## Script runs meet a bound

Vale bounds each run of a script rule by a fixed span of wall time, and no
setting moves it. A run waiting for the processor spends that span as well. So
a script reading a whole large file in one run meets the bound first, once the
rest of a lint crowds the processor.

`VocabularyEntry` reads each list under `spec/vocabulary` in one run, and
`core.yml` holds the whole core. The lint over the tree runs every file beside
it:

| the run over `core.yml` | with a pattern compiled per entry | with each pattern compiled once |
|---|---|---|
| on a box standing still | 650 ms | 160 ms |
| beside a second lint of the tree | past the bound, in every round | inside it, in every round |
| beside four loops holding the processor | past the bound, in every round | inside it, in every round |

`text.re_match` compiles its pattern on every call. So a script compiles each
pattern once, at its top, with `text.re_compile`, and matches through what that
answers.

# The fixer calms a shout

`./RUNME.sh fix` runs a round at a time until the tree stops moving. Each round
calms every shout this tree finds, then hands the file to `vale fix --apply`.

Vale carries the actions below, and none of them folds case:

| action | what it does |
|---|---|
| `suggest` | offers a spelling |
| `replace` | writes the swap value, expanding `$1` |
| `remove` | drops the match |
| `edit` | trims, replaces, truncates, splits or runs a regex |
| `convert` | lowercases and drops the punctuation |

So `ShoutedLead` carries no action, and `.claude/skills/level0/lib/shout.js` makes the fix
from the line and the column Vale already reports. Vale skips a code fence and
honours an exemption marker, so the finding it hands over carries both for free.

The calming runs first because Vale writes `DON'T STOP AT ALL HERE,` into
`Do not STOP AT ALL HERE,`, which no longer opens with a run of capitals. Round
two then catches the contraction the calming uncovers.

## One replacement per matched text

Two swap entries matching the same text collapse to one, and the first entry
wins for both. So a fix depending on what follows the match belongs to a person.

`etc.` is that case: its full stop ends the sentence as often as it ends the
abbreviation. It sits in `EtCetera.yml`, which carries no action, and the four
short forms that read the same everywhere keep theirs.

## Vale refuses overlapping fixes

Vale drops both fixes and names the overlap. A token reaching past its own word
costs the fix beside it, so every token here stops at its own edge.

# The tense reader

Vale tags a verb with a small tagger, and reads a present form like `set`,
`put` or `straight` as past at a line start. Each of those costs a round of
refusal, and a list of exceptions grows one word at a time. The tense reader
stands behind Vale's finding with one general veto:

| the form | the reader says |
|---|---|
| its own lemma, `set`, `put`, `read` | present on its face, and the finding falls |
| its -s or -ing form, `skips`, `standing` | present on its face, and the finding falls |
| another form, `wrote`, `did`, `failed` | past, and the finding stands |

`src/engine/tense.js` reads the line the finding stands in through wink-nlp,
which hands a lemma a token. More vetoes ride the same reader, in
`src/bridge/prose.js`. The doors reading prose call that one entry: the
write door, the draft check and the commit message. The check and the terminal
push door take the tense veto alone, through `readThrough` in
`src/bridge/findings.js`, so a push carries the list the check reads. A `vale`
line at debug counts what the reader lets stand. The model's build costs half
the load, so the first read builds it, and a verb reading no prose skips the
build.

| Vale finds | the reader says |
|---|---|
| a past form | present on its face, where the form is its own lemma or its -s or -ing form |
| a sentence or a list item past the cap | under the cap, counted with a code span and a link as one word each |
| a word outside the lists | on a list, where its lemma stands there |

The tagger carries no more than that. It reads a participle standing as an
adjective, `a refused call`, as a verb like any other. So those stay on the
rule's exception list in `spec/schemas/paragraph.schema.yaml`. A bench under
`.se/scripts` runs both readers over every note, and it is the way to read a
change to either.

The dependency is one node package and its English model, named in
`package.json`. The install fetches them under `modules`, and the server
loads them once.

# What the cage loads

Level zero fills its state once: the linter it runs, the config it reads, the
guidance it hands over, the rules the tooth votes on. Every door then reads that
state.

A session filling none of it holds every door open. `bin` stands at null, the
write door skips the lint inside `if (bin)`, and the call passes. The tree reads
green throughout, because `./RUNME.sh check` carries its own Vale and asks the
plugin nothing.

So the load stands in `loadCage`, and it answers more than one question in place of one:

| the load meets | the cage answers |
|---|---|
| a linter it finds | the write door reads a write |
| a linter it misses | the cage holds nothing |
| guidance it reads | the session carries the rules |
| guidance it misses | the cage holds nothing |

Every fault goes into one list, and the throw comes last, so a cage missing one
thing still holds everything else it reads.

`ensureCage` wraps that load in a `try`, and any door asks it. The first door to
ask pays for the load, and the rest take the answer. A session the harness
resumes carries no `session.start`, so the first `tool.call` loads the cage
instead, and the session repairs itself before it writes anything.

The engine refuses `$` handed to a function nested inside `register`, so both
stand at the top of the file and take the state as an argument.

# God mode

`engine.binding` set to `god` lets every blocker through, and leaves every
answer standing. The server decides it in one place, on the way out of
`decide`, so no door knows about it:

| the door answers | god mode |
|---|---|
| a refusal, `result.deny` | passes, one debug line |
| a hold, `needs: reply` | passes, one debug line |
| a block of the turn's end | passes, one debug line |
| context, a rewrite, a tool's result, a register | stands |

So the index still answers a search, the guidance still rides, and the tools
still stand. What falls is the check on the agent. The line reads `god mode
lets the refusal of Write through`, and names the reason it lets through. A
demand paid by nothing stands until the turn's end, which pays it as ever.

# The wait returns on signals

`mcp__level0__wait` returns on the first signal the table below names, and at
its cap where none comes. A hand asks it where it writes a loop of sleeps today.

| the field | the signal |
|---|---|
| `agent` | the helper's report stands on the box |
| `output` | the file stands quiet past `wait.quiet`, or the process `pid` names exits |
| `files` | every named file stands quiet past `wait.quiet` |

A helper's stop is its report. `helperReports` in `src/bridge/wait.js` writes
a `report` row to the log with the helper's `agentId`, and keeps the id on the
box for the wait. A file stands quiet while its size and its stamp hold, and
the span counts from the last change the wait sees. The process door's
`alive` reads a process's end off its number.

`wait.most` in `spec/config/level0.json` caps the wait in seconds. The wait
looks at its signals once a second, and the clock decides the rest, so a case
drives it on the fake clock.

The bridgehead stamps a wait with `since`, the moment of its first post, and
posts it again under the same stamp where the host cuts it. The box keeps the
watch a stamp begins, so a post again carries on its signals, and the cap
counts from `since`. The older loop ends once a later post takes the watch.
