---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

Operations: the handle a longer action answers, its states, the one writer per
tree, and what stays for how long. The rules stand in
[[spec/design_input/the-index-holds-the-model#operations-carry-a-handle]], and
this note gives them their shape.

# An action declares its length

Each action says at registration whether it answers at once or with a handle,
so a caller knows the shape before it calls:

| the declaration | what a call answers | such as |
|---|---|---|
| `q.Action` | the result, within the action's deadline | `tickets/set-field`, `work/place` |
| `q.Op` | a handle, `ops/<id>`, at once | `work/pull`, `check/run`, `retro/write` |

A read takes no handle, and the cage's answer inside a hook stays a plain
action.

# The handle is a name

`ops/` is a family the catalog declares once, and the ops module provides it.
Each call of a `q.Op` action adds a key under it, so the catalog stays whole.
The id sorts by start time.

| the field | what it holds |
|---|---|
| `action` | the action's name |
| `input` | the input the caller hands it |
| `caller` | the session id of the inbound call |
| `state` | `queued`, `running`, `done`, `failed` or `cancelled` |
| `progress` | the steps done, the steps known, and one line on the step in hand |
| `deadline` | when the watchdog ends it |
| `result` | the action's output, once it stands `done` |
| `error` | the reason, once it stands `failed` or `cancelled` |
| `undone` | the undo steps the run takes back, in order |

A caller watches `ops/<id>` or reads it, the way it reads every name.

# The states

| the move | who makes it | what follows |
|---|---|---|
| to `queued` | the call | the handle goes back to the caller |
| `queued` to `running` | the writer queue, or at once for an action that writes nothing | the module process takes the input snapshot |
| `running` to `done` | the last door call answering | `result` stands |
| `running` to `failed` | a door call failing, a process ending, or the deadline passing | the undo steps run, newest first |
| `queued` or `running` to `cancelled` | `ops/cancel` with the handle | a running one stops before its next door call, and its undo steps run |

The index pushes each move, and the session log carries it as a row of kind
`op`.

# One writer per tree

An action that makes a writing door call declares `q.Writes`. Writing
operations queue one at a time per checkout, in the order they arrive. A
reading operation runs beside them.

A git hook reads names alone. So a hook the operation's own commit fires reads
and answers, and waits behind nothing.

# An operation outlives callers

A caller that ends leaves its operation running. Another client reads the result
by name, such as a new session reading the pull an old one starts.

The index keeps each operation in its database. At start it moves every one
standing `queued` or `running` to `failed`, with the reason that the index
restarts, and runs the undo steps of each running one. So an operation in
flight at a crash ends loud.

# What stays how long

| the operation | stays | the config key |
|---|---|---|
| `queued` or `running` | until it ends | none |
| `done` or `cancelled` | a window | `ops.keep.done` |
| `failed` | a longer window | `ops.keep.failed` |

The session log keeps every move past both windows. The foundation adds each
key and its default to `spec/config/level0.json`.

# The surfaces

| the surface | a `q.Op` call |
|---|---|
| the command line | `quack run work/pull` follows the handle and prints its progress, and `--detach` prints the handle alone |
| HTTP | `POST /v1/actions/work/pull` answers `202`, with the handle's path under `/v1/values` |
| MCP and the hook module | the tool answers the handle, and `ops/wait` answers once it ends or at its cap |
| a view | the last line draws the state until it ends |
