---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

How the system places the processes. This note covers the start of the index,
the spawn of the doors and each module, the standing file, and a module that
rebuilds alone. For the argument, see [[spec/rationales/modules-run-apart]].

# One binary, many processes

`quack` is the one binary, and every process runs it with a verb:

| the process | the command | what it runs |
|---|---|---|
| the index | `quack index` | the model, the NATS server, supervision, `files/` and SQLite |
| the doors | `quack doors` | every door, per [[spec/design_output/go-doors#the-doors-process]] |
| a module | `quack module <topic>` | the registrations of the topics it names |

The binary holds every module, and a module process runs the topics its
command names. So an author writes one file, and a person starts one program.

# The start

| the step | what holds |
|---|---|
| a caller runs `quack start`, or any verb that needs the index | it reads the standing file, and asks the index for `index/health` |
| no answer | it starts `quack index` apart from itself, and waits for the standing file |
| the index starts | it checks the catalog, starts the bus, and writes the standing file |
| the index spawns | the doors process, then one process a placement |

The same road runs on Linux and Windows: a detached process, loopback TCP, and
no signal. `quack stop` asks the index over the bus, and the index stops the
modules, the doors and then itself.

# The standing file

`.se/.runtime/standing.json` names what a peer needs to dial:

| the field | what it holds |
|---|---|
| `bus` | the port of the NATS server |
| `http` | the port of the doors process, for HTTP, SSE, MCP and the hook module |
| `token` | the secret each peer shows |
| `pid` | the process of the index |
| `stamp` | the stamp of the `q` package the index runs |

The index writes it once the bus stands, and removes it when it stops. A file
whose `pid` runs nowhere reads as absent.

# The placements

The config key `processes.placements` lists the placements, each a list of
topics that share a process. A topic in no list gets a process of its own.
A placement changes where a topic runs, and no file of the topic.

# A process ends

| what the index meets | what it does |
|---|---|
| a module process exits | its names stand at their defaults, with no provider answering, until the restart |
| a lease expires while the process lives | its names stand stale, per [[spec/design_output/watchdogs#a-stale-mark]] |
| the doors process exits | the index restarts it, and every door call meanwhile fails |

The restarts follow [[spec/design_output/watchdogs#restarts]].

# A module rebuilds alone

The watch door sees a change under `modules/<topic>`, and the index builds the
binary again under `.se/.runtime/bin`, named by its stamp. Then it restarts the
placement holding that topic on the new binary, and the index stays warm.

A change to the `q` package changes its stamp, and the index restarts every
process on the new binary. The config key `processes.rebuild` turns the watch
on, and a cloud box leaves it off.
