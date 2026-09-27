---
kind: [[design_input]]
---

# Scope

The owner asks that the index become the one model of this tree. One process
owns every value quackitect knows. Modules compute values, and IO modules reach the
outside. The old system calls an IO module a door. The sidebar, the window, the command line, the hooks and any script
read a value by its name, and none of them computes it.

The asks, one to a line:

- Keep the index core dumb: it holds no business logic, no input layer and no `q.Given`.
- Make every part a module: the ones that compute, the IO modules, the config, and the index's own management.
- Let each module register its inputs, its outputs with their built-in values, its config, its state and its debug flags.
- Give each name one writer and a built-in value.
- Generate the config schema, the built-in values, the slash commands, the command-line help and the index tab off the registrations.
- Mirror the disk in `files/`, and let each owner project its files through one codec and write back through `disk`.
- Layer each config key: override, context, environment, local, default and built-in, with shared keys the whole project sees alike.
- Let a module declare local ports alone, and let one wiring file bind them at start-up.
- Resolve the wiring at start-up in two passes, and refuse loudly on an in-port still open.
- Hand a provider one snapshot in, let it work pure, and take one commit out.
- Answer, for any name, who writes it, who reads it and where it comes from.
- Let a module flagged `io` alone talk to the outside world, one file each, with its fake inside.
- Keep a module to one file that registers itself.
- Let a module talk to the index alone, and test every module in isolation against a fake index.
- Build every surface from the registry: the command line, the window, the sidebar, HTTP and MCP.
- Declare the views, and let one renderer draw every one of them.
- Answer every call within the wait its caller sets, and hand an agent the rest in its next turn.
- Put a watchdog and a dead-man switch on every part.
- Let the cage refuse while the index stands down.
- Let the system place the modules in processes, where no author sees it.

The order of the work stands in [[spec/design_input/the-migration-runs-in-slices]].

# Why one model

The sidebar's count of open tickets shows the cost of today. The extension
starts a verb, the verb starts the window's binary, and that binary starts
another verb to learn the places. The answer travels back through two standard
outputs. The window's own tab header counts the same tickets another way, so
the two numbers disagree, and the fix touches eleven files.

In the model, the work module provides `work/open-tasks`, and the index pushes
each change of it. The badge and the header both read that one name, so they
agree. The change that costs eleven files today costs one provider file and its
test.

# Every part is a module

The owner rules the index dumb, and every part a module. Everything that knows
anything registers the same way: a module that computes, an IO module,
the config, and the index's own management.

| the part | what it does |
|---|---|
| the index core | resolves reads to writers, and stores name to value. It takes a write from the name's registered writer alone, hands out one snapshot and pushes changes. Where no value stands, or its writer runs nowhere, it answers the built-in value, with the mark `not provided` |
| a compute module | reads names, and writes the names it registers |
| an IO module | a module flagged `io`: it owns the names of what comes in, and accepts requests going out, with no business logic |
| the config module | a small module the index always loads. It owns every `*/config/*` subtopic, resolves the layers and writes the value that wins |
| the `watch` and `disk` IO modules | the only ones touching the disk: `watch` brings changes in as `files/`, and `disk` writes on request |
| the wiring file | `spec/wiring.yaml`: the instances to load, and a name for each port |
| the index manager | a module the index always loads, holding supervision, leases, alarms, operations and retention |

A module passing a value through from outside writes it the way a module
computing one does. The core stores and hands out, and knows no name's meaning.

Each module registers five groups:

| the group | what it holds | built |
|---|---|---|
| inputs | the names it reads | now |
| outputs | the names it writes, each with its built-in value | now |
| config | its keys by local name, each with a type, a built-in value and a help line | now |
| state | its insides, readable for diagnosis | later, and part of the contract now |
| debug | the flags that switch a diagnosis on | later, and part of the contract now |

A module writes its registered outputs alone. The config schema, the built-in values,
the slash commands, the command-line help and the window's index tab come off
the config group. So nobody writes a list of keys by hand.

A module knows nothing about where its config values come from. It declares its
keys and reads them like any other input, and names no file, environment,
context, override or layer. The config module and the surfaces alone know the
layers.

A module declares local ports alone, and spells no other module's name or path.
The wiring file names the instances to load, and binds each port to a name.
Modules load in any order, so the index resolves the wiring in two passes. An
in-port still open after the second is a bug, and the start refuses, naming the
port. An instance that runs nowhere leaves its readers the built-in value, with
the mark `not provided`.

# One owner per name

