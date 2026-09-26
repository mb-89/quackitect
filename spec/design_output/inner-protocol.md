---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

How the index speaks to its own processes, and how the editor reaches the LSP
door. Every peer here is Go, in one module, and the doors translate for the
outside. For the argument, see [[spec/rationales/the-processes-speak-nats]] and
[[spec/rationales/the-editor-starts-quack-lsp]].

# The index runs NATS

The index process runs a NATS server inside itself, and every other process
dials it as a client. The server listens on loopback TCP alone, on a port the
operating system picks, and the standing file names the port and a token.

| the peer | what it does on the bus |
|---|---|
| the index | runs the server, answers reads, takes commits, pushes changes |
| a module process | subscribes to its inputs, answers its actions, publishes its commits |
| the doors process | answers the door calls, and relays the outside onto the bus |
| `quack` | dials the port the standing file names, and starts the index where none answers |

The server stores nothing: no JetStream, and no disk. The index owns every value,
so a message that goes missing gets read again from the index.

# Names become subjects

A name's segments become a subject's tokens: `work/open-tasks` rides as
`work.open-tasks`. A verb token goes in front.

| the subject | the shape | who answers |
|---|---|---|
| `get.<name>` | request and reply: the value, its revision, and whether it stands stale | the index |
| `val.<name>` | publish: each new value with its revision | the index, on every commit |
| `in.<provider>` | request and reply: one snapshot of a provider's inputs | the index |
| `commit.<provider>` | request and reply: the names a run provides, and the revision it reads | the index takes it, and starts the next run where an input moves |
| `act.<name>` | request and reply: an action's input in, its handle or result out | the module process holding the action |
| `door.<door>.<verb>` | request and reply: one door call | the doors process |
| `lease.<part>` | publish: a heartbeat off the part's work loop | the index listens |

A watch is a subscription. `val.work.>` watches every name under `work/`.

# A message carries types

The payload is JSON of a Go struct the `q` package declares, so every peer
reads the same type off the same source. A header carries the revision, the
session id of the inbound call, and the deadline.

The header carries the build stamp too. The index refuses a peer whose stamp
differs from its own, so both ends of a message build from one commit.

A subscriber missing a push sees a gap in the revisions, and sends a `get` for
the name. So a push that goes missing costs one round trip, and no value stays
wrong.

# The editor starts `quack lsp`

VS Code starts `quack lsp` as its language server, over stdio. The command
relays stdio onto the doors process, which holds the LSP door.

| the step | what holds |
|---|---|
| start | `quack lsp` reads the standing file, and starts the index and the doors where none answers |
| relay | each LSP message rides whole, and the command parses none of it |
| end | the editor closing stdio ends the command, and the doors process stays for the next client |

The extension learns no port. Any editor starting a language server by command
reaches the same door.
