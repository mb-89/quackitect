---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-one-binary-published-through-every-channel
type: "[[option]]"
statement: Ship one self-contained executable that needs no runtime on the machine, and publish that same executable through every channel people already use rather than choosing one.
cluster: the-bootstrap
question: how the product reaches a machine that has nothing on it
found_by: prior-art
source: "live scan at i9's candidates gate, 2026-08-19 — what a self-contained binary and a multi-channel release actually look like in tools with users"
---

## Mechanism

TWO DECISIONS THAT ARE USUALLY CONFUSED, SEPARATED. What ships is a binary.
How it arrives is a channel. They are independent, and the scan found that the
tools people actually use pick a binary and then publish it several ways at
once.

CLAUDE CODE IS THE WORKED EXAMPLE. One native binary, published through a piped
installer, a Homebrew cask, a WinGet package, signed apt, dnf and apk
repositories, and an npm package that carries a per-platform binary. Plus a
read-only `claude doctor` for checking the result.

THE SAME SHAPE IS EVERYWHERE ELSE. ripgrep, fd, hugo, the GitHub CLI,
Terraform, kubectl, Caddy, esbuild, Deno, Bun and uv all ship one executable
with no runtime dependency.

## What it buys against the demands this iteration carries

A FRESH MACHINE NEEDS NOTHING FIRST. That is the point of a self-contained
binary, and it is the only cell on this row that meets the editor-and-shell
floor without an assumption underneath it.

THE PERSON USES THE CHANNEL THEY ALREADY HAVE, so the install command is one
they already know and the uninstall works.

## What it costs

A BUILD MATRIX AND CODE SIGNING. Microsoft's own guidance prices Windows
signing at roughly ten dollars a month for Azure Artifact Signing, or one to
four hundred a year for a certificate, and since 2024 the expensive certificate
no longer buys an instant SmartScreen bypass. macOS wants notarisation.

A RELEASE PIPELINE PER CHANNEL, each with its own review queue and its own lag.
Homebrew and WinGet do not auto-update, so the channels drift apart and the
documentation has to say which one self-updates.

## Where it fails, from the scan rather than from theory

GLIBC VERSION SKEW. A binary built on a newer distribution fails on an older
one with a missing-symbol error, and Go's own tracker carries it.

STATIC IS OFTEN NOT STATIC. Go's user and network lookups call the system C
library, so the binary quietly becomes dynamically linked.

AND FOR OUR RUNTIME IT IS NOT READY. Node's single-executable feature is still
marked active development, is tested on one platform pair, and excludes Alpine.
Python's bundler explicitly does not bundle system libraries. So this cell is
cheap for a Go or Rust tool and expensive for ours.

## The fact that may make this whole row smaller than it looks

THE EDITOR'S EXTENSION HOST IS ITSELF A NODE PROCESS. An extension written in
TypeScript needs no runtime installed at all, and the install problem exists
only for a separate-process or native backend.

THAT IS NOT A CELL, IT IS A CONSTRAINT ON THE ROW, and it deserves checking
against our own shape before any line here is built on.

## Nothing on the chart picks this

RECORDED AS AN UNVISITED CELL. It arrived from a scan at the gate rather than
from a finder, after every line had already taken its pick, and re-picking a
line to suit a late cell would be composing toward a score.

IT IS THE CELL A FOURTH LINE WOULD BE BUILT ON, and whoever draws that line
should start from the constraint above rather than from this option.
