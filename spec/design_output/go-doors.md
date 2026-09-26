---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

The doors of the model, in Go. This note covers one file a door with its fake,
the inbound replay, the doors process, and the import rules the build checks.
The JavaScript doors standing today, and the rules they hold, stand in
[[spec/design_output/doors]]. A fake that behaves and a contract test per door
carry over as they stand there.

# A door is one file

Each door is one Go file under `doors/in` or `doors/out`, and the file holds
these parts:

| the part | what it is | the disk door |
|---|---|---|
| the interface | the verbs the inside calls | `Disk` |
| the real one | the implementation reaching the outside | `disk` |
| the fake | an implementation in memory, which behaves | `FakeDisk` |
| the registration | an `init` handing both to `doors.Register` | `doors.Register("disk", newDisk, NewFakeDisk)` |

A contract test stands beside it, `disk_contract_test.go`. It runs one list of
cases over the real door and the fake, and asserts the same answers. The build
tag `contract` holds it, because it touches the outside, and the check runs
every tag.

# The outbound doors

| the door | reaches | its fake answers from |
|---|---|---|
| `disk` | the files | a map keyed by the forward-slash path, on every platform |
| `proc` | a program | a table of commands, and a command outside it fails naming the door |
| `git` | a repository, over `proc` | the fake `proc`, with the git commands in its table |
| `clock` | the time, and `clock/minute` | a time that stands still until a test calls `Tick` |
| `watch` | changes to the files, which feed `files/` | a change the test pushes |
| `vale` | the prose rules, over `proc` | a table of findings by file |
| `biome` | the JavaScript format and lint, over `proc` | a table of findings by file |

A door standing on another takes it as an argument, so the fake beneath stands
in for the one above.

# An inbound fake replays

An inbound door turns the outside's traffic into calls on the bus: a read, a
watch, an action. Every call carries the session id of its caller.

Its fake replays a recording. A recording is a JSONL file under
`test/replay/<door>`. Each line holds a call as the outside sends it, and the
answer the door gives. The replay drives the real door over an index in memory,
with every outbound door at its fake, and asserts each answer.

| the door | what a recording holds |
|---|---|
| `hooks` | the hook events of a session, and each decision |
| `lsp` | the LSP messages of an editor, and each reply |
| `mcp` | the tool calls of an agent, and each result |
| `http` | the requests, and each response |
| `sse` | the subscriptions, and the events each one takes |

A session log at `debug` carries every inbound call, so a recording comes off
a real session. The event-to-decision tests of the bridge become these
replays, per [[spec/design_output/migration#the-tests-after-the-move]].

# The doors process

`quack doors` runs every door in one process, and the index supervises it:

| the side | what the process does |
|---|---|
| inbound | listens for HTTP, SSE and MCP on one loopback port, takes `quack hook` and `quack lsp` over the bus, and calls the index |
| outbound | answers `door.<door>.<verb>` on the bus, for every module process and the index |

A module process reaches disk and git through this process alone, so the
operating system holds the boundary. For the processes, see
[[spec/design_input/the-index-holds-the-model#the-system-places-the-processes]].

A run picks each real door, and a test builds the doors in memory with
`doors.Fakes()`. No switch stands between a run and a test.

# The build checks imports

A `go/analysis` pass holds the rules of
[[spec/design_input/the-index-holds-the-model#the-build-holds-the-rules]]. The
check runs it on Linux and Windows:

| the analyzer | what it refuses |
|---|---|
| `doorsonly` | an import of `os`, `os/exec`, `net` or `net/http`, and a call to `time.Now`, outside `doors/` |
| `fakebeside` | a door file whose package holds no fake for its interface |
| `noname` | an import of a package under `modules/` from `doors/`, `index/` or a renderer |
| `fakeintest` | a test under `modules/` building a real door |

The analyzers replace `DoorsOnly`, `FakeDoorsInTest` and `OutsideInDoors` for
the Go code, and the Vale rules keep the JavaScript that stays.
