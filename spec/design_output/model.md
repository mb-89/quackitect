---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

The target architecture, whole. It covers the index and its modules, the IO
modules, operations, watchdogs, the inner protocol, the processes, the surfaces,
the views and the hook protocol. The old system calls an IO module a door. Each
part stands in a chapter of its own, and the rules stand in
[[spec/design_input/the-index-holds-the-model]]. The order of the migration
stands in [[spec/design_input/the-migration-runs-in-slices]].

# The index and its modules

The index model: the core, the contract every module keeps, and names with
their writers. It covers the provider kinds, snapshots and revisions, actions as
requests to IO modules, the resolution at start, config off the registrations,
and `quack why`. Every later phase of [[spec/design_input/the-migration-runs-in-slices]]
builds on this note. The rules stand in
[[spec/design_input/the-index-holds-the-model]], and this note gives them their
shape.

## The whole system

The parts, and which of them touch the world outside:

```mermaid
flowchart LR
  outside[("disk, git, processes, network, time, Vale, Biome")]
  subgraph io["modules with the io flag"]
    watch["watch"]
    disk["disk"]
    clock["clock"]
    envio["env"]
    hooks["hooks"]
    lsp["lsp"]
    manager["index, the manager, always loaded"]
  end
  subgraph compute["modules without the flag"]
    tickets["tickets"]
    config["config, always loaded"]
    queue["queue"]
    holds["holds"]
    work["work"]
  end
  core["the index core: resolves, stores, takes a write from its writer, snapshots, pushes, answers built-in values"]
  wiring["spec/wiring.yaml, read at start"]
  wiring -. "names the instances, and binds their ports" .-> core
  outside <--> io
  io -- "commits its names, takes requests" --> core
  compute -- "reads a snapshot, commits its names" --> core
  core -- "pushes changes" --> io
  core -- "pushes changes" --> compute
```

An IO module alone reaches past the index, and every module reaches another
through the index alone.

## A name