| the rule | what it gives |
|---|---|
| a key a module declares under `<instance>/config/` has the config module as its writer, the one place a module declares a name another writes | the declaring module reads the key as an input, and the start resolves its writer in its passes |
| a module names its ports and keys locally, and spells no other module's name | an agent writes and tests a module alone, and the wiring file holds the layout |
| each name has one provider and a built-in value | no value stands computed in two places, so two numbers cannot disagree |
| an alternative calculation is another module type, which the wiring binds to the same name | a box chooses its calculation, and the name stays one |
| the index adds no name at runtime | the catalog a reader sees is the whole catalog |
| the index refuses to start on a broken catalog, such as a name with two writers, or an in-port no writer answers | the fault shows at start, and the check starts the index, so it shows before a merge |

# Input, processing, output

A provider or an action declares its inputs up front, as a struct whose fields
name its in-ports by local name:

    type openTasksIn struct {
        Places Places `q:"places"`
    }

| the stage | what holds |
|---|---|
| input | the index hands one snapshot of every input, taken at one revision of the model |
| processing | pure: it reads the struct alone, and calls no index |
| output | one atomic commit: the names it provides, or the list of requests an action makes |

A run reads no old value beside a new one, and it costs one round trip. Its
output carries the revision it comes from.

A change settles as one wave. The start gives every module a height, and a name
builds its run list of the modules below it the first time it changes. A commit
marks its run list pending, and a module runs once none of its in-ports reads a
pending name. So a module fed twice by one change runs once.

A change during a wave waits for the next one. A read waits on nothing, except
the read of an unwatched pending name, which waits for its run and for no write.
A read gets the last settled value.

| what a module provides | what it answers |
|---|---|
| a derived value, `q.Derived` | a function of its inputs |
| a fold, `q.Fold` | a value reduced over the events of `session/`, one event at a time |
| an action | an ordered list of requests to IO modules, each with its undo step |

# The wiring analyzer

Declared ports and the wiring file make the whole wiring known before anything
runs. The index keeps the file and the line of each registration. `quack why
<name>` follows the wiring. It answers the port writing the name and its module
file, and that instance's in-ports and the names they read. It goes down to the
files, the clock and the events, and names every reader:

    $ quack why work/open-tasks
    work/open-tasks = 3                   written by work.open-tasks
      module      modules/work/open_tasks.go:9
      in-port     work.places  <- queue/places     modules/queue/places.go:14
                    in-port queue.rows  <- tickets/all   modules/tickets/ticket.go:22
      read by     the sidebar badge, the work view header

The same answer stands as an agent tool and as a view in the window's index tab.

# IO modules on both sides

The owner rules that a module flagged `io` alone talks to the outside world:
disk, git, processes, the network, time, Vale and Biome. Every other module
talks to the index alone, and the build holds it.

| the side | the IO modules |
|---|---|
| inbound, the outside reaching quackitect | LSP, hooks, MCP, HTTP, SSE, the file watcher, the clock, the environment |
| outbound, quackitect reaching the outside | disk, git, processes, Vale, Biome |

