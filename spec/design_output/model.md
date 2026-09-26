---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

The index model: names, providers and defaults, the provider kinds, snapshots
and revisions, actions as door calls, the catalog check at start, and `quack
why`. Every later phase of [[spec/design_input/the-migration-runs-in-slices]]
builds on this note. The rules stand in
[[spec/design_input/the-index-holds-the-model]], and this note gives them their
shape.

# A name

A name is a path of lowercase segments, such as `work/open-tasks`. The first
segment is its topic, the module folder that provides it.

| the part | what it holds |
|---|---|
| the name | the path, unique in the catalog |
| the type | the Go type of its value, which the catalog records |
| the default | the value a reader gets while no provider answers |
| the provider | the one registration answering it |
| the deadline | `q.Deadline`, or the default of its kind |
| the doc | `q.Doc`, which every surface shows |

A family is a name with a key segment, such as `ops/<id>` or
`session/<id>/fill`. The catalog holds a family once, with one provider, one
type and one default. Keys come and go inside it, so the index adds no name at
runtime.

# The topics the index holds

| the topic | who writes it | what it holds |
|---|---|---|
| `files/` | the watch door | the contents and hash of each file git tracks, by path |
| `clock/minute` | the clock door | the time, cut to the minute, and a push each minute |
| `session/<id>/` | the inbound doors | the events of a session, and the values its folds answer |
| `cfg/` | the config module | every config key, as its layers resolve it |
| `ops/<id>` | the ops module | the operations, per [[spec/design_output/operations]] |
| `index/` | the index | the catalog as rows: `index/names`, `index/actions`, `index/docs` |

Every inbound call carries a session id. A name that depends on the caller
stands under `session/<id>/`, such as `fill`, `rows` and `hand`. So a stale
claim reads `clock/minute`, and the hand reads the caller's box off its own
session.

# The provider kinds

| the kind | what it answers | when it runs |
|---|---|---|
| `q.Derived` | a function of its inputs | when an input moves |
| `q.Fold` | a state reduced over the events of `session/`, one event at a time | when an event lands |
| `q.Action` and `q.Op` | a list of door calls | when a caller calls it |

A provider runs once at a time, and a change during a run leaves one run
pending. A fold keeps its state and the last event it reads in the database,
so a restart resumes it where it stands.

An alternative provider stands in a file of its own, and registers with
`q.Alt("work.remote")`. The config key `providers.<name>` picks one at start,
and the registration with no `q.Alt` stands where the key is empty.

# Snapshots and revisions

The model carries one revision, and every commit raises it.

| the step | what holds |
|---|---|
| input | the index reads every input at one revision, and hands the struct over |
| run | the provider reads the struct alone |
| commit | the output names the revision it reads, and lands in one transaction |
| a change during the run | the commit lands, and the next run starts at once |

So a value always reads as a function of one consistent snapshot, and a busy
input still lets values through.

# An action lists calls

An action answers an ordered list of door calls. Each call names the door, the
verb, the arguments and its undo:

| the field | what it holds |
|---|---|
| `door`, `verb`, `args` | the call, as `door.<door>.<verb>` takes it |
| `undo` | the door call that takes it back, or `q.NoUndo` with the reason |
| `then` | a function the index calls with the answers, which answers the next list |

`then` keeps each step pure where a later call depends on an earlier answer. A
hand-back writes, stages, commits and runs the check, and `then` reads the
check's answer before the push.

A call that fails stops the list. The index runs the undo of every call before
it, newest first, and the action fails with the reason.

# The catalog check

The index checks the catalog at start, and refuses to start on a fault:

| the fault | what the refusal names |
|---|---|
| a name with two registrations | both files and lines |
| a name with no default | the file and line |
| two providers active for one name | both, and the config key that picks |
| an input naming no name in the catalog | the struct field, and the name |
| an input whose type differs from the name's type | the field, and both types |
| a cycle among derived names | the names round the cycle |
| a view reading or calling what the catalog lacks | the base file, and the key |

The check starts the index, so a fault shows before a merge.

# `quack why`

The index keeps the file and line of each registration, so it answers where a
value comes from:

| the part of the answer | what it holds |
|---|---|
| the value | the value, and whether a provider answers it, it stands at its default, or it stands stale since a time |
| the provider | its registration, and the file and line |
| the inputs | each input's provider, down to `files/` paths, `session/` events and `clock/minute` |
| the readers | every provider, view and surface reading it |

The same answer stands as the agent tool `index/why`, and as the details of a
row in the window's `index` tab.
