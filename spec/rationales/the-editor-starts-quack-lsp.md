---
kind: [[rationale]]
---

# Why

The migration decided this in its specs, and the owner read the call at the
merge. The editor started `quack lsp` over stdio, and the command relayed each
message to the LSP door in the doors process. An agent reads this note before
it asks again.

## 1. What it weighed

| the shape | what it gave | what it cost |
|---|---|---|
| `quack lsp` relays stdio | the way VS Code starts every language server, and any editor with a client takes a command | a relay hop a message, and one small process an editor window |
| the extension dials the port | no relay | the extension learned a port, read the standing file, and reconnected on its own |

## 2. Why the relay won

`quack` was the one binary already, so the relay added a verb and no program. It
started the index and the doors where none answered, the road `quack hook`
took. The extension learned no port and held no reconnection, and an editor
other than VS Code reached the same door.

## 3. What it gave up

Each message crossed one more process on the box. A relay that died ended the
editor's session with the server, and the editor started it again.

## 4. What would make it wrong

A relay hop a person felt while typing, measured on the round trip of a
completion. Or an editor that refused to start a command. The port then won,
and the extension carried the reconnection.