An IO module is an ordinary module with the flag. It registers inputs, outputs
and config like every other. It owns the names of what comes in, such as
`files/` off the watcher and `session/` off the hooks, and accepts the requests
a commit carries out. For the contract, see
[[spec/design_input/the-index-holds-the-model#every-part-is-a-module]].

An IO module is one file: an interface, the real implementation and a fake. A
run picks the real one, and the module's test the fake. An outbound fake answers
from a table, and an inbound fake replays traffic a recording holds, such as a
hook event or an HTTP call. A new adapter is one more file, and the index and
the other modules stay as they stand.

| the folder | what it holds |
|---|---|
| `src/q` | the index core: names, values, one snapshot, the pushes |
| `src/modules/<topic>` | a topic package holding several modules, one file each, such as `work`, `pull`, `check` and `retro` |
| `src/modules/<topic>`, with `q.IO()` | an IO module, one file carrying the flag `io` in its topic package, such as `watch`, `hooks`, `lsp`, `git` and `disk` |

# A module is one file

A module is one file. A topic folder is one Go package holding several modules,
one file each. A new file in `src/modules/work/` joins the work package at its
next build, and its `init` registers the module and its ports. The module
names no HTTP library, no MCP and no editor, because only the IO modules know those.

        var OpenTasks = q.Derived("open-tasks", 0,
        q.Doc("The tickets this box can take."),
        q.Show(q.Badge{On: "work/editor"}),
        func(in openTasksIn) (int, error) {
            return in.Places.Takeable, nil
        })

# Modules test in isolation

The owner rules that every module tests in isolation against a fake index. A
module talks to the index, and an IO module to its outside besides. A request
goes out through the index, inside an action's commit, and the index hands it to
the IO module that accepts it. So a fake index stands in for the index in every test of a module. An IO
module's test adds the fake of its outside.

The point is that an agent reasons locally. A change to a module reads the
module's file and the names it reads. Its test runs with no disk, no git, no
database and no port.

| what holds | where it stands |
|---|---|
| the fake index, `q/qtest` | [[spec/design_output/model#the-fake-index]] |
| the analyzer holding a module to `q` and `q/qtest` | [[spec/design_output/model#the-build-checks-imports]] |
| the rule a test of a module follows | [[spec/guidance/code/testing]] |

# The registry builds each surface

That one file reaches every surface, and no surface names it:

| the surface | what the file gives it |
|---|---|
| the command line | `quack get work/open-tasks`, with help from `q.Doc` |
| the `http` IO module | `GET /v1/values/work/open-tasks`, typed in the OpenAPI 3.1 document and on `/docs`, through Huma |
| the `sse` IO module | a stream that pushes on change alone |
| the hook module and the `mcp` IO module | a tool Claude, Copilot and every other agent reads |
| the editor | the badge on the work editor button |
| the window | the value and its help in the index tab |
| the start-up check | a unique name, a built-in value, one provider |

Claude Code takes its tools through the hook module. Copilot carries no
function hooks, so it takes the same tools over MCP.

# A view is a declaration

This tree holds two real views, the log and the work, and neither is a form.
So a file declares each view, and one renderer draws every declaration.
`spec/views/work.base` names its columns, flags, presets, filters and sorts
already. It gains the name it reads and the actions its keys call:

    reads: work/rows
    actions:
      - { key: p,     calls: work/place }
      - { key: enter, edits: cell }
      - { button: pull, calls: work/pull }

The window is the first renderer, and it is the command line with tabs:

| the tabs | what they hold |
|---|---|
| on the left | the declared views |
| `index` | every name with its value and provider, and whether a provider answers it or it stands at its built-in value |
| `cli` | the command tree, and a form built from an action's input, with the command line it runs |
| `help` | the help |

# A caller sets its wait

One kind of action stands, and every call takes a record, `ops/<id>`, inside the
index. The caller sets a wait, and a call ending within it answers the result. One
running past it answers `still running`, with the handle, the fraction done
and the time gone by. An agent stores no handle and spends no turn polling.


| the rule | what holds |
|---|---|
| the agent | the hook module hands a result arriving late into the session's next turn, and the Stop hook names what still runs |
| the wait | set per call, and a default per surface, a second for the agents' tools |
| states | `queued`, `running`, then `done`, `failed` or `cancelled`, and the index pushes each move |
| the deadline | the watchdog ends a late operation loudly as a failure, and its undo steps run |
| one writer | writing operations queue one at a time per tree. A read waits on nothing, except the read of an unwatched pending name, which waits for its run and for no write. So a git hook reading names answers at once |
| the caller | an operation outlives it, and another client reads the result |
| retention | the running and queued ones stay, finished ones stay for a window config sets, a failure stays longer, and the session log keeps every change |
| reads | a read takes no record, and the cage's answer inside a hook stays synchronous |

They carry the name operations, because a ticket names the work here.

# Every part holds a lease

A part that stops working reads as stopped. Every process, IO module and provider
holds a lease its own work loop renews.

| the rule | what holds |
|---|---|
| the heartbeat | comes from the work loop, so a hung loop beside a ticking timer still reads as dead |
| the deadline | a provider with a pending input commits within it, and an action finishes within it, or the watchdog cancels the run and restarts the process |
| silence | every name of an expired provider reads `stale since <time>`, the badge greys, and `quack why` says so |
| escalation | the index restarts a process, waiting longer each time. Past a run of faults it raises `session/alarms`, which the sidebar shows and the hook module hands the agent |
| the watcher of the watchdog | the IO process and the hook module watch the index's lease, and restart it |
| declaration | each name and action declares its deadline, `q.Deadline`, and each kind's deadline stands under a config key |

While the index stands down, the cage refuses, and the refusal names the alarm.
For the argument, see [[spec/rationales/the-cage-refuses-while-down]].

# The rulings on the specs

The specs of phase 0 carry choices a box makes, and the owner rules each one.
Every ruling stands, and a box builds on it with no question:

| the ruling | where it stands |
|---|---|
| an action answers a `then`, which the index calls with the answers, and which answers the next list of calls | [[spec/design_output/model#an-action-lists-requests]] |
| a call with no undo names `q.NoUndo` and the reason | [[spec/design_output/model#an-action-lists-requests]] |
| `quack why` follows an input down to `files/`, `session/` and `clock/minute`, and stops short of git | [[spec/design_output/model#quack-why]] |
| every part is a module, and the core holds no input layer and no `q.Given` | [[spec/rationales/every-part-is-a-module]] |
| writing actions line up one at a time. A read waits on nothing, except the read of an unwatched pending name, which waits for its run and for no write | [[spec/design_output/model#one-writer-per-tree]] |
| the restarts of a part stop after its alarm, until the alarm clears | [[spec/design_output/model#restarts]] |
| the hook module watches the index's lease, so an index answering off a hung loop reads as down | [[spec/design_output/model#the-watcher-of-the-watchdog]] |
| the index and its processes speak NATS, with the server inside the index | [[spec/rationales/the-processes-speak-nats]] |
| the editor starts `quack lsp`, which relays stdio to the IO process over a TCP stream of its own | [[spec/rationales/the-editor-starts-quack-lsp]] |
| a value past the bus's payload cap rides in numbered chunks | [[spec/design_output/model#large-values-ride-in-chunks]] |
| `files/` mirrors the disk, and each structured file is a projection with a codec and a kind | [[spec/design_output/model#everything-on-disk-mirrors]] |
| a module declares local ports alone, and `spec/wiring.yaml` names the instances and binds each port | [[spec/rationales/modules-stay-local]] |
| the passes resolve the wiring, and refuse loudly, naming the port | [[spec/design_output/model#the-index-resolves-in-passes]] |
| a change settles as one wave, off heights and run lists the start fixes, with early cutoff and demand | [[spec/rationales/changes-settle-in-waves]] |
| no central config topic stands: each module's keys stand under `<instance>/config/`, and the config module resolves them off their layers | [[spec/design_output/model#the-config-module]] |
| a module knows nothing about where its config values come from | [[spec/design_output/model#config-comes-off-the-registrations]] |
| a script opens a context with a lease, and an override wins over every context | [[spec/design_output/model#a-context-holds-a-lease]] |
| a shared key reads the default file alone | [[spec/design_output/model#a-keys-layers]] |
| the value a registration writes is its built-in value, and the default is the project's file | [[spec/design_output/model#a-keys-layers]] |

# The system places the processes

Three kinds of process run: one for the IO modules holding a listener, one for
the index, and one a placement of module instances. Go spreads its work over every core in one process already, so
the split buys isolation:

- A crash stays in its module, and the index shows that module's names at their built-in values, with the mark `not provided`, until it restarts.
- A changed module rebuilds and restarts alone, and the index stays warm.
- The operating system holds the boundary, because a module process reaches disk and git through the index alone.

Every read of a module crosses a local socket, and the index supervises the
processes. The wiring file says which instances run, and
`processes.placements` says where. Where each module runs is the system's
choice. An author writes one
file, and a user starts one program.

# The languages and the platforms

| the ruling | where it stands |
|---|---|
| Go is the core, and JavaScript stays where the host runs JavaScript alone: the extension and the hook module | [[spec/rationales/go-holds-the-core]] |
| the index reads SQLite through the pure Go driver | [[spec/rationales/the-index-drops-cgo]] |
| the Go code stands in one module | [[spec/rationales/go-stands-as-one-module]] |
| git is the archive and the transport, and a group in the cloud carries `cloud: true` on `main` | [[spec/rationales/git-stays-the-archive]] |
| Linux and Windows behave the same: loopback TCP and the standing file, no Unix socket and no named pipe, and a Windows job in CI | [[spec/rationales/go-holds-the-core]] |
| the index and its processes speak NATS, with the server inside the index | [[spec/rationales/the-processes-speak-nats]] |
| the editor starts `quack lsp`, which relays stdio to the `lsp` IO module | [[spec/rationales/the-editor-starts-quack-lsp]] |

# The build holds the rules

- IO modules alone cross the boundary, and each carries its fake.
- An IO module reaches another module through the index alone, and a renderer imports no module. They see the registry, so they special-case no name.
- A writer alone writes its name. Actions change files, and the `watch` IO module alone writes `files/`.
- A module without the flag talks to the index alone. It reads contents from `files/`, and names the requests its action commits, which the index runs.
- A view reads names. It decides how things look, and the providers decide what they mean.
- The index refuses to start on a broken catalog, and CI starts it.

An IO module or a renderer special-casing one name brings back the eleven-file
change. So a check over the imports holds these rules in the build.

# What the agent meets

| the task | today | in the model |
|---|---|---|
| finding where a value comes from | a search across two languages | `quack why`, naming the provider and its file |
| changing what a value means | every reader computing it | the one provider file and its test |
| adding a tool or a command | a verb, a tool spec and a handler | one action, which every surface picks up |
| calling quackitect | a shell verb, and a parse of its output | a tool call the index answers |
| testing | a fake a case writes | a fake index for a module, the fake each IO module brings, and a generic case over every name |
| a ticket's scope | a review reading the files a change reaches | one topic folder, which level zero can hold |

Changing the index, the protocol or a renderer stays broad work, in tickets of
its own.
