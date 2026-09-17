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

Level zero is two pieces. The bridgehead, `hooks/level0.js`, is the module the
client loads, and the one hook a project carries: one door for every event,
`*`, and one function behind it. It posts each event to the server at the
port, with the root the session works in, and does what the answer says. It
imports nothing, so a project carries the file alone. The project knows
nothing of where the method stands on the disk.

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
| nothing, the server down | hands the event on, and writes one `warn` line, once |

The server is plain node under `src/bridge`, one file a topic, and the header
of each file says which door it holds. `server.js` holds the doors, god mode
and the switch in `decide`. The server holds every door of this note, and the
module before the bridgehead stands nowhere.

The log, the index and Vale stand behind doors under `src/doors`. The server
logs every event at `debug`, whole, and holds the state in one box a work
root. `./RUNME.sh serve` starts it, and `--inspect` on that verb opens it to
the debugger. The launch config `the server` starts it under the editor's
debugger, so a break in `decide` binds, pauses, and takes new breaks while
the agent runs.

A server killed and running again takes the next event as its own, because
the bridgehead holds no state and no connection. So the session goes on across
every restart of the server, and the client reloads the bridgehead for no
change of a door. Three headless turns say so, against client 2.1.269:

| turn | what it shows |
|---|---|
| the first | posts 186 events |
| the second | completes with the server down |
| the third | lands on the server running again |

## The cloud starts the server

Nobody presses the hook button on a cloud box. So the pull that takes a
branch there ends on the server, through `src/scripts/serve.js`. It probes
the health answer at the port the pointer names. Where nothing answers, it
starts the server detached, the way the stub's bridgehead does. The pull's
last line says which of the three stands:

| what stands | the line says |
|---|---|
| the server answers | the port it answers at |
| the start runs | that the server starts detached, and why |
| the start fails | the shell's last line |

A desk pull starts nothing, and a take that fails starts nothing.

The line it runs is the bridgehead's own, imported from the hook. So one text
starts the server on both roads, and one table names what each code says. The
stub's bridgehead keeps a copy, because that file imports nothing.

## The bridgehead starts it too

The take verb reaches a cloud box that pulls work. A cloud session opening on
a prompt reaches no verb at all, so the bridgehead carries the same start. The
session's first event answers nothing, the `warn` line lands, and the start
road runs once.

The road is one shell line, because the hook imports nothing and stands outside
node. The shell reads the environment itself and answers a code:

| the code | what stands | what the log carries |
|---|---|---|
| 3 | no cloud variable, so a person starts it | nothing |
| 4 | the method root stands nowhere | one `warn` line |
| 5 | the box carries no node | one `warn` line |
| 6 | the setup brings no modules | one `warn` line |
| 0 | the server starts behind the session | one `info` line |

`CLAUDE_CODE_REMOTE` and `SE_CLOUD` say a box is a cloud box, the same pair the
cloud guidance binds on. The operating system decides nothing here, because a
person at a local box wants the button and a cloud box wants the server.

The call comes back in milliseconds: the line backgrounds the server and sends
its output to `.se/log/serve.log`, so a session start waits for nothing. The
server answers the next event in about a second. A first event landing before
it stands reads no rules, and the log names the piece that misses.

The bridgehead installs nothing. The setup installs, and a box whose setup runs
nowhere says so on the line the table above names.

## A fix reaches the session

