---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

The answer protocol between the hook module and the index. The hook module
stays JavaScript, because the harness loads a hooks module alone. It forwards
each event to the hooks door, and does what the answer says. The cage moves onto
this protocol in the phase [[spec/design_input/the-migration-runs-in-slices#the-phases]]
names for it.

# A post and its answer

The hook module posts each event to the hooks door, over HTTP on the doors
process's loopback port. The standing file names the port and the token.

| the field | what the post carries |
|---|---|
| `event` | the harness's name for the event, such as `tool.call` or `prompt.submit` |
| `e` | the event as the harness hands it |
| `session` | the session id, and the agent id where a helper fires it |
| `root` | the checkout the session stands in |
| `fill` | the context's tokens, on the main agent's `tool.call` and `classic.Stop` |
| `before` | the id of the newest transcript row, on `prompt.submit` |
| `tools` | the hash of the tool list the hook registers |

The door writes each field it reads as an event under `session/<id>/`, so the
fill and the rows reach the index as values. The answer is a list of effects,
and the hook module runs them in order.

# The effects

| the effect | what the hook module does |
|---|---|
| `pass` | hands the event on as it stands |
| `event` | hands on the changed event the answer carries |
| `after` | merges blocks of context into what the harness answers, such as the rules on `prompt.context` |
| `result` | answers the call itself, and hands nothing on: a refusal or a tool's result |
| `block` | holds the turn's end, with the reason |
| `log` | writes the line to the harness's own log, through `ui.log` |
| `clear` | lets the turn end, runs `clear`, and submits the prompt the effect carries |
| `tools` | reads the tool list again and registers it, where the hash differs |

# An effect asks back

Some effects need what the hook module alone reaches. Each carries a `call`
id, and the hook module posts the answer back as `hook.back` with that id. The
door then answers the effects that follow.

| the effect | what the hook module reaches | what it posts back |
|---|---|---|
| `rows` | the newest transcript rows, as role, id, whether it holds results, and the agent's text | the rows |
| `spawn` | an agent the harness spawns, with the prompt and the type the effect names | its text, whether it errs, and the refusal |
| `classify` | `model.classify`, with the ask, the labels and the model | the label |

A round of asks stops at the cap the door sets, and the last answer stands. So
the answer gate reads the rows it asks for, and the pull's judge runs through
`classify` in place of its own road in `pull-tool.js`.

# A step streams once

The hook module reads the stream of a step, and hands every chunk on as it
comes. At the step's end it posts `turn.said` once, with the count of each
chunk kind and the text. So a chunk costs no post, and the answer gate reads the
whole step.

# The tool list

The build writes every action the registry marks for agents into
`.se/.runtime/hook-tools.json`: its name, its doc and the schema of its input.

| the moment | what the hook module does |
|---|---|
| session start | registers every tool the file names, before any post |
| a tool call | posts it as every event, and the door calls the action |
| an answer carrying `tools` | reads the file again, and registers the difference |

So the tools stand before the index answers, and a tool call meeting a door
that stands down gets the cage's refusal. Copilot takes the same list over MCP.

# No door answers

| what the hook module meets | what it does |
|---|---|
| no answer on the port | runs `quack start`, which starts the index and the doors where none answers |
| still no answer | refuses a guarded call, names the alarm, and passes the rest |
| every case | writes a row to the session log file, which the index reads in when it starts |

For the refusal, see [[spec/rationales/the-cage-refuses-while-down]].