A name is a path of segments in the index, such as `work/open-tasks`. The wiring gives it, per [[spec/design_output/model#the-wiring-file]]. It is a
standard name a wire binds, or `<instance>/<port>` for an out-port with a wire
to a port or with no wire.

A module names everything locally: its in-ports, its out-ports and its config
keys. It spells no other module's name or path, and its reads name local ports too. The
wiring binds each port to a name, and a config key stands under
`<instance>/config/<key>`, such as `queue/config/weight`.

| the part | what it holds |
|---|---|
| the name | the path, unique in the catalog |
| the type | the Go type of its value, which the catalog records |
| the built-in value | the value a reader gets while no provider answers |
| the writer | the one out-port the wiring binds to it |
| the deadline | `q.Deadline`, or the deadline its kind's config key holds |
| the doc | `q.Doc`, which every surface shows |

A family is a name with a key segment, such as `ops/<id>` or
`session/<id>/fill`. The catalog holds a family once, with one writer, one
type and one built-in value. Keys come and go inside it, so the index adds no name at
runtime.

| the segment | what it takes | such as |
|---|---|---|
| `<key>` | one segment | `ops/<id>` |
| `<key...>` | the rest of the name, one segment or more, and it stands last | `files/<path...>` |

An out-port declares a family, and its local name carries the key segment. `matches` in `src/q/q.go` answers each key in its
place.

## The index core

The core knows no name's meaning, and holds no business logic, no input layer
and no `q.Given`. [[spec/design_input/the-index-holds-the-model#every-part-is-a-module]]
names what it does, and the code holds it in `src/q`:

| what the core does | where it stands |
|---|---|
| resolves each read to its writer | the catalog, at start, per [[spec/design_output/model#the-index-resolves-in-passes]] |
| stores name to value | `Store` |
| takes a write from the name's registered writer alone | `Commit`, which names the writer and refuses every other name |
| hands out one snapshot | `Snapshot` |
| pushes changes | `val.<name>` on the bus, per [[spec/design_output/model#the-inner-protocol]] |
| settles each change in one wave, lowest height first | the scheduler, per [[spec/design_output/model#one-wave-settles-a-change]] |
| answers the built-in value | where no value stands, or where its writer runs nowhere, with the mark `not provided` |



## A module registers five groups

Every module, an IO module among them, registers these groups at `Register`:

```mermaid
flowchart LR
  module["a module, one file"]
  module --> inputs["inputs: its in-ports, by local name"]
  module --> outputs["outputs: its out-ports, by local name, each with its built-in value"]
  module --> config["config: its keys, each with a type, a built-in value and help"]
  module -.-> state["state: its insides, for diagnosis, later"]
  module -.-> debug["debug: its diagnosis flags, later"]
```

| the group | how a module declares it | built |
|---|---|---|
| inputs | its in-ports: the struct fields a provider reads, each with the tag `q:"<port>"` by local name, and the events a fold takes | now |
| outputs | its out-ports: each `q.Derived`, `q.Fold` and `q.Action` it registers by local name, with its built-in value | now |
| config | `q.Cfg(key, builtin, help)` by local name, the type read off the built-in value | now |
| state | `q.State(name, reader)`, its insides, readable for diagnosis | later |
| debug | `q.Debug(flag, help)`, a switch for a diagnosis | later |

State and debug stand in the contract now, and no code builds them yet. A module
writes its registered outputs alone, and the core refuses a commit naming
another. A module knows nothing about where its config values come from. It
reads a key like any other input, per
[[spec/design_output/model#config-comes-off-the-registrations]].

## The wiring file

`spec/wiring.yaml` is the one place that knows the global layout, and the index
reads it at start. A project a vehicle drives carries no wiring file. It loads
the file of the vehicle whose runtime folder holds the index binary, per
[[spec/design_output/vehicle#a-vehicle-and-its-project]]. The file lists the instances to load, and binds each port:

| the part | what it holds |
|---|---|
| an instance | a name and its module type, such as `queue: { module: queue }`. The type is the registration name of one file, here `src/modules/queue/queue.go`, and no folder. One type runs as two instances with different config |
| a wire to a standard name | `tickets.all: tickets/all` and `queue.rows: tickets/all`. Ports on one standard name connect, and neither side knows the other |
| a wire port to port | `work.places: queue.places`. The index still names the value by its writer, `queue/places` |
| an out-port with no wire | readable as `<instance>/<port>` |
| an in-port | a wire, or the mark `built-in` in the wiring. The start refuses anything else |
| a name | one writer, and any number of readers |

An alternative calculation is another module type, and a wire binds it to the
same name. The wiring replaces the selection by `providers.*` config keys.

```mermaid
flowchart LR
  subgraph modules["each module knows its own ports alone"]
    tall["tickets.all, out"]
    qrows["queue.rows, in"]
    qmin["queue.minute, in"]
    qplaces["queue.places, out"]
    wplaces["work.places, in"]
    wopen["work.open-tasks, out"]
    cmin["clock.minute, out"]
  end
  subgraph names["names in the index, which the wiring binds"]
    ntickets["tickets/all"]
    nplaces["queue/places"]
    nminute["clock/minute"]
    nopen["work/open-tasks"]
  end
  tall --> ntickets --> qrows
  qplaces --> nplaces --> wplaces
  cmin --> nminute --> qmin
  wopen --> nopen
```

An author writes and tests a module alone: `qtest` feeds its in-ports and reads its
out-ports by their local names. Where each instance runs stands apart, in
[[spec/design_output/model#the-placements]].

## The topics and their writers

The first wiring binds these names, each to one writing instance:

| the topic | the module writing it | what it holds |
|---|---|---|
| `files/<path...>` | the `watch` IO module | the contents and hash of every file in the tree, by path, the runtime files under `.se/` among them |
| `buffers/<path...>` | the `lsp` IO module | the text of a file an editor holds open and unsaved, by path |
| `clock/minute` | the `clock` IO module | the time, cut to the minute, and a push each minute |
| `session/<id>/events` | the `hooks` IO module | the events of a session |
| `session/<id>/` | the modules folding the events | the values the folds answer |
| `<instance>/config/<key>`, each carrying the flag `config` | the config module | every key a module declares, as its layers set it |
| `env/<name>` | the `env` IO module | the `SE_` variables, read at start |
| `tickets/` | the tickets module | every ticket, read off `files/` |
| `queue/` | the queue module | the score, the outline and the places, read off `tickets/` |
| `work/` | the work module | the rows and the count of open tasks, read off `queue/` |
| `hold/` | the holds module | the holds a box keeps, read off `files/` |
| `session/alarms` | the index manager | the alarms standing, per [[spec/design_output/model#the-alarms-standing]] |
| `ops/<id>` | the index manager | the operations, per [[spec/design_output/model#operations]] |
| `index/` | the index manager | the catalog as rows: `index/names`, `index/actions`, `index/docs`, `index/health` |

A check reading a path reads its buffer where one stands, and its file
otherwise.

## Everything on disk mirrors

`files/<path...>` mirrors the whole tree. Two IO modules touch the disk: `watch`
brings each change in as `files/`, and `disk` writes on request. Every other
module reads `files/` through the index.

```mermaid
flowchart LR
  tree[("the tree on disk")]
  watch["watch, flagged io"]
  disk["disk, flagged io"]
  files["files/ in the index, raw bytes"]
  subgraph owners["the modules owning a projection"]
    tickets["tickets: markdown and its frontmatter"]
    config["config: JSON"]
    queue["queue: JSON"]
    holds["holds: JSON"]
  end
  topics["tickets/, queue/, hold/, and every module's config/"]
  tree --> watch --> files --> owners --> topics
  owners -- "serialize, then a write request" --> disk --> tree
```

A structured thing on disk is a projection of `files/` by the module owning it.
The module declares a glob, a codec that parses and serializes, and a kind:

| the files | the module | its codec | its topic |
|---|---|---|---|
| `spec/tickets/*.md` | tickets | markdown with its frontmatter | `tickets/` |
| `spec/config/level0.json`, `.se/.runtime/config.json` | config | JSON, keyed by instance and then by key | every `<instance>/config/` |
| `.se/.runtime/plan.json` | queue | JSON | `queue/` |
| `.se/.runtime/hold/<hand>.json` | holds | JSON | `hold/` |

The kinds carry their direction in their names:

| the kind | the truth | what it covers | when the system writes | when it reads back |
|---|---|---|---|---|
| loaded | the file, which a person edits too | tickets, config, the plan, the holds | on an explicit save | on every change, through `watch` |
| saved | memory | operations, session folds, alarms | behind the scenes, in batches | once at start |
| dump | memory | any prefix, through `quack dump <prefix>`, for diagnosis | on request | not at all |

A saved file restores name by name and type by type, the rule TwinCAT keeps
for its persistent variables:

| what the file holds | what the start does |
|---|---|
| a name no module registers any more | skips it |
| a name whose type changes | refuses it, and reports it |
| no value for a name a module registers | gives the name its built-in value |

No kind loads a file into any name. A load like that gives a name a second
writer, and one owner per name breaks.

A write goes back one way. The owner serializes with the same codec, and sends
a write request to `disk`. The watch then closes the loop.

| the case | what holds |
|---|---|
| a write | it names the revision of the file it read, and `disk` refuses it where the file changes since. The module reads the file again |
| a module's own write, coming back | parsing the same bytes again changes no value, so it costs nothing |
| a large file, or one read rarely | `files/` holds its hash, and the content loads when a module reads it |
| a saved file | it stands in a folder the watch covers, such as `.se/state/` |

The codec is the one code knowing a file format, and it keeps one contract
suite:

| the case | what holds |
|---|---|
| every file committed today | `serialize(parse(file))` equals the file, byte for byte |
| every value a module writes, its edge cases among them | `parse(serialize(value))` equals the value |

So the suite also catches a writer that rewrites a file it leaves unchanged.

## The index manager

The index's own management is a module the index always loads, `index`, under
`src/modules/index`. It holds the supervision of the processes, the leases, the
alarms, the operations and their retention, and it carries `q.IO()`, because it
starts and ends processes. It registers like any module:

| the group | what it holds |
|---|---|
| inputs | every `lease.<part>` heartbeat, and each operation's moves |
| outputs | `index/`, `ops/<id>`, `session/alarms`, and the leases of open contexts |
| config | the `watchdog.*` deadlines and waits, and the `ops.keep*` windows |

For the leases and the alarms, see [[spec/design_output/model#watchdogs]].

Every inbound call carries a session id. A name that depends on the caller
stands under `session/<id>/`, such as `fill`, `rows` and `hand`. So a stale
claim reads `clock/minute`, and the hand reads the caller's box off its own
session.

## The provider kinds

| the kind | what it answers | when it runs |
|---|---|---|
| `q.Derived` | a function of its inputs | when an input moves |
| `q.Fold` | a state reduced over the events of `session/`, one event at a time | when an event lands |
| `q.Action` | a list of requests to IO modules | when a caller calls it |

A provider runs once at a time. A change during a run waits for the next wave,
per [[spec/design_output/model#one-wave-settles-a-change]]. A provider
runs when a name it reads moves, and one reading nothing that moves stays where
it stands. So a save moving one file runs the providers
reading that path alone.

## The events of a session

`session/<id>/events` is the family the `hooks` IO module writes events to. Every
event carries one shape, `q.Event`:

| the field | what it holds |
|---|---|
| `seq` | the event's place in its session, rising by one |
| `at` | the time off the `clock` IO module, to the millisecond |
| `kind` | the harness's name for it, such as `tool.call` or `prompt.submit` |
| `harness` | the harness sending it, such as `claude-code` or `copilot` |
| `hand` | the box, the session and the agent, where the harness names one |
| `fields` | the event's own payload, as the harness sends it |

## A fold keeps its state

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

An alternative calculation is another module type. The wiring binds it to the
name in place of the first, per [[spec/design_output/model#the-wiring-file]].

## Snapshots and revisions

The model carries one revision, and every commit raises it.

| the step | what holds |
|---|---|
| input | the index reads every input at one revision, and hands the struct over |
| run | the provider reads the struct alone |
| commit | the output names the revision it reads, and lands in one transaction |
| a change during the run | the commit lands, and the change waits for the next wave |

So a value always reads as a function of one consistent snapshot, and a busy
input still lets values through.

## One wave settles a change

X feeds A and B, and A feeds B too. A module running on every push runs B once
on the new X and the old A, and then again. So a change settles as one wave, in
an order that stays fixed while the process lives:

| what the index keeps | when it builds it | what it holds |
|---|---|---|
| a module's height | at start, in the passes over the wiring | 0 for a module with no in-ports. Every other module stands one past the highest height among the writers of its in-ports, IO modules among them |
| a name's run list | the first time the name changes | the modules downstream of it, sorted by height |

Both stay until the index restarts, and no list needs clearing, because
modules load at start alone. A change to ports or to the wiring restarts the
index, per [[spec/design_output/model#a-module-rebuilds-alone]]. The passes
refuse a cycle, per [[spec/design_output/model#the-index-resolves-in-passes]], so
every module gets a height. A tick is such a name too, so modules on one tick
share one kept list, run lowest height first.

```mermaid
flowchart LR
  subgraph h0["height 0"]
    watch["watch, flagged io: writes X"]
    clock["clock, flagged io: writes Y"]
  end
  subgraph h1["height 1"]
    A["module A: reads X, writes A"]
    C["module C: reads Y, writes C"]
  end
  subgraph h2["height 2"]
    B["module B: reads X and A, writes B"]
  end
  watch --> A
  watch --> B
  A --> B
  clock --> C
  B --> readers["the sidebar and the window, watching B"]
```

| the step | what holds |
|---|---|
| a commit to names at revision r | marks their run lists pending at r, building a list the first time its name changes |
| a run request | goes to a module once none of its in-ports reads a pending name |
| one height | its modules run in parallel, and the placements decide the processes |
| a change arriving during a wave | waits for the next wave |
| a read | waits on nothing, except the read of an unwatched pending name, which waits for its run and for no write. It gets the last settled value |

```mermaid
sequenceDiagram
  participant I as the index
  participant A as module A
  participant B as module B
  participant R as the readers
  I->>I: X lands at r7, and A and B stand pending
  I->>A: run, reading X at r7
  A->>I: A lands at r8
  I->>I: X lands at r10, and waits for the next wave
  I->>B: run, reading X at r7 and A at r8
  B->>I: B lands at r9, and nothing stands pending
  I->>R: one push, and B reads settled
  I->>I: the next wave starts, with X at r10
```

So B runs once, after A, and a reader sees no half-settled mix. A value settles
once its `from` revision, `cell.from` in `src/q/store.go`, reaches the last
change upstream of it. `quack why` shows `pending since r7` for a value a wave
still holds.

These savings change no result:

| the saving | what holds |
|---|---|
| early cutoff | a commit whose value equals the old one clears the pending marks below it, with no run and no push. The index compares the hash of the serialized form the mirror uses |
| demand | a watched name runs by itself, and an unwatched pending name runs when something reads it |

A name stands watched with a subscriber, a view, or a watched reader below it.
The read of an unwatched pending name is the one read that waits, and it waits
for a run alone, and for no write.

A module that runs when told reads a tick. A tick is a name whose value changes,
such as a counter an action raises, or `clock/minute`. The wiring binds a tick
like any in-port, so no event port stands. A push goes out on a real change
alone. So a tick is a counter or a time, and a flag holding one value moves
nothing.

The waves schedule and hold no business logic, so they stand in the index core
beside the resolution and the push. For the earlier work behind them, see
[[spec/rationales/changes-settle-in-waves]].

## An action lists requests

An action answers an ordered list of requests going out. Each names the IO
module that accepts it, the verb, the arguments and its undo:

| the field | what it holds |
|---|---|
| `module`, `verb`, `args` | the request, as `io.<module>.<verb>` takes it |
| `undo` | the request that takes it back, or `q.NoUndo` with the reason |
| `then` | a function the index calls with the answers, which answers the next list |

`then` keeps each step pure where a later request depends on an earlier answer.
A hand-back writes, stages, commits and runs the check, and `then` reads the
check's answer before the push.

The index runs the requests:

- The module's action answers the list as its commit, and the index sends each
  request, in order, to the IO module that accepts it. It holds the writer
  queue of [[spec/design_output/model#one-writer-per-tree]]. A module names a
  request, and reaches no IO module itself.
- A request that fails stops the list. The index runs the undo of every
  request before it, newest first, and the action fails with the reason.
- The caller receives the answer of the last request. `q.Answers` declares
  its type, and its fields carry `label` and `doc` tags, as an input's fields
  do.

## The index resolves in passes

Modules load in any order, so a wire names a port no instance registers yet.
The index resolves the wiring in passes:

| the pass | what it does |
|---|---|
| the first | matches every in-port with a wire to the out-port writing its name, and leaves the rest open |
| the second | matches what the first leaves open, once every instance registers |
| the start | runs once every in-port has its writer or its `built-in` mark, the types match, and each standard name has one writer |

```mermaid
flowchart TD
  load["the wiring loads, and every instance registers, in any order"] --> first["the first pass matches each wired in-port to its writer"]
  first --> second["the second pass matches what the first left open"]
  second --> open{"an in-port still open, a type apart, or a name with two writers?"}
  open -- "yes" --> refuse["the start refuses loudly, naming the port"]
  open -- "no" --> start["the index starts"]
  start --> running{"its writer runs?"}
  running -- "yes" --> value["the reader gets the value"]
  running -- "no" --> fallback["the reader gets the built-in value, marked not provided"]
```

An in-port still open after the second pass is a bug. The start refuses
loudly, naming the port, its instance, its file and line, and the name. An
instance the wiring names and that runs nowhere leaves no in-port open, such as
one that crashes. Its readers take the built-in value, with the mark `not
provided`.

The index checks the rest of the catalog at start, and refuses on each fault:

| the fault | what the refusal names |
|---|---|
| a name two out-ports write | both ports, and the lines of the wiring |
| a port with no built-in value | the file and line |
| an in-port with no wire and no `built-in` mark | the instance, the port, and its file and line |
| a wired in-port whose type differs from its writer's | both ports, and both types |
| a wire naming a port no instance declares | the line of the wiring |
| a cycle among derived names | the names round the cycle |
| a view reading or calling what the catalog lacks | the base file, and the key |

The check starts the index, so a fault shows before a merge.

## `quack why`

The index keeps the file and line of each registration, and follows the wiring,
so it answers where a value comes from:

| the part of the answer | what it holds |
|---|---|
| the value | the value, and whether a provider answers it, or it stands `pending since r`, stale since a time, or at its built-in value |
| the writer | the out-port writing the name, its instance, and the module file and line |
| the inputs | that instance's in-ports, the names their wires bind, and their writers, down to the IO modules: `files/` paths, `session/` events and `clock/minute` |
| the readers | every provider, view and surface reading it |

The same answer stands as the agent tool `index/why`, and as the details of a
row in the window's `index` tab. The answer stops short of git, which is live
input nowhere, per [[spec/rationales/git-stays-the-archive]].

## Config comes off the registrations

No central config topic stands. A module declares its keys with `q.Cfg` by
their local names, and the framework files each under `<instance>/config/<key>`
for every instance the wiring loads.
That subtopic carries the flag `config`. Each key takes a type, a built-in
value, a help line, and the mark `shared` where the project shares it.

A module knows nothing about where its config values come from. It declares its
keys and reads them like any other input, and its code and its API name no
file, environment, context, override or layer. The config module and the
surfaces alone know the layers, such as `quack cfg show` and a config editor.
In `qtest`, a case seeds a config value the way it seeds any other input.

Every list of keys comes off the registrations:

| what comes off them | what stands today |
|---|---|
| the config schema, `spec/config/level0.schema.json` | a file a person writes by hand |
| the built-in values | the values in `spec/config/level0.json` |
| the slash commands | the projection over the tracked file |
| the command-line help, the window's `index` tab, and a config editor showing every `*/config` subtopic | nothing |

`spec/config/level0.json`, the default file, keeps the values someone sets, and
nothing else. The default file and the local file both key by instance and then
by key, such as `{"queue": {"weight": 3}}`.

The `migration` switches keep a namespace of their own. A `migration` module
declares them as shared keys and holds nothing else, and the queue module reads
`migration/config/<phase>`. So the default file keeps its `migration` block,
and each group's `enabled_by` names its key as it stands.

## The config module

`config` is a small module the index always loads, beside the index manager and
apart from it. The core stays dumb, and the manager stays about the system's
health. The config module owns every name under a `*/config/` subtopic, and
gathers its layers:

| what it gathers | where it comes from |
|---|---|
| the default file and the local file | loaded projections of `files/` |
| `env/<name>`, the `SE_` variables | the `env` IO module, at start |
| the contexts and the overrides | requests it holds in memory |
| the leases of the open contexts | the index manager |

It resolves the layers, and writes the value that wins.

```mermaid
flowchart LR
  files["files/, from watch"] --> config
  env["env/, from the env IO module"] --> config
  requests["the requests opening contexts and setting overrides"] --> config
  manager["the index manager: the leases of open contexts"] --> config
  config["the config module, always loaded"] -- "writes" --> key["queue/config/weight"]
  queue["the queue module"] -. "declares weight, its own name, with its type, built-in value and help" .-> key
  key -- "read as an input" --> queue
```

The `*/config/*` subtopics stand as the one place a module declares names
another module writes. Declaring a key registers an input and its schema. The
config module is the registered writer, and the start resolves it in its passes,
like any other.

## A key's layers

A key's value comes off its layers, and the highest standing wins:

```mermaid
flowchart TB
  override["override"] -- "wins over" --> context["context"] -- "wins over" --> env["environment"] -- "wins over" --> local["local"] -- "wins over" --> def["default"] -- "wins over" --> builtin["built-in"]
```

| the layer | where it stands | how it changes |
|---|---|---|
| override | memory, gone at restart unless saved | `quack cfg set`, or a config editor. `quack cfg reset <key>` or `--all` drops it |
| context | memory, gone when its script ends or crashes | `with cfg.context(weight=9)`, or `quack cfg with <key>=<value> -- <command>` |
| environment | `env/<name>`, the `SE_` variables read at start | the machine's shell |
| local | `.se/.runtime/config.json`, this machine | `quack cfg save` |
| default | `spec/config/level0.json`, the project's file in git | an edit and a commit |
| built-in | the registration of the module declaring the key | its code |

An override is what a person sets, and it wins over every context.
`quack cfg show <key>` prints the whole stack and the layer that wins, the way
`git config --show-origin` does. An edit to a loaded file reloads by itself, and
an override standing keeps winning, with the file values listed under it.

A shared key takes the default file alone, with no local file, environment,
context or override. So the whole project reads it alike. The `migration`
switches are such keys: the `migration` module declares them, and the queue
reads them off `main`, per [[spec/design_output/work#a-switch-holds-a-group]].

Overrides replace the wipe of the local file when a new editor window opens,
which `src/extension/lib/session.js` makes today.

## A context holds a lease

A context is a set of values a script opens for itself, the way a Python
context manager scopes them. It takes a handle and a lease, the lease of
[[spec/design_output/model#a-lease]], and the client that opens it renews it:

```mermaid
stateDiagram-v2
  [*] --> open: the script opens it, and takes a handle and a lease
  open --> open: the client renews the lease
  open --> closed: a normal exit
  open --> closed: a crash, and the lease runs out
  closed --> [*]: its values leave, and readers take the layer below
```

| the case | what holds |
|---|---|
| contexts nest | the inner one wins, and hands back to the outer one on exit |
| two unrelated live contexts set one key | the config module refuses the second one loudly, naming the holder |
| a context closes | the index pushes every reader the layer below |

Nothing about a context reaches the disk.

## A module meets the index

A module is one file in a topic package under `src/modules/<topic>`. It speaks to
the index and to nothing else. It reads its inputs off the snapshot, and a request goes out
inside an action's commit alone. The index hands it to the IO module that accepts
it. So its one peer, the
index, has a fake, and every test of the module runs against that fake. An
agent working a module reads the module and the names it reads, and nothing
past them.

## The fake index

`q/qtest` is the fake index. It runs one module in memory:

| the step | what it does |
|---|---|
| build | a catalog off the module's `Register` alone, and the catalog check over it |
| seed | the in-ports a case feeds, by their local names, config keys among them, and the events a fold takes |
| run | a derived provider, a fold over the seeded events, or an action with its input |
| assert | the out-ports the run writes, by their local names, and the list of requests an action answers |

A request in the list takes the answer the case hands it, so a `then` reads it.
The harness opens no database, no disk, no git and no port.

The `onlyq` analyzer in [[spec/design_output/model#the-build-checks-imports]]
holds a module and its tests to `q`, `q/qtest` and the pure standard library. A
fixture file rides in through `embed`, or the case seeds it.

## The test matrix

Every fake stands for a contract, per [[spec/guidance/code/testing]]:

| what the test covers | what it runs against |
|---|---|
| a module without the `io` flag | `q/qtest` alone |
| an IO module | `q/qtest`, and the fake of its outside world |
| a fake of the outside | its contract suite, run against the fake and the real outside |
| the fake index | its contract suite, run against `q/qtest` and the real index |
| a codec | its round-trip suite, over every file committed today |
| the index | a fake module |
| the cage | the replays of recorded session logs, end to end |

No other test crosses a module boundary.

## The fake keeps a contract

The fake index stands for one contract: the `q` interface a module sees. One
suite of cases, written once, runs against `q/qtest` and against the real index
in process, as a library, with no port and no NATS. So the fake a module relies
on behaves like the index it stands for.

The transport between processes is a contract of its own, with its own suite
run against NATS and a loopback bus in memory. The `fakesuite` analyzer in
[[spec/design_output/model#the-build-checks-imports]] refuses a fake with no
suite beside it, `q/qtest` among them.

Each contract has one suite, which runs against both of its sides:

```mermaid
flowchart LR
  subgraph outside["an IO module's outside"]
    s1["the suite of the outside"] --> f1["the fake outside"]
    s1 --> r1["the real disk, git, clock or tool"]
  end
  subgraph index["the q interface"]
    s2["the suite of the fake index"] --> f2["q/qtest"]
    s2 --> r2["the real index, in process"]
  end
  subgraph bus["the transport"]
    s3["the suite of the transport"] --> f3["the loopback bus"]
    s3 --> r3["NATS"]
  end
  subgraph modules["a module, as the index sees it"]
    s4["the index's own tests"] --> f4["a fake module"]
    f4 --> r4["the real index"]
  end
```

## The index meets fake modules

A fake module registers reads and writes the way a script says, and drives the
index through every transaction a module makes. The index's own tests run over
it:

| the transaction | what the case holds |
|---|---|
| the resolution | the two passes, and the loud refusal naming the reader and the name |
| a write | the refusal of a write from a module that registers no such output |
| a run | the snapshot at one revision, the commit, and the push |
| a writer running nowhere | the built-in value, with the mark `not provided` |
| a lease that expires | the stale mark, beside the last value |
| writing actions | the line, one at a time per tree |
| a read | an answer while a writing action runs, with no wait |

# IO modules

The IO modules of the model, in Go. An IO module is an ordinary module whose
registration carries the `io` flag, and it alone talks to the outside world.
This note covers its file and its fake, the inbound replay, the IO process, and
the import rules the build checks. The old system calls these parts doors: the
JavaScript doors standing today, and the rules they hold, stand in
[[spec/design_output/doors]]. A fake that behaves and a contract test per IO
module carry over from there.

## IO modules are modules

An IO module registers its in-ports, out-ports and config by local name, like
every other module. For the contract, see
[[spec/design_input/the-index-holds-the-model#every-part-is-a-module]]. Its
registration carries `q.IO()`. It is one file in a topic package under
`src/modules/<topic>` beside the others, and no separate tree holds it.

| what it does | such as |
|---|---|
| writes what comes in on its out-ports, which the wiring binds to names | `watch` writes `files/<path...>`, `hooks` writes `session/<id>/events`, `clock` writes `clock/minute` |
| accepts the requests going out, which an action's commit carries | `git` takes a commit or a push, `disk` takes a write |

It holds no business logic, only IO. A value it passes through counts the same
as one a module computes. It is an out-port, and the core takes the name it
binds from that IO module alone.

## Its file carries its fake

Each IO module is one Go file, and the file holds these parts:

| the part | what it is | the disk module |
|---|---|---|
| the interface | the verbs its requests take | `Disk` |
| the real one | the implementation reaching the outside | `disk` |
| the fake | an implementation in memory, which behaves | `FakeDisk` |
| the registration | its inputs, outputs and config, with `q.IO()` and both implementations | `q.IOModule("disk", newDisk, NewFakeDisk, q.IO())` |

The fake stands for a contract, and one suite of cases, written once, runs
against the fake and the real outside. The suite stands beside the file,
`disk_contract_test.go`, and asserts the same answers both ways. The build tag
`contract` holds it, because it touches the outside, and the check runs every
tag.

An IO module tests against `q/qtest` and the fake of its outside world, and both
stand local. The fake serves the contract suite, the replay and the system tests
too. A module without the flag tests against `q/qtest` alone, per
[[spec/design_output/model#the-test-matrix]], and needs no fake of an IO module.

## IO modules and their fakes

The inbound side, the outside reaching quackitect:

| the module | reaches | its fake answers from |
|---|---|---|
| `watch` | changes to the files, which it writes as `files/` | a change the test pushes |
| `clock` | the time, and `clock/minute` | a time that stands still until a test calls `Tick` |
| `env` | the `SE_` variables, which it writes as `env/<name>` at start | a map of variables the test hands in |
| `hooks` | the hook events of a session | a recording it replays, per [[spec/design_output/model#an-inbound-fake-replays]] |
| `lsp` | the LSP messages of an editor | a recording it replays |

The outbound side, quackitect reaching the outside:

| the module | reaches | its fake answers from |
|---|---|---|
| `disk` | the files | a map keyed by the forward-slash path, on every platform |
| `git` | a repository, running `git` | `FakeGit`, a repository in memory: refs, commits and a tree a commit, which `Show`, `Commit`, `Push`, `Fetch` and `MergeBase` read and move |
| `proc` | a program | a table of commands, and a command outside it fails naming the module |
| `vale` | the prose rules, running Vale | a table of findings by file |
| `biome` | the JavaScript format and lint, running Biome | a table of findings by file |

An IO module imports the library its outside needs, such as the one running a
program, and reaches another module through the index alone. Its fake answers
at its own verbs, so a test of a git caller reads refs and commits, and writes
no git command line.

## An inbound fake replays

An inbound IO module turns the outside's traffic into its outputs and into
calls on the bus: a read, a watch, an action. Every call carries the session id
of its caller.

Its fake replays a recording. A recording is a JSONL file under
`test/replay/<module>`. Each line holds a call as the outside sends it, and the
answer the module gives. The replay drives the real module over an index in
memory, with every outbound IO module at its fake, and asserts each answer.

| the module | what a recording holds |
|---|---|
| `hooks` | the hook events of a session, and each decision |
| `lsp` | the LSP messages of an editor, and each reply |
| `mcp` | the tool calls of an agent, and each result |
| `http` | the requests, and each response |
| `sse` | the subscriptions, and the events each one takes |

A session log at `debug` carries every inbound call, so a recording comes off
a real session. The event-to-decision tests of the bridge become these
replays, per [[spec/design_output/migration#the-tests-after-the-move]].

## The IO process

`quack io` runs the IO modules that hold a listener or a long connection in one
process, and the index manager supervises it:

| the side | what the process does |
|---|---|
| inbound | listens for HTTP, SSE and MCP on one loopback port. It takes `quack hook` over the bus, and `quack lsp` on a TCP port of its own |
| outbound | answers `io.<module>.<verb>` on the bus, and the index alone sends one |

A module without the flag reaches disk and git through the index alone. The
index sends each request of a commit to the IO module that accepts it, so the
operating system holds the boundary. Where the system places the rest, see
[[spec/design_input/the-index-holds-the-model#the-system-places-the-processes]].

A run picks each real IO module, and a test builds them in memory with
`q.Fakes()`. No switch stands between a run and a test.

## The build checks imports

A `go/analysis` pass holds the rules of
[[spec/design_input/the-index-holds-the-model#the-build-holds-the-rules]]. The
check runs it on Linux and Windows, and reads a package's flag off its
`q.IO()` registration:

| the analyzer | what it refuses |
|---|---|
| `onlyq` | an import from a module without the flag, or its tests, past `q`, `q/qtest` and the pure standard library the analyzer lists. So `os`, `io/fs`, `os/exec`, `net`, `database/sql`, `src/config`, `src/index` and a call to `time.Now` stay out |
| `ioonly` | an import of `os`, `os/exec`, `net` or `net/http`, and a call to `time.Now`, in the core, `src/q`, or a renderer |
| `fakesuite` | a fake with no contract suite beside it: an IO module's fake, and `q/qtest` |
| `nomodule` | an import of a package under `src/modules/` from another module, the index core or a renderer |

An IO module imports what its IO needs, and reaches another module through the
index alone, which `nomodule` holds. `nomodule` checks imports between packages
alone, and modules inside one topic package call each other's functions on
purpose. The index process,
`src/index`, runs the server: it keeps the outside's own libraries, its store and
the NATS server, and stands outside `ioonly`. The core, `src/q`, stays inside it.

The analyzers replace `DoorsOnly`, `FakeDoorsInTest` and `OutsideInDoors` for
the Go code, and the Vale rules keep the JavaScript that stays. The code holds
`nodoor` and `noname` today, and [[spec/tickets/analyzers-read-the-io-flag]]
replaces them.

## The guards hold a baseline

A guard reads the tree's source and names each offender of one rule of
[[spec/guidance/code/testing]] or [[spec/guidance/code/code]]. Its function
stands pure in `src/imports`, and takes parsed files or a file list.

| the guard | what it names | the marker sparing a line |
|---|---|---|
| `blackbox` | a Go test file whose package clause lacks `_test` | `level0: InPackageTest - <why>` on the clause or in the file's doc |
| `fixture` | a top-level Go test reaching a fixture build outside the home, through its own body or a helper of its package | `level0: FixtureOutsideHome - <why>` on the call's line or in the test's doc |
| `ratio` | a module whose test lines pass its code lines, per language | none: cut tests, or write code |
| `script` | a tracked script outside the engine | `level0: HandScript - <why>` in the script's first lines |

| the term | what it holds |
|---|---|
| a fixture build | a call to `TempDir`, `MkdirTemp`, `exec.Command` or `exec.CommandContext`, or an index start: `index.Run`, `index.Serve`, `index.StartBus` |
| the fixture home | a package's `main_test.go`, whose `TestMain` builds once, and `src/q/qtest` |
| a shared builder | `qtest.Shared`: it builds on the first call and answers that build after, and a test writes none of it |
| a line | a line holding text, which the `ratio` guard counts |
| a Go module | a package folder: its `_test.go` files against the rest |
| a JavaScript module | the folder, under the root's top folder, of the first source file a test imports. A test importing none belongs to its own folder |
| a script | a tracked file ending `.sh`, `.py` or `.bash`, or opening on `#!` |
| the engine | `RUNME.sh`, `src/` and `.claude/skills/` |

A script a hand writes under `.se/scripts` reaches the retro's input through
`retro collect`. There `retro classes` refuses one that carries no disposition,
as it refuses a note.

Each guard keeps a baseline, `src/imports/baseline/<guard>.txt`, one offender
a line. The baseline holds the offenders standing on the guard's first commit.

`./RUNME.sh guards` runs every guard over the tracked tree and reads each
baseline. It prints each offender standing outside the baseline, and each
baseline line the guard no longer names. A guard in report mode also prints
its offenders: counted per package where it names files in Go packages, and
each one whole otherwise. The check runs it as its part
`guards`.

| the mode | a new offender | a stale baseline line |
|---|---|---|
| report | printed, and the verb answers 0 | printed, and the verb answers 0 |
| refuse | printed, and the verb answers 1 | printed, and the verb answers 1 |

`./RUNME.sh guards --update` writes each baseline again. In report mode it
writes what the guard names. In refuse mode it drops the stale lines alone, so a
baseline only shrinks, and a new offender takes a marker with its reason.

# Operations

Operations: the record every call takes, the wait a caller sets, the states,
the one writer per tree, and what stays for how long. An agent stores no handle
and spends no turn polling. The rules stand in
[[spec/design_input/the-index-holds-the-model#a-caller-sets-its-wait]], and
this note gives them their shape.

## A caller sets its wait

One kind of action stands. Every call takes an operation record, `ops/<id>`,
inside the index, and the handle stays the index's own record, which the caller
needs no word of.
An action declares its deadline, and `q.Writes` where it writes, and nothing
about its length.

Every call carries a wait budget:

| the case | what the call answers |
|---|---|
| the action ends within the wait | the result, the way a plain call answers. Most calls end here |
| the wait runs out first | `still running`, with the handle, the fraction done, such as 40 percent, and the time gone by. The caller works out the rest |

| the surface | its default wait, a config key of its IO module |
|---|---|
| the hooks and MCP, the agents' side | a second |
| the command line | to the end, and `--detach` answers at once |
| HTTP | none, unless the request sends `Prefer: wait=N`, per RFC 7240 |

Each call sets its own wait, and the table holds defaults alone. A caller passes
its own number where it wants another, up to a cap, such as an agent waiting
half a minute for the check. A progress step sets the fraction done, and an
action with no steps answers the time gone by alone. A read takes no record, and
the cage's answer inside a hook stays a plain call.

## The agent does not poll

An operation an agent's session starts sometimes ends after the call answers.
The hook module then hands the result into that session's next turn. It rides
the added context of a hook answer, on the next tool use or prompt. `caller`
holds the session id, so the session's open operations are a query by session,
and the agent holds no handle:

| the part | what it does |
|---|---|
| `ops/wait` with no handle | waits on the session's open operations |
| the Stop hook | names the operations still running, with the fraction done and the time gone by, to an agent ending its turn. It lets the stop through |

The model is the Bash tool of Claude Code. It runs while the turn waits, up to a
timeout, then runs on behind it, and its end arrives as a notification.

## The handle is a name

`ops/` is a family the catalog declares once, and the index manager provides it.
Each call of an action adds a key under it, so the catalog stays whole.
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

A caller who wants the handle watches `ops/<id>` or reads it, the way it reads
every name. An agent waits through its budget instead, and the hook module
hands it the rest.

## The states

| the move | who makes it | what follows |
|---|---|---|
| to `queued` | the call | the call waits through its budget |
| `queued` to `running` | the writer queue, or at once for an action that writes nothing | the index hands the module process the input snapshot, and the module answers its list of requests |
| `running` to `done` | the last request answering | `result` stands, and the call answers it, or the hook module hands it to the session's next turn |
| `running` to `failed` | a request failing, a process ending, or the deadline passing | the undo steps run, newest first |
| `queued` or `running` to `cancelled` | `ops/cancel`, with the handle or for the session's open operations | a running one stops before its next request, and its undo steps run |

The index pushes each move, and the session log carries it as a row of kind
`op`. The index runs every request of an operation, per
[[spec/design_output/model#an-action-lists-requests]], so a module process
reaches no IO module itself.

## One writer per tree

An action that makes a writing request declares `q.Writes`. Writing operations
queue one at a time per checkout, in the order they arrive. A read waits on
nothing, except the read of an unwatched pending name, which waits for its run and for no write. A reading operation runs beside them, and a `get`
answers off the last snapshot.

A git hook reads names alone. So a hook the operation's own commit fires reads
and answers, and waits behind nothing.

## An operation outlives callers

A caller that ends leaves its operation running. Another client reads the result
by name, such as a new session reading the pull an old one starts.

The index keeps each operation in its database. At start it moves every one
standing `queued` or `running` to `failed`, with the reason that the index
restarts, and runs the undo steps of each running one. So an operation in
flight at a crash ends loud.

## What stays how long

| the operation | stays | the config key |
|---|---|---|
| `queued` or `running` | until it ends | none |
| `done` or `cancelled` | a window | `ops.keepDone` |
| `failed` | a longer window | `ops.keepFailed` |

The session log keeps every move past both windows. The index manager registers
each key with its built-in value.

## The surfaces

| the surface | a call running past its wait |
|---|---|
| the command line | `quack run work/pull` prints its progress to the end, and `--detach` prints the handle alone |
| HTTP | `POST /v1/actions/work/pull` answers `202`, with the handle's path under `/v1/values`, per RFC 7240 |
| MCP and the hook module | the tool answers `still running` with the fraction done and the time gone by, and the result reaches the session's next turn |
| a view | the last line draws the state until it ends |

# Watchdogs

The watchdogs of the model: the leases, the deadlines, the stale marks, the
restarts and `session/alarms`. The index manager holds them, a module the index
always loads, per [[spec/design_output/model#the-index-manager]]. The rules stand in
[[spec/design_input/the-index-holds-the-model#every-part-holds-a-lease]], and
this note gives them their shape.

## A lease

Every process, IO module and provider holds a lease the index manager keeps:

| the field | what it holds |
|---|---|
| `part` | the process, the IO module or the provider, by name |
| `renewed` | the time of the last heartbeat |
| `term` | how long a lease stands past its last heartbeat |

The work loop sends the heartbeat on `lease.<part>`, as a step of the loop
itself. An idle loop takes a tick through the same queue as its work. So a hung
loop sends nothing, even while a timer beside it runs. For the subject, see
[[spec/design_output/model#names-become-subjects]].

## Deadlines

Each name and action declares its deadline with `q.Deadline`, and each kind
keeps its deadline under the config key the table names.

| the kind | what the deadline holds | the config key |
|---|---|---|
| `q.Derived` and `q.Fold` | a provider with a pending input commits within it | `watchdog.deadlineDerived`, `watchdog.deadlineFold` |
| `q.Action` | the operation ends within it, per [[spec/design_output/model#operations]] | `watchdog.deadlineAction` |

A run past its deadline gets cancelled, its undo steps run where it is an
action, and the index restarts its process.

## A stale mark

A lease that expires marks its part stale:

| the reader | what it meets |
|---|---|
| a `get` | the last value, with `stale since <time>` |
| a view | the value and the badge in grey |
| `quack why` | the provider, and the time its lease expires |

The next commit of the part clears the mark.

## Restarts

The index manager restarts a process whose lease expires, and waits longer
before each restart of the same process. A run of faults inside a window raises
an alarm, and the restarts stop until the alarm clears.

| the config key | what it sets |
|---|---|
| `watchdog.backoffFirst` | the wait before the first restart |
| `watchdog.backoffCap` | the longest wait |
| `watchdog.faults` | how many faults raise an alarm |
| `watchdog.window` | the span those faults fall inside |

The index manager registers each key as its config, per
[[spec/design_output/model#config-comes-off-the-registrations]].

## The alarms standing

`session/alarms` holds the alarms standing, one row a part. The index manager
writes it:

| the field | what it holds |
|---|---|
| `part` | the part that stops |
| `since` | the first fault of the run |
| `faults` | the faults in the window |
| `error` | the last error the part gives |
| `clears` | the command that clears it, such as `quack restart work` |

The sidebar draws each alarm. The hook module hands the alarms to the agent in
each prompt's context. A refusal of the cage names the alarm it stands on.

## The watcher of the watchdog

The index holds a lease too, off its own work loop. `index/health` carries the
time the loop last renews it, and these parts watch it:

| the watcher | what it does when the index's lease expires |
|---|---|
| the IO process | restarts the index, with the same wait and alarm rules |
| the hook module | reads the lease off the name `index/health` before a call the cage holds. A lease past its term reads as down, though the port answers, and the hook module runs `quack start` while the cage refuses |

So an index answering off a hung loop reads as down, and a port answering alone
proves nothing.

Every expiry, restart and alarm lands in the session log as a row of kind
`watchdog`.

# The inner protocol

How the index speaks to its own processes, and how the editor reaches the `lsp`
IO module. Every peer here is Go, in one module, and the IO modules translate
for the outside. For the argument, see [[spec/rationales/the-processes-speak-nats]]
and [[spec/rationales/the-editor-starts-quack-lsp]].

## The index runs NATS

The index process runs a NATS server inside itself, and every other process
dials it as a client. The server listens on loopback TCP alone, on a port the
operating system picks, and the standing file names the port and a token.

| the peer | what it does on the bus |
|---|---|
| the index | runs the server, answers reads, takes commits, pushes changes |
| a module process | subscribes to its inputs, answers its actions, publishes its commits |
| the IO process | answers the requests going out, and relays the outside onto the bus |
| `quack` | starts the index where none answers. As a client it reaches the index over HTTP `/v1`, the way every other client does, with no path of its own |

The server stores nothing: no JetStream, and no disk. The index owns every value,
so a message that goes missing gets read again from the index.

## Names become subjects

A name's segments become a subject's tokens: `work/open-tasks` rides as
`work.open-tasks`. A verb token goes in front.

| the subject | the shape | who answers |
|---|---|---|
| `get.<name>` | request and reply: the value, its revision, and whether it stands stale | the index |
| `val.<name>` | publish: each new value with its revision, and the revision of the value before it | the index, on every commit |
| `sum.<topic>` | publish: every name of the topic with its revision, each resync span | the index |
| `run.<provider>` | publish: an input of the provider moves, with the revision the next snapshot stands at | the index sends it, and the module process holding the provider takes it |
| `in.<provider>` | request and reply: one snapshot of a provider's inputs | the index |
| `commit.<provider>` | request and reply: the names a run provides, or the list of requests an action answers, and the revision it reads | the index takes it, runs the requests, and starts the next run where an input moves |
| `act.<name>` | request and reply: an action's input in, its handle or result out | the index, which runs the action through its module process |
| `io.<module>.<verb>` | request and reply: one request going out | the IO module that accepts it answers, and the index alone sends one |
| `lease.<part>` | publish: a heartbeat off the part's work loop | the index listens |

A module process subscribes to `run.` for its own providers alone, and sends
`in.`, `commit.` and `lease.`. It sends no `io.` request, so a module reaches
the outside through the index alone, per
[[spec/design_output/model#a-module-meets-the-index]].

A watch is a subscription. `val.work.>` watches every name under `work/`.

## A message carries types

The payload is JSON of a Go struct the `q` package declares, so every peer
reads the same type off the same source. A header carries the revision, the
session id of the inbound call, and the deadline.

The header carries the stamp of the `q` package too. The index refuses a peer
whose stamp differs from its own, so both ends of a message read one set of
types. A module rebuilt alone keeps the stamp, per
[[spec/design_output/model#a-module-rebuilds-alone]].

## A push names its predecessor

The model carries one revision, and a commit raises it whether a name moves or
not. So a jump in the revisions a subscriber sees says nothing about a name it
watches. Each `val` names the name's own previous revision instead:

| the subscriber holds | what it does |
|---|---|
| the name at the push's previous revision | takes the push |
| the name at another revision, or none | sends a `get` for the name |

A missing push with no push after it leaves no trace. So every resync span, the
index publishes `sum.<topic>` for each topic a peer watches. A subscriber sends a
`get` for each name whose revision differs from its own. The
config key `bus.resync` holds the span.

## Large values ride in chunks

The NATS server caps a message's payload, and a file under `files/` or a
snapshot can run past it. The index sets the server's cap from `bus.maxPayload`,
and a value past `bus.chunk` rides in chunks:

| the step | what holds |
|---|---|
| a push | `val.<name>` carries the revision and the count of chunks, and leaves the value out |
| a read | the reply to `get.<name>` carries the first chunk and the count, and the rest follow on the same reply subject, each numbered |
| a chunk missing | the reader asks again, and takes the value whole or not at all |

A snapshot on `in.<provider>` rides the same way. The index manager registers
both keys, each with its built-in value.

## The editor starts `quack lsp`

VS Code starts `quack lsp` as its language server, over stdio. The command
relays stdio over a plain TCP stream to the IO process, which holds the `lsp` IO
module. An LSP message rides that stream alone and stays off the bus. Core NATS
drops a message where a subscriber falls behind, and the LSP reads every message
in order.

| the step | what holds |
|---|---|
| start | `quack lsp` reads the standing file, and starts the index and the IO process where none answers |
| connect | it dials the LSP port the standing file names, on loopback, with the token |
| relay | each LSP message rides whole, and the command parses none of it |
| end | the editor closing stdio ends the command, and the IO process stays for the next client |

The extension learns no port. Any editor starting a language server by command
reaches the same IO module.

# Processes

How the system places the processes. This note covers the start of the index,
the spawn of the IO process and each module, and the standing file. It covers a
module that rebuilds alone too. For the argument, see [[spec/rationales/modules-run-apart]].

## One binary, many processes

`quack` is the one binary, and every process runs it with a verb:

| the process | the command | what it runs |
|---|---|---|
| the index | `quack index` | the core, the NATS server, SQLite, and the index manager module |
| the IO process | `quack io` | the IO modules holding a listener, per [[spec/design_output/model#the-io-process]] |
| a placement | `quack module <instance>...` | the instances it names |

The binary holds every module, and a module process runs the instances its
command names. So an author writes one file, and a person starts one program.

## The start

| the step | what holds |
|---|---|
| a caller runs `quack start`, or any verb that needs the index | it reads the standing file, and asks the index for `index/health` |
| no answer | it starts `quack index` apart from itself, and waits for the standing file |
| the index starts | it checks the catalog and starts the bus, and the index manager writes the standing file |
| the index manager spawns | the IO process, then one process a placement |

The same road runs on Linux and Windows: a detached process, loopback TCP, and
no signal. `quack stop` asks the index over `/v1`, and the index stops the
modules, the IO process and then itself.

## The standing file

`.se/.runtime/standing.json` names what a peer needs to dial:

| the field | what it holds |
|---|---|
| `bus` | the port of the NATS server |
| `http` | the port of the IO process, for HTTP, SSE, MCP and the hook module |
| `token` | the secret each peer shows |
| `pid` | the process of the index |
| `stamp` | the stamp of the `q` package the index runs |

The index manager writes it once the bus stands, and removes it when the index
stops. A file
whose `pid` runs nowhere reads as absent.

## The placements

The wiring says which instances run and how their ports meet. Where they run
stands apart, the way the IEC standard for function blocks splits an application
from its mapping onto devices. [[spec/rationales/modules-stay-local]] names it.

The config key `processes.placements` lists the placements, each a list of
instances that share a process. An instance in no list gets a process of its
own. A placement changes where an instance runs, and no file of its module.

## A process ends

| what the index meets | what it does |
|---|---|
| a module process exits | its names stand at their built-in values, with the mark `not provided`, until the restart |
| a lease expires while the process lives | its names stand stale, per [[spec/design_output/model#a-stale-mark]] |
| the IO process exits | its names stand at their built-in values, with the mark `not provided`. The index manager restarts it, and every request going out meanwhile fails |

The restarts follow [[spec/design_output/model#restarts]].

## A module rebuilds alone

The `watch` IO module sees a change under `src/modules/<topic>`, and the index
manager builds the binary again under `.se/.runtime/bin`, named by its stamp:

| the rebuild | what restarts |
|---|---|
| it keeps the module's ports and the wiring | the process holding that module's instances, on the new binary, and the index stays warm |
| it changes ports, or the wiring changes | the index, which resolves again and builds the heights and run lists again |

A change to the `q` package changes its stamp, and the index manager restarts every
process on the new binary. The config key `processes.rebuild` turns the watch
on, and a cloud box leaves it off.

# Surfaces

A module as one file, and how the registry builds every surface off it. For the
argument, see [[spec/rationales/the-registry-builds-surfaces]]. The provider
kinds and the catalog stand in [[spec/design_output/model]].

## A module is one file

A module is one file. A topic folder under `src/modules/` is one Go package
holding several modules, and each file holds one registration, its input struct,
and a test beside it:

| the file | what it holds |
|---|---|
| `src/modules/work/open_tasks.go` | the input struct, and `q.Derived("open-tasks", ...)` in a package variable |
| `src/modules/work/open_tasks_test.go` | the cases, run through `q/qtest` against the fake index |

A module meets the index alone. For the fake index and the rule holding a
module to it, see [[spec/design_output/model#the-fake-index]].

A module declares how everything it exposes presents itself: its in-ports,
out-ports, config keys and actions. A view decides where they show, per [[spec/design_output/model#views]]. An action's input
and output types carry a name and a description on each field, as struct tags:

    type pullIn struct {
        Ticket string `json:"ticket" label:"Ticket" doc:"the ticket to pull, or the next one when empty"`
    }

Every declaration stays local to the module, about its own ports alone.

The package variable registers at `init`, so a new file joins the topic at the
next build. The file names no HTTP library, no MCP and no editor.

## The options

A registration takes options beside its function:

| the option | what it declares | who reads it |
|---|---|---|
| `q.Doc` | one line on what the port, the key or the action is | every surface, as its help |
| `q.Label` | its display name | every renderer, and the generic surfaces |
| `q.Icon` | a proposed icon, which a view uses or leaves out | the renderers |
| `q.Looks` | the kind of value, such as `q.Count`, `q.Rows` or `q.State`, so a renderer knows how to draw it | the renderers |
| `q.Deadline` | how long a run takes at most | the watchdog |
| `q.Answers` | the type an action's caller receives, whose fields carry `label` and `doc` tags | every surface, as the action's output |
| `q.Cfg` | a config key the module reads, with its type, built-in value and help | the config module, and every list of keys, per [[spec/design_output/model#config-comes-off-the-registrations]] |

## What each surface gets

| the surface | what the registry builds |
|---|---|
| the command line | `quack get <name>`, `quack watch <name>`, `quack run <action>` with a flag per input field, and help off `q.Doc` |
| HTTP | `GET /v1/values/<name>` and `POST /v1/actions/<name>`, each with its type through Huma in the OpenAPI 3.1 document at `/v1/openapi.json`, with pages at `/docs` |
| SSE | `GET /v1/watch` with the names or a topic, pushing each change with its revision |
| MCP | a tool per action, with the action's name and its `q.Doc`. Its input schema comes off the input type and its field tags, the source OpenAPI reads through Huma. The module adds the `wait` argument to every tool |
| the hook tools | the same list, in the file [[spec/design_output/model#the-tool-list]] names |
| the editor | the base files under `spec/views`, drawn with the labels, docs, icons and looks the registrations declare |
| the window | the registry tabs, per [[spec/design_output/model#the-registry-tabs]] |
| the config schema | `spec/config/level0.schema.json`, the built-in values, the slash commands and the command-line help, generated from every `q.Cfg` and its `q.Doc` |

A name's segments become the path's segments. A call over HTTP shows the token
the standing file names. The command line is one more client of `/v1`, and takes
no path of its own.

One source gives the same text everywhere. A thing's name, label, description and help read alike in the command line, the
window, the sidebar, OpenAPI and MCP. Every surface reads them off the module's
registration. A new action reaches every row above at the next start.
No surface keeps a list of its own: the command line, OpenAPI and MCP read
the same declarations.

## The generic contract tests

The contract tests run over every registration, so a new file meets them with
no case of its own. For the list, see
[[spec/design_output/migration#the-tests-after-the-move]].

One case holds the rule of one source. For one action, the command-line help,
the OpenAPI description, the MCP tool description and the `help` tab show one
text.

# Views

The views of the model: what a base file declares, and what the one renderer
draws off it. The window gets the renderer first, and the sidebar draws the
same files after it. For the order, see
[[spec/design_input/the-migration-runs-in-slices#the-phases]].

The keys a base file carries today stand in
[[spec/design_output/tree-view#a-base-file-says-it]]. This note adds the keys
the model needs.

## A view reads names

A base file under `spec/views` is a view, and the renderer draws it as a tab.
The file names what it reads, and the renderer computes nothing.

| the key | what it says | the work view |
|---|---|---|
| `reads` | the name whose value is the rows, a list of maps | `work/rows` |
| `badge` | the name the tab header draws beside the title | `work/open-tasks` |
| `actions` | the keys and buttons, each with what it calls | below |
| `follow` | new rows land at the end, and End follows them | the log alone |

`work/open-tasks` is the name the sidebar badge reads too. So the header and
the badge draw one number, and the bracket count in the renderer leaves the
code.

A column key names a key of the rows. The row type stands in the catalog, so a
column the rows lack is a fault at start.

## A view declares actions

Each entry under `actions` takes one trigger and one effect:

| the trigger | what it is |
|---|---|
| `key` | a key while the view holds the cursor |
| `button` | a button the renderer draws in the header, and the sidebar draws in its row |
| `arg` | what the key collects after it, such as `digit` |

| the effect | what the renderer does |
|---|---|
| `calls: <action>` | calls the action with the selected row's address, or the marked rows, and the `arg` |
| `edits: cell` | opens the cell edit, and Enter calls the action `writes` names |
| `edits: form` | opens a form built from the action's input type, and shows the command line it runs |
| `jumps: <filter line>` | moves the cursor to the newest row the line passes |
| `cycles: <preset>` | steps the view through the presets the file names, and round again |

The work view declares these:

    reads: work/rows
    badge: work/open-tasks
    actions:
      - { key: p,     arg: digit, calls: work/place }
      - { key: u,     calls: tickets/flip-urgent }
      - { key: enter, edits: cell, writes: tickets/set-field }
      - { button: pull, calls: work/pull }

The renderer calls an action with a wait of its own. A call ending within it
answers the result, and while one runs on, the last line draws its fraction
done, off `ops/<id>`, until it ends. A refusal comes
back as the action's failure, with its reason, and the last line draws it. For
the wait, see
[[spec/design_input/the-index-holds-the-model#a-caller-sets-its-wait]].

## The log is a view

`spec/views/log.base` declares the log, in the same keys:

    reads: log/rows
    follow: true
    actions:
      - { key: E,     jumps: "level: error" }
      - { key: alt+l, cycles: floor }

`log/rows` is a fold over `session/`, so the log reads the events the index
holds, and no renderer tails a file. The `floor` presets carry the level
filters `alt+l` steps through today.

## The registry tabs

The registry draws in these tabs, each a base file over a name the index
provides:

| the tab | reads | what a row holds |
|---|---|---|
| `index` | `index/names` | a name, its value, its provider, and whether a provider answers it or it stands at its built-in value |
| `cli` | `index/actions` | an action, its doc and its input type. Enter opens a form built off its input, with the command line it runs, and F5 makes the same call the command line makes |
| `help` | `index/docs` | a name, an action or a key, and the doc `q.Doc` gives it |

The declared views stand first, in the order the config key `window.tabs`
names, and the registry tabs stand after them.

## The renderer draws declarations

| the rule | what holds |
|---|---|
| one renderer | the window and the sidebar each draw every base file, and neither names a view in its code |
| the check at start | each `reads`, `badge`, `calls` and `writes` names a name or an action in the catalog, or the index refuses to start |
| a description | an exposed port, key, action or field with no `q.Doc` or `doc` tag is a fault at start, so the check refuses it before a merge |
| no meaning | a view decides whether and where a value shows, the registration how it presents itself, and a provider what it says |
| the presentation | a label, a doc, an icon and a look come off the registration. A view writes none of them, and uses or leaves out any |
| no view file | the generic surfaces draw off the same declarations: the `index`, `cli` and `help` tabs, the command-line help, OpenAPI and the MCP tools |
| a new view | a new base file and no change to a renderer |
| a new renderer | a web page or the editor's webview draws the same base files, as a renderer of its own |

The build holds the second rule over the renderers' imports. For the rule, see
[[spec/design_input/the-index-holds-the-model#the-build-holds-the-rules]].

# The hook protocol

The answer protocol between the hook module and the index. The hook module
stays JavaScript, because the harness loads a hooks module alone. It forwards
each event to the `hooks` IO module, and does what the answer says. The cage moves onto
this protocol in the phase [[spec/design_input/the-migration-runs-in-slices#the-phases]]
names for it.

## A post and its answer

The hook module posts each event to the `hooks` IO module, over HTTP on the IO
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

The `hooks` IO module writes each field it reads as an event under
`session/<id>/events`, its output, so the
fill and the rows reach the index as values. The answer is a list of effects,
and the hook module runs them in order.

## The effects

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

## An effect asks back

Some effects need what the hook module alone reaches. Each carries a `call`
id, and the hook module posts the answer back as `hook.back` with that id. The
IO module then answers the effects that follow.

| the effect | what the hook module reaches | what it posts back |
|---|---|---|
| `rows` | the newest transcript rows, as role, id, whether it holds results, and the agent's text | the rows |
| `spawn` | an agent the harness spawns, with the prompt and the type the effect names | its text, whether it errs, and the refusal |
| `classify` | `model.classify`, with the ask, the labels and the model | the label |

A round of asks stops at the cap the IO module sets, and the last answer stands. So
the answer gate reads the rows it asks for.

## A step streams once

The hook module reads the stream of a step, and hands every chunk on as it
comes. At the step's end it posts `turn.said` once, with the count of each
chunk kind and the text. So a chunk costs no post, and the answer gate reads the
whole step.

## The tool list

The build writes every action the registry marks for agents into
`.se/.runtime/hook-tools.json`: its name, its doc and the schema of its input.

| the moment | what the hook module does |
|---|---|
| session start | registers every tool the file names, before any post |
| a tool call | posts it as every event, and the IO module calls the action |
| an answer carrying `tools` | reads the file again, and registers the difference |

So the tools stand before the index answers, and a tool call meeting an IO module
that stands down gets the cage's refusal. Copilot takes the same list over MCP.

## The index stands down

| what the hook module meets | what it does |
|---|---|
| no answer on the port, or `index/health` naming a lease past its term | runs `quack start`, which starts the index and the IO process where none answers |
| still no answer | refuses a guarded call, names the alarm, and passes the rest |
| every case | writes a row to the session log file, which the index reads in when it starts |

For the refusal, see [[spec/rationales/the-cage-refuses-while-down]]. For the
lease the hook module reads, see
[[spec/design_output/model#the-watcher-of-the-watchdog]].
