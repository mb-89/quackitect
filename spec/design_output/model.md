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

| the segment | what it takes | such as |
|---|---|---|
| `<key>` | one segment | `ops/<id>` |
| `<key...>` | the rest of the name, one segment or more, and it stands last | `files/<path...>` |

A module declares a family the way it declares a name, and the registration's
name carries the key segment. `matches` in `src/q/q.go` answers each key in its
place.

# The topics the index holds

| the topic | who writes it | what it holds |
|---|---|---|
| `files/<path...>` | the watch door | the contents and hash of each file git tracks, by path |
| `buffers/<path...>` | the LSP door | the text of a file an editor holds open and unsaved, by path |
| `clock/minute` | the clock door | the time, cut to the minute, and a push each minute |
| `session/<id>/` | the inbound doors | the events of a session, and the values its folds answer |
| `session/alarms` | the index, off its watchdog | the alarms standing, per [[spec/design_output/watchdogs#the-alarms-standing]] |
| `cfg/` | the config module | every config key, as its layers resolve it |
| `ops/<id>` | the ops module | the operations, per [[spec/design_output/operations]] |
| `index/` | the index | the catalog as rows: `index/names`, `index/actions`, `index/docs` |

A door writing `files/`, `buffers/`, `clock/minute` and `session/` itself stands
as proposal (d) in [[spec/funnel/the-owner-rules-the-specs]], and `q.Given` for those topics alone as (k). A
check reading a path reads its buffer where one stands, and its file otherwise.

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
pending.

# The events of a session

`session/<id>/events` is the family the inbound doors land events in. Every
event carries one shape, `q.Event`:

| the field | what it holds |
|---|---|
| `seq` | the event's place in its session, rising by one |
| `at` | the time off `clock/minute`'s door, to the millisecond |
| `kind` | the harness's name for it, such as `tool.call` or `prompt.submit` |
| `harness` | the harness sending it, such as `claude-code` or `copilot` |
| `hand` | the box, the session and the agent, where the harness names one |
| `fields` | the event's own payload, as the harness sends it |

# A fold keeps its state

A fold registers with a step over one event:

    q.Fold("session/<id>/fill", 0, func(state int, event q.Event) int { ... })

| what holds | how |
|---|---|
| the state | the fold's value, one per key of its family, in the index's database |
| the place | the `seq` of the last event the step reads, which the database keeps beside the state |
| a restart | the index reads the state and its `seq`, and hands the step each event past it |
| the step | pure: it reads the state and the event, and calls nothing |

A fold reads no other name. A value reading a fold and another name is a
`q.Derived` over both.

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
check's answer before the push. `then` stands as proposal (a) in
[[spec/funnel/the-owner-rules-the-specs]], and `q.NoUndo` as (b).

The index runs the calls. The module's action answers the list as its commit.
The index sends each call to the doors process in order, and holds the writer
queue of [[spec/design_output/operations#one-writer-per-tree]]. A module names a
door call, and addresses no door.

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
row in the window's `index` tab. Stopping short of git stands as proposal (c) in
[[spec/funnel/the-owner-rules-the-specs]].

# A module meets the index

A module package stands under `src/modules/<topic>`. It speaks to the index and
to nothing else. It reads its inputs off the snapshot, and a door call leaves
it inside an action's commit alone, which the index runs. So its one peer, the
index, has a fake, and every test of the module runs against that fake. An
agent working a module reads the module and the names it reads, and nothing
past them.

# The fake index

`q/qtest` is the fake index. It runs one module in memory:

| the step | what it does |
|---|---|
| build | a catalog off the module's `Register` alone, and the catalog check over it |
| seed | the inputs a case names: `files/`, `buffers/`, `cfg/`, `clock/minute` and `session/` events |
| run | a derived provider, a fold over the seeded events, or an action with its input |
| assert | the commits the run makes, and the list of door calls an action answers |

A door call in the list takes the answer the case hands it, so a `then` reads
it. The harness opens no database, no disk, no git and no port.

The `onlyq` analyzer in [[spec/design_output/go-doors#the-build-checks-imports]]
holds a module and its tests to `q`, `q/qtest` and the pure standard library. A
fixture file rides in through `embed`, or the case seeds it.