The server imports its doors and its libs once, so a fix to one reaches no
running session by itself. So the server reads its own code at the first
event, under the roots `src/bridge/reload.js` names, and reads it again after
every tool run. A file that differs restarts the server through the road the
`/restart` request takes, and the log names the file. The next event lands on
the new code, and the session goes on as above.

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
- Door: a helper gets no reply line, no canary, no stop vote and no gate. So nothing from level zero prompts after a standing stop.
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
| no line in `./RUNME.sh log` | every door in the module stays silent |
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
[[spec/design_output/level0#a-step-carries-the-answer]].

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
| the code read as text, built with `Function` | the sandbox refuses code built from a string |
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

## Three roads to a compaction

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
course writes a second `context` line in `./RUNME.sh log`, with `reason` at
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

`tool.call` reads every Write and Edit. A breach comes back as `{ deny }`
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
| `./RUNME.sh check` | names what stands past a ceiling as a warning, so the panel draws it and the check allows it |

The door reads the text before and after the write. A file already past its
ceiling takes a cut and refuses a growth. So the tree's debt shrinks with every
write and grows with none, and `./RUNME.sh lint src test` names it.

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

Give `refuses` one label, or a list of them. `ShapeFits` names three labels and
refuses two, so the model picks the shape and the rule refuses every shape that
is not prose.

# The standing layer

`prompt.context` computes the blocks a conversation's first message carries. It
fires once, and again when the context clears, which is where the guidance, the
handover and the canary arrive.

The system prompt's sections stay free for guidance that depends on where the
work stands.

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
`guidanceHere` in `src/bridge/guidance.js` splits the two standings, and
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
older answer anywhere. The two ends keep the two doors apart. The canary says
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

While the debt stands, `tool.call` behaves the way the owner's prompt door
behaves. For details, see [[spec/design_output/level0#one-warning-then-a-refusal]].

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
`tool.call` after the first while nothing pays it. Three things pay it:

| what pays | when |
|---|---|
| the first text of a turn | `classic.MessageDisplay` fires for it, before the first call |
| a call to `mcp__level0__report` with the text | at once, between calls |
| the turn's last text | at `turn.complete`, where the demand still stands |

A text written between calls pays nothing on its own. The client hands it to
no hook until the turn ends. The transcript behind `$.session.messages()`
flushes late, sometimes a turn late. The step's stream carries text for the
first step alone. The bridgehead still posts the last four texts of the
transcript on a hold. The door pays on any text since the demand that fits,
so a flush landing late pays too.

## What counts as owed

- A prompt a person opens a turn with, or sends mid-turn, at `prompt.submit`.
- An update a person asks for: `ask.wanted` moving away from `quiet`. A full
  ask pays on a text in the shape of `spec/config/status.yaml` alone.

The door reads the key at every `tool.call`, so a button pressed mid-turn
reaches the next call. The latest demand replaces the one before it. The hold
is no demand: it stands in the stop door. For details, see
[[spec/design_output/stop#the-hold]].

## A note answers its prompt

A prompt asking for a note takes a parked note as its answer. `namesNote`
reads the prompt for the word `note`, outside a fence, beside `questionsIn`
and `opensATurn`, which read a prompt the same way. The demand then holds the
count of `note` rows the log carries at that moment.

The note lands from the shell, so the server's own rows carry none of it. The
door reads the session log off the disk at every call and counts the rows of
kind `note`. A count past the one the demand holds pays it. The reply line
carries the newest note's own text, so the next demand sees what the log
carries.

| the prompt | what pays it |
|---|---|
| one asking for a note | a note row, or a text answer |
| every other prompt | a text answer alone |

## The first call is free

The response in flight when a demand lands can carry the answer as its first
text. So the first call after the demand passes, with the demand as context.
Every call after it asks the bridgehead for the texts. A call with nothing new
comes back refused. The refusal quotes the last text seen and its length, so a
stale read and a wrong reply read apart. `AskUserQuestion` and the report tool
pass the hold.

Each refusal writes a `gate` line at `debug`, because the agent reads the
refusal itself.

## The reply line

The pay writes the text as the `reply` line at `info`, once, with `answers:
<the demand>` in the detail. The turn's end writes the last text as a reply
where no pay stands. For details, see
[[spec/design_output/log#the-answer-under-its-prompt]].

The owner reads the chat, and a hook writes no chat text. So a mid-turn answer
goes to both places. The agent writes it in the chat as text, and calls the
report with the same text for the log. The refusal and the report's result say
so. The report pays the demand at once, so no call after it meets the door.

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

## What the refusal says

    The owner sent a prompt. The owner asked something and nothing has
    answered it. Say back what you understood and what you do next, then work.

The refusal opens with the demand. The rest is the rule in its own words, and a refusal quoting the rule teaches it
better than a refusal naming it.

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
`.vale.ini`, and the score of what comes back cuts into three bands. The reply
already stands on screen when `turn.complete` fires, so the gate refuses
nothing. It re-prompts, it carries a line into the next prompt, or it does
nothing at all.

The measurement behind the bands stands in
[[spec/funnel/a-paragraph-has-a-schema]].

## The score is a rate

The score of an answer is its findings a thousand words, over the words standing
outside every fence. A fence belongs to the formatter and the compiler, so it
counts for nothing on either side of that division.

A short answer scores high on one finding. Twenty words and one finding read as
fifty, which stands over the ceiling. So the owner tunes the two values against
the answers a session writes.

## The three bands

`answer.warnAt` and `answer.ceiling` in `spec/config/level0.json` hold the two
edges, and the score falls in one of three bands:

| the score | what happens |
|---|---|
| under `warnAt` | nothing |
| from `warnAt` up | the `answer` line at `warn`, and the findings ride the next tool call |

An answer carrying no finding reads clean, whatever its length. Every band
writes one `answer` line naming the score and the findings. The ceiling names
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
agent fixes both. A rate names nothing to fix, so the refusal leaves it out and
the retro reads it from the log.

## The tool reads a draft

`check_answer` takes one draft, runs it through the answer register as
`level0-answer.md`, and answers the findings in the wording above. A draft
coming back clean meets the gate clean, so the tool closes the gap a gate
refusing nothing leaves open.

The tool registers at the session's start, and `spec/guidance/working.md`
carries the line that sends a session to it.

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

Vale hands a rule one buffer, so a rule weighing two files stands outside it.
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
`.claude/skills/level0/lib/names.js` counts a name instead. `branch new` refuses a
long branch, and `NameHoldsTheWords` holds every path git tracks.
For details, see [[spec/design_output/tree#the-rules-over-two-files]].

The config holds the cap as `names.words`, and the caller hands it to
`overLong`.
For details, see [[spec/design_output/config#a-caller-hands-it-in]].

# A broken rule says so

Vale answers a broken rule file with an `E201`. It writes that to standard
error and leaves standard output empty, so a reader parsing JSON alone finds no
breach.

So one broken rule turns every rule in the tree off, and the tree
answers that the rules pass.

`faultIn` in `lib/vale.js` reads that answer, and `./RUNME.sh lint` stops on it.

# Where a rule lives

| folder | holder |
|---|---|
| `spec/config/styles` | Vale reads it, and `.vale.ini` says which style reaches which path |
| `spec/config/biome.json` | Biome reads it |

The comments in `.vale.ini` say why each section stands.

The prose rules stay away from a rule file, because such a file lists the
words they refuse.

# The fixer calms a shout

`./RUNME.sh fix` runs a round at a time until the tree stops moving. Each round
calms every shout this tree finds, then hands the file to `vale fix --apply`.

Vale carries five actions, and none of them folds case:

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

`src/bridge/tense.js` reads the line the finding stands in through wink-nlp,
which hands a lemma a token. Two more vetoes ride the same reader, in
`src/bridge/prose.js`. The three doors reading prose call that one entry: the
write door, the draft check and the commit message. A `vale` line at debug
counts what the reader lets stand.

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

So the load stands in `loadCage`, and it answers two questions in place of one:

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

