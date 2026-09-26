---
kind: [[design_input]]
---

# Scope

The owner asks that the index become the one model of this tree. One process
owns every value quackitect knows. Modules compute values, and doors reach the
outside. The sidebar, the window, the command line, the hooks and any script
read a value by its name, and none of them computes it.

The page beside this note carries the drawings of the model:
[the-index-holds-the-model.html](the-index-holds-the-model.html).

The asks, one to a line:

- Let the index own every value, with the files as one topic in it, `files/`.
- Give each name one provider and a default.
- Hand a provider one snapshot in, let it work pure, and take one commit out.
- Answer, for any name, who writes it, who reads it and where it comes from.
- Put a door on each side of the boundary, one file each, with its fake inside.
- Keep a module to one file that registers itself.
- Build every surface from the registry: the command line, the window, the sidebar, HTTP and MCP.
- Declare the views, and let one renderer draw every one of them.
- Hand every longer action a handle, and keep recent ones.
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

# One owner per name

| the rule | what it gives |
|---|---|
| each name has one provider and a default | no value stands computed in two places, so two numbers cannot disagree |
| an alternative provider lives in a file of its own, and config picks one at start-up | a box chooses its calculation, and the name stays one |
| the index adds no name at runtime | the catalog a reader sees is the whole catalog |
| the index refuses to start on a broken catalog: a name twice, a default missing, two providers active | the fault shows at start, and the check starts the index, so it shows before a merge |

# Input, processing, output

A provider or an action declares its inputs up front, as a struct whose fields
name the values they read:

    type openTasksIn struct {
        Places Places `q:"work/places"`
    }

| the stage | what holds |
|---|---|
| input | the index hands one snapshot of every input, taken at one revision of the model |
| processing | pure: it reads the struct alone, and calls no index |
| output | one atomic commit: the names it provides, or the list of door calls an action makes |

A run reads no old value beside a new one, and it costs one round trip. Its
output carries the revision it comes from, and a change during the run starts
the next run.

| what a module provides | what it answers |
|---|---|
| a derived value, `q.Derived` | a function of its inputs |
| a fold, `q.Fold` | a value reduced over the events of `session/`, one event at a time |
| an action | an ordered list of door calls, each with its undo step |

# The wiring analyzer

