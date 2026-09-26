---
kind: [[funnel]]
about: how the index speaks to its own processes, and how the editor reaches the LSP door
---

# Scope

The model in [[spec/design_input/the-index-holds-the-model]] runs the doors,
the index and each module topic as processes of their own. Every peer inside is
Go, and the doors translate for the outside, so the outside sees none of this.
Two questions stay open, and [[spec/tickets/the-inner-protocol-gets-chosen]]
answers both in phase 0 of [[spec/design_input/the-migration-runs-in-slices]].

# Streams over `gRPC`

| what it gives | what it costs |
|---|---|
| typed calls and streams, with no broker | a schema file and a code generator in the build |
| a watch is a server stream | each peer dials the index, and the index tracks them |

# NATS, inside the index

| what it gives | what it costs |
|---|---|
| names as subjects, and request, reply and watch built in | a library the index carries, and its own view of delivery |
| a new process subscribes and needs no table of peers | the types ride on top, in the tree's own code |

# The LSP door

VS Code starts its language server itself.

| the shape | what it costs |
|---|---|
| a thin `quack lsp` relays stdio into the doors process | one more small program on the box |
| the extension connects to the doors process's port | the extension learns a port, which the standing file names |

# What stands open

| the question | what hangs on it |
|---|---|
| the protocol between the index and its processes | phase 1's `q` core and every module after it |
| how the editor reaches the LSP door | phase 7 |

The answer lands as a rationale, and this note closes.
