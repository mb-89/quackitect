---
kind: [[design_input]]
---

# Scope

The owner asks for a language server of the tree's own, standing beside
`vale-ls` and Biome. The owner asks for one verb that asks all three whether a
path is fine. The two outside servers stay, because each one checks what it
checks well, and the tree's server holds what neither of them can.

The asks, one to a line:

- Keep `vale-ls` for the prose rules and Biome for the code and its format.
- Add a third server for the note shape, the rules over two files and the
  names, and draw its findings live in the editor.
- Give the tree one verb that asks every server and prints one list.
- Run the server as its own process, built beside the index, in parallel.
- Let a later engine ask the index and the server on their own ports.
- Say in the handback how a person starts it in VS Code.

# One door for one thing

A person and an agent each meet one door. `./RUNME.sh lint <path>` is that
door on the command line, and the write door is that door at a write. Both
ask every server the tree runs and hand back one list of findings, in one
shape, whichever server answers each one.

# Only what the others cannot

The server holds a check where `vale-ls` and Biome hold none:

| check | why the others cannot |
|---|---|
| a note against the schema its `kind` names | Vale reads one file and knows no kind |
| a link reaching nothing | it takes the tree |
| a name past the cap, a file, a folder or a branch | Vale reads content, and a path stays outside it |
| two files that have to agree, the settings and the binaries | it takes two files |
| a projection standing stale | it takes the source and the target |

A check Vale or Biome can hold stays with them. The paragraph layers stay a
projection into Vale, and the code stays with Biome.

# Its own process

The server is a Go program under `src`, in a module of its own, with no cgo.
It builds in seconds, in parallel with the index, and a box with no C compiler
still gets it. It answers over stdio for the editor and over a loopback port
for a door. It writes where it stands into `.se`, the way the index does.

The index and the server stay two programs. An engine, when one comes, asks
each on its port.

# What the handback carries

The branch that builds it ends with the steps a person takes to start the
server in VS Code on a fresh clone. The steps also say how they see that it
runs.
