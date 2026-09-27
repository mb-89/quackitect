---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

How the index speaks to its own processes, and how the editor reaches the LSP
door. Every peer here is Go, in one module, and the doors translate for the
outside. For the argument, see [[spec/rationales/the-processes-speak-nats]] and
[[spec/rationales/the-editor-starts-quack-lsp]]. Both stand as proposals (h)
and (i) in [[spec/funnel/the-owner-rules-the-specs]], and the chunks as (j).

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
| `val.<name>` | publish: each new value with its revision, and the revision of the value before it | the index, on every commit |
| `sum.<topic>` | publish: every name of the topic with its revision, each resync span | the index |
| `run.<provider>` | publish: an input of the provider moves, with the revision the next snapshot stands at | the index sends it, and the module process holding the provider takes it |
| `in.<provider>` | request and reply: one snapshot of a provider's inputs | the index |
| `commit.<provider>` | request and reply: the names a run provides, or the list of door calls an action answers, and the revision it reads | the index takes it, runs the door calls, and starts the next run where an input moves |
| `act.<name>` | request and reply: an action's input in, its handle or result out | the index, which runs the action through its module process |
| `door.<door>.<verb>` | request and reply: one door call | the doors process answers, and the index alone sends one |
| `lease.<part>` | publish: a heartbeat off the part's work loop | the index listens |

A module process subscribes to `run.` for its own providers alone, and sends
`in.`, `commit.` and `lease.`. It sends no `door.` request, so a module reaches
the outside through the index alone, per
[[spec/design_output/model#a-module-meets-the-index]].

A watch is a subscription. `val.work.>` watches every name under `work/`.

# A message carries types

The payload is JSON of a Go struct the `q` package declares, so every peer
reads the same type off the same source. A header carries the revision, the
session id of the inbound call, and the deadline.

The header carries the stamp of the `q` package too. The index refuses a peer
whose stamp differs from its own, so both ends of a message read one set of
types. A module rebuilt alone keeps the stamp, per
[[spec/design_output/processes#a-module-rebuilds-alone]].

# A push names its predecessor

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

# Large values ride in chunks

The NATS server caps a message's payload, and a file under `files/` or a
snapshot can run past it. The index sets the server's cap from `bus.maxPayload`,
and a value past `bus.chunk` rides in chunks:

| the step | what holds |
|---|---|
| a push | `val.<name>` carries the revision and the count of chunks, and leaves the value out |
| a read | the reply to `get.<name>` carries the first chunk and the count, and the rest follow on the same reply subject, each numbered |
| a chunk missing | the reader asks again, and takes the value whole or not at all |

A snapshot on `in.<provider>` rides the same way. The foundation adds each key
and its default to `spec/config/level0.json`.

# The editor starts `quack lsp`

VS Code starts `quack lsp` as its language server, over stdio. The command
relays stdio over a plain TCP stream to the doors process, which holds the LSP
door. An LSP message rides that stream alone and stays off the bus. Core NATS
drops a message where a subscriber falls behind, and the LSP reads every message
in order.

| the step | what holds |
|---|---|
| start | `quack lsp` reads the standing file, and starts the index and the doors where none answers |
| connect | it dials the LSP port the standing file names, on loopback, with the token |
| relay | each LSP message rides whole, and the command parses none of it |
| end | the editor closing stdio ends the command, and the doors process stays for the next client |

The extension learns no port. Any editor starting a language server by command
reaches the same door.
