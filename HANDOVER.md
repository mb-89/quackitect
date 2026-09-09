---
kind: [[handover]]
status: held
urgency: now
---

# Level zero reaches further

Both rules stand. One measurement takes a third of this branch with it: level
zero holds nothing at all on the client this box runs. So the branch starts by
putting the write door back on its feet.

# What the run measures

Every line here comes from client 2.1.267 on 2026-09-09. A probe plugin writes
one file per hook event, and live runs drive level zero itself. The design
record carries the same four under the harness surface.

## The file surface renames itself

The names move:

| what this tree calls | what the client offers |
|---|---|
| `$.fs.readFile` | `$.fs.read` |
| `$.fs.writeFile` | `$.fs.write` |
| `$.fs.listDir` | `$.fs.list` |

The old three answer `undefined`. A hook calling one throws, the engine skips
that hook, and the chain carries on without it.

So level zero writes no stamp, writes no log line, reads no guidance and holds
no write door. The prompt stays quiet about it, and the tree passes every check
it has.

`claude plugin validate` passes either spelling, because it reads which nouns
the source touches. `/plugin-types` writes the running build's declarations,
and it answers by itself what this tree keeps measuring by hand.

## A subagent brings no session

| what a subagent fires | what reaches it |
|---|---|
| `session.start` | nothing, the session fires it once |
| `prompt.context` | nothing, so the standing layer misses it |
| `tool.call` | the session's own hooks, `agentId` set |

One module instance holds a whole run: the session, and every subagent inside
it. So half this branch stays. A helper reads no standing layer of its own.

## The spawn takes a rewrite

`agent.spawn` fires once per subagent, before its model resolves. A hook
calling `next({ ...e, prompt })` hands the subagent the new prompt, and
`next(e)` resolves to `{ model }`.

A live subagent quotes the first rule of the guidance back, word for word, and
names the six notes behind it. So `agent.offer` stays unwritten, and the other
road stays shut.

## The door reaches a helper

A helper's `Write` comes back refused over `Contraction` in a live run, because
a helper's calls pass through the same `tool.call` chain.

That helper then writes the same line through `printf` in Bash, and the door
reads nothing. The door hooks `Write`, `Edit` and `MultiEdit` alone.

So a shell holds the way past it, for a helper and for a session alike. That
gap stands today, and it belongs to a branch of its own.

# What stands in the tree

- `lib/answer.js`, the rule the answer door reads, with tests of its own.
- `forHelper` in `lib/guidance.js`, the text a spawn carries.
- The `agent.spawn` hook, and the answer door inside the write door's hook.
- `answerFirst` in `spec/config/level0.json`.

## Where each proof lands

| what the brief asks | where it lands |
|---|---|
| `./RUNME.sh check` passes | green, and it validates the plugin |
| both measurements stand, with the date | `spec/design_output/level0.md` |
| a helper carries the guidance | a live run, quoted back |
| the first call refuses, the second passes | a live run, and a test |
| a plugin's prompt refuses nothing | a test, through `e.origin.kind` |
| `answerFirst` turns the door off | a live run, and a test |

# Where answering first reads wrongly

One place, and the door lets it by. `AskUserQuestion` reaches the owner itself,
so a door refusing it stops a session from asking the one thing it needs. No
other tool in this tree answers anybody.

A helper's call passes too. A subagent's `tool.call` carries `agentId`, and a
helper owes the owner no readback.

`unclassified` stays outside the set of origins that open a turn. The engine
hands that kind a person's own socket and its own delivery receipts alike, so a
door reading it bites turns nobody opens.

# The retro

## What surprises me

The measurement the brief asks for decides less than the one nobody asks for. A
third answer comes back with the two: the surface this tree stands on moves out
from under it, and every green check reads otherwise.

The canary catches a session level zero misses. It catches nothing about a
session level zero holds badly. A canary reads the standing layer, the standing
layer comes through `prompt.context`, and that path touches no file at all.

`turn.step` fires after its own step's tool calls run. A door built on it holds
the second turn and lets the first one through, and the first one is the turn
that matters.

## The dead ends

`$.fs.writeFile` in the probe, twice over. The probe goes silent, the plugin
loads, `claude plugin list` says so, and no file appears. `claude --debug`
alone names the throw, and a plain `-p` run prints none of it.

A second `on("tool.call")` carrying no matcher. The engine refuses two, and
names the line of the first. So the answer door sits inside the write door's
hook, after the log line and before the linting.

A closure handed to a helper function. `claude plugin validate` refuses `$`
passed to anything but a function declared at the top of the file. So the probe
gives up its little `note` helper, and every hook spells the write out.

## What a next box reads

- The shell holds the way past the write door. `printf > file` writes what
  `Write` refuses.
- `$.env.get` stands on the surface now, so `readEnv` can stop shelling out to
  `node -e`.
- The trust gate still keeps level zero out of an ordinary cloud session. Every
  proof here runs under `claude --plugin-dir`.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
