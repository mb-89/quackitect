---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

The watchdogs of the model: the leases, the deadlines, the stale marks, the
restarts and `session/alarms`. The rules stand in
[[spec/design_input/the-index-holds-the-model#every-part-holds-a-lease]], and
this note gives them their shape.

# A lease

Every process, door and provider holds a lease the index keeps:

| the field | what it holds |
|---|---|
| `part` | the process, the door or the provider, by name |
| `renewed` | the time of the last heartbeat |
| `term` | how long a lease stands past its last heartbeat |

The work loop sends the heartbeat on `lease.<part>`, as a step of the loop
itself. An idle loop takes a tick through the same queue as its work. So a hung
loop sends nothing, even while a timer beside it runs. For the subject, see
[[spec/design_output/inner-protocol#names-become-subjects]].

# Deadlines

Each name and action declares its deadline with `q.Deadline`, and each kind
carries a default under `watchdog.deadline.<kind>` in the config.

| the kind | what the deadline holds |
|---|---|
| `q.Derived` and `q.Fold` | a provider with a pending input commits within it |
| `q.Action` | the action answers within it |
| `q.Op` | the operation ends within it, per [[spec/design_output/operations]] |

A run past its deadline gets cancelled, its undo steps run where it is an
action, and the index restarts its process.

# A stale mark

A lease that expires marks its part stale:

| the reader | what it meets |
|---|---|
| a `get` | the last value, with `stale since <time>` |
| a view | the value and the badge in grey |
| `quack why` | the provider, and the time its lease expires |

The next commit of the part clears the mark.

# Restarts

The index restarts a process whose lease expires, and waits longer before each
restart of the same process. A run of faults inside a window raises an alarm,
and the restarts stop until the alarm clears.

| the config key | what it sets |
|---|---|
| `watchdog.backoff.first` | the wait before the first restart |
| `watchdog.backoff.cap` | the longest wait |
| `watchdog.faults` | how many faults raise an alarm |
| `watchdog.window` | the span those faults fall inside |

The foundation adds each key and its default to `spec/config/level0.json`.

# `session/alarms`

`session/alarms` holds the alarms standing, one row a part:

| the field | what it holds |
|---|---|
| `part` | the part that stops |
| `since` | the first fault of the run |
| `faults` | the faults in the window |
| `error` | the last error the part gives |
| `clears` | the command that clears it, such as `quack restart work` |

The sidebar draws each alarm. The hook module hands the alarms to the agent in
each prompt's context. A refusal of the cage names the alarm it stands on.

# The watcher of the watchdog

The index holds a lease too, and these parts watch it:

| the watcher | what it does when the index's lease expires |
|---|---|
| the doors process | restarts the index, with the same wait and alarm rules |
| the hook module | runs `quack start` where no door answers, and the cage refuses meanwhile |

Every expiry, restart and alarm lands in the session log as a row of kind
`watchdog`.