Declared inputs make the whole wiring known before anything runs. The index
keeps the file and the line of each registration. `quack why <name>` answers
the provider and its file, the inputs down to the files, git and the events,
and every reader:

    $ quack why work/open-tasks
    work/open-tasks = 3                 provided by work.local
      provider   modules/work/open_tasks.go:9
      reads      work/places            modules/work/places.go:14
                   reads tickets/*      modules/tickets/ticket.go:22
      read by    the sidebar badge, the work view header

The same answer stands as an agent tool and as a view in the window's index tab.

# Doors on both sides

A door is anything crossing the boundary, so each one stands half inside and
half outside.

| the side | the doors |
|---|---|
| inbound, the outside reaching quackitect | LSP, hooks, MCP, HTTP, SSE |
| outbound, quackitect reaching the outside | disk, git, processes, the clock, file watching, Vale, Biome |

A door is one file: an interface, the real implementation and a fake. The doors
process picks the real one in use and the fake in a test. An outbound fake
answers from a table, and an inbound fake replays traffic a recording holds, such as a
hook event or an HTTP call. A new adapter is one more file, and the index and
the modules stay as they stand.

    quackitect/
      index/          the model, supervision, files/
      doors/in/       lsp.go  hooks.go  mcp.go  http.go  sse.go
      doors/out/      disk.go  git.go  proc.go  clock.go  watch.go  vale.go  biome.go
      modules/        one folder a topic: work/  pull/  check/  retro/ ...

# A module is one file

A topic folder is one module. A new file in `modules/work/` joins the
work package at its next build, and its `init` registers the name. The module
names no HTTP library, no MCP and no editor, because only the doors know those.

    var OpenTasks = q.Derived("work/open-tasks", 0,
        q.Doc("The tickets this box can take."),
        q.Show(q.Badge{On: "work/editor"}),
        func(in openTasksIn) (int, error) {
            return in.Places.Takeable, nil
        })

# The registry builds each surface

That one file reaches every surface, and no surface names it:

| the surface | what the file gives it |
|---|---|
| the command line | `quack get work/open-tasks`, with help from `q.Doc` |
| the HTTP door | `GET /v1/values/work/open-tasks`, typed in the OpenAPI 3.1 document and on `/docs`, through Huma |
| the SSE door | a stream that pushes on change alone |
| the hook module and the MCP door | a tool Claude, Copilot and every other agent reads |
| the editor | the badge on the work editor button |
| the window | the value and its help in the index tab |
| the start-up check | a unique name, a default, one provider |

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
| `index` | every name with its value and provider, and whether a provider answers it or it stands at its default |
| `cli` | the command tree, and a form built from an action's input, with the command line it runs |
| `help` | the help |

# Operations carry a handle

An action taking longer than a moment returns a handle at once: a name in the
index, `ops/<id>`, with its state, progress, deadline and result.

| the rule | what holds |
|---|---|
| callback or poll | a caller watches `ops/<id>` or reads it, the way it reads every name |
| states | `queued`, `running`, then `done`, `failed` or `cancelled`, and the index pushes each move |
| the deadline | the watchdog ends a late operation loudly as a failure, and its undo steps run |
| one writer | writing operations queue one at a time per tree, so a git hook calling back waits in line |
| the caller | an operation outlives it, and another client reads the result |
| retention | the running and queued ones stay, finished ones stay for a window config sets, a failure stays longer, and the session log keeps every change |
| reads | a read takes no handle, and the cage's answer inside a hook stays synchronous |

They carry the name operations, because a ticket names the work here.

# Every part holds a lease

A part that stops working reads as stopped. Every process, door and provider
holds a lease its own work loop renews.

| the rule | what holds |
|---|---|
| the heartbeat | comes from the work loop, so a hung loop beside a ticking timer still reads as dead |
| the deadline | a provider with a pending input commits within it, and an action finishes within it, or the watchdog cancels the run and restarts the process |
| silence | every name of an expired provider reads `stale since <time>`, the badge greys, and `quack why` says so |
| escalation | the index restarts a process, waiting longer each time. Past a run of faults it raises `session/alarms`, which the sidebar shows and the hook module hands the agent |
| the watcher of the watchdog | the doors process and the hook module watch the index's lease, and restart it |
| declaration | each name and action declares its deadline, `q.Deadline`, and each kind carries a default |

While the index stands down, the cage refuses, and the refusal names the alarm.
For the argument, see [[spec/rationales/the-cage-refuses-while-down]].

# The system places the processes

Three kinds of process run: one for the doors, one for the index, and one a
module topic. Go spreads its work over every core in one process already, so
the split buys isolation:

- A crash stays in its module, and the index shows that module's names at their defaults, with no provider answering, until it restarts.
- A changed module rebuilds and restarts alone, and the index stays warm.
- The operating system holds the boundary, because a module process reaches disk and git through the doors process alone.

Every read of a module crosses a local socket, and the index supervises the
processes. Where each module runs is the system's choice. An author writes one
file, and a user starts one program.

# The languages and the platforms

| the ruling | where it stands |
|---|---|
| Go is the core, and JavaScript stays where the host runs JavaScript alone: the extension and the hook module | here |
| the index reads SQLite through the pure Go driver | [[spec/rationales/the-index-drops-cgo]] |
| the Go code stands in one module | [[spec/rationales/go-stands-as-one-module]] |
| git is the archive and the transport, and a group in the cloud carries `cloud: true` on `main` | [[spec/rationales/git-stays-the-archive]] |
| Linux and Windows behave the same: loopback TCP and the standing file, no Unix socket and no named pipe, and a Windows job in CI | here |

# The build holds the rules

- Doors alone cross the boundary, and each door carries its fake.
- Doors and renderers import no module. They see the registry, so they special-case no name.
- A provider alone writes its name. Actions change files, and the watch door alone feeds `files/`.
- A module touches nothing outside. It reads contents from `files/`, and calls a door to act.
- A view reads names. It decides how things look, and the providers decide what they mean.
- The index refuses to start on a broken catalog, and CI starts it.

A door or a renderer special-casing one name brings back the eleven-file
change. So a check over the imports holds these rules in the build.

# What the agent meets

| the task | today | in the model |
|---|---|---|
| finding where a value comes from | a search across two languages | `quack why`, naming the provider and its file |
| changing what a value means | every reader computing it | the one provider file and its test |
| adding a tool or a command | a verb, a tool spec and a handler | one action, which every surface picks up |
| calling quackitect | a shell verb, and a parse of its output | a tool call the index answers |
| testing | a fake a case writes | the fake each door brings, and a generic case over every name |
| a ticket's scope | a review reading the files a change reaches | one topic folder, which level zero can hold |

Changing the index, the protocol or a renderer stays broad work, in tickets of
its own.
